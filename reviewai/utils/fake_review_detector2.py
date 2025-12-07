import json
import pickle
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import joblib
import os
import logging
from django.conf import settings
from django.core.cache import cache
from textblob import TextBlob
from scipy import sparse

logger = logging.getLogger(__name__)

class FakeReviewDetector:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FakeReviewDetector, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        try:
            self.model_folder = os.path.join(settings.BASE_DIR, 'reviewai', 'ml_models')
            self.device = torch.device('cpu')
            logger.info(f"Using device: {self.device}")

            # Load config
            config_path = os.path.join(self.model_folder, 'ensemble_config.json')
            if not os.path.exists(config_path):
                raise FileNotFoundError(f"Configuration file not found: {config_path}")
            with open(config_path, 'r') as f:
                self.config = json.load(f)

            self._load_traditional_models()
            self._load_distilbert_model()

            self.weights = np.array(self.config['weights'])
            self.classes = self.config['label_mapping']['classes']
            self.keywords = ['fast', 'good', 'recommended', 'bad', 'scam', 'fake', 'original', 'authentic']

            self._initialized = True
            logger.info("Fake Review Detector loaded successfully!")

        except Exception as e:
            logger.error(f"Error initializing FakeReviewDetector: {str(e)}")
            raise

    def _load_traditional_models(self):
        try:
            svm_path = os.path.join(self.model_folder, 'svm_model_significant.pkl')
            rf_path = os.path.join(self.model_folder, 'rf_model_significant.pkl')
            tfidf_path = os.path.join(self.model_folder, 'tfidf_vectorizer_new_length_2.pkl')

            for path, name in [(svm_path, 'SVM'), (rf_path, 'Random Forest'), (tfidf_path, 'TF-IDF')]:
                if not os.path.exists(path):
                    raise FileNotFoundError(f"{name} model file not found: {path}")

            self.svm_model = joblib.load(svm_path)
            self.rf_model = joblib.load(rf_path)
            self.tfidf_vectorizer = joblib.load(tfidf_path)

            logger.info("Traditional ML models loaded successfully")

        except Exception as e:
            logger.error(f"Error loading traditional models: {str(e)}")
            raise

    def _load_distilbert_model(self):
        try:
            distilbert_path = os.path.join(self.model_folder, 'finetuned_distilbert_model')
            if not os.path.exists(distilbert_path):
                raise FileNotFoundError(f"DistilBERT model directory not found: {distilbert_path}")

            self.tokenizer = AutoTokenizer.from_pretrained(distilbert_path)
            self.distilbert_model = AutoModelForSequenceClassification.from_pretrained(
                distilbert_path,
                torch_dtype=torch.float32,
                device_map=None,
                low_cpu_mem_usage=True
            )
            self.distilbert_model.to(self.device)
            self.distilbert_model.eval()
            for param in self.distilbert_model.parameters():
                param.requires_grad = False

            logger.info("DistilBERT model loaded successfully")

        except Exception as e:
            logger.error(f"Error loading DistilBERT model: {str(e)}")
            raise


    def preprocess_text(self, text):
        if not isinstance(text, str):
            return ""
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        text = re.sub(r'\s+', ' ', text).strip().lower()
        text = re.sub(r'[^\w\s\.\,\!\?\/\:]', ' ', text)
        
     ##   text = re.sub(r'\s+\d+\s*$', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def preprocess_for_distilbert(self, text):
        if not text or not isinstance(text, str):
            return ""
        text = str(text)
        emoji_pattern = re.compile(
            "[" 
            "\U0001F600-\U0001F64F"
            "\U0001F300-\U0001F5FF"
            "\U0001F680-\U0001F6FF"
            "\U0001F1E0-\U0001F1FF"
            "\U00002700-\U000027BF"
            "\U0001F900-\U0001F9FF"
            "\U00002600-\U000026FF"
            "\U0001F170-\U0001F251"
            "]+", flags=re.UNICODE
        )
        text = emoji_pattern.sub(' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _feature_engineering(self, processed_text, raw_text):
        # Review length
        review_length = len(processed_text.split())
        # Sentiment
        sentiment = TextBlob(processed_text).sentiment.polarity
        # Length bucket
        if review_length <= 3:
            length_bucket = 0
        elif review_length <= 6:
            length_bucket = 1
        elif review_length <= 12:
            length_bucket = 2
        else:
            length_bucket = 3
        # Only keep significant keywords
        significant_keywords = ['fast', 'recommended', 'bad', 'fake', 'original', 'authentic']
        keyword_flags = [1 if kw in processed_text else 0 for kw in significant_keywords]
        # Stack features
        extra_features = np.array([review_length, sentiment, length_bucket] + keyword_flags).reshape(1, -1)
        return extra_features

    def predict_single_review(self, review_text):
        try:
            if not review_text or not isinstance(review_text, str):
                raise ValueError("Review text must be a non-empty string")

            processed_text = self.preprocess_text(review_text)
            distilbert_text = self.preprocess_for_distilbert(review_text)
            if not processed_text:
                raise ValueError("Review text becomes empty after preprocessing")

            # Feature engineering for SVM/RF
            text_tfidf = self.tfidf_vectorizer.transform([processed_text])
            extra_features = self._feature_engineering(processed_text, review_text)
            X = sparse.hstack([text_tfidf, sparse.csr_matrix(extra_features)])

            # SVM and RF probabilities
            svm_decision = self.svm_model.decision_function(X)
            # Softmax for binary SVM
            x2 = np.vstack([-svm_decision, svm_decision]).T
            e_x = np.exp(x2 - np.max(x2, axis=1, keepdims=True))
            svm_proba = (e_x / e_x.sum(axis=1, keepdims=True))[0]
            rf_proba = self.rf_model.predict_proba(X)[0]

            # DistilBERT probabilities
            inputs = self.tokenizer(
                distilbert_text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=128
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            with torch.no_grad():
                outputs = self.distilbert_model(**inputs)
                logits = outputs.logits.cpu().detach()
                distilbert_proba = torch.softmax(logits, dim=-1).numpy()[0]
            # Flip label mapping if needed
            if self.config['label_mapping']['distilbert_needs_flip']:
                distilbert_proba = distilbert_proba[[1, 0]]

            # Ensemble prediction
            ensemble_proba = (
                self.weights[0] * svm_proba +
                self.weights[1] * rf_proba +
                self.weights[2] * distilbert_proba
            )
            prediction = np.argmax(ensemble_proba)
            confidence = float(np.max(ensemble_proba))

            return {
                'prediction': self.classes[prediction],
                'confidence': confidence,
                'probabilities': {
                    'genuine': float(ensemble_proba[0]),
                    'fake': float(ensemble_proba[1])
                },
                'individual_predictions': {
                    'svm': {'genuine': float(svm_proba[0]), 'fake': float(svm_proba[1])},
                    'rf': {'genuine': float(rf_proba[0]), 'fake': float(rf_proba[1])},
                    'distilbert': {'genuine': float(distilbert_proba[0]), 'fake': float(distilbert_proba[1])}
                },
                'cleaned_text': processed_text
            }

        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            raise

    def predict_batch(self, review_texts, batch_size=32):
        if not review_texts:
            return []
        results = []
        for i in range(0, len(review_texts), batch_size):
            batch = review_texts[i:i + batch_size]
            for text in batch:
                try:
                    result = self.predict_single_review(text)
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error processing text in batch: {str(e)}")
                    results.append({
                        'prediction': 'error',
                        'confidence': 0.0,
                        'error': str(e)
                    })
        return results
    
    def get_model_performance(self):
        return {
            'ensemble': {
                'accuracy': 0.94,
                'precision': 0.94,
                'recall': 0.94,
                'f1_score': 0.94,
                'support': 3000,
                'confusion_matrix': [[1384, 116], [75, 1425]],
                'classification_report': {
                    'genuine': {'precision': 0.95, 'recall': 0.92, 'f1-score': 0.94, 'support': 1500},
                    'fake': {'precision': 0.92, 'recall': 0.95, 'f1-score': 0.94, 'support': 1500}
                }
            },
            'svm': {
                'accuracy': 0.87,
                'precision': 0.87,
                'recall': 0.87,
                'f1_score': 0.87,
                'support': 3000,
                'confusion_matrix': [[1320, 180], [196, 1304]],
                'classification_report': {
                    'genuine': {'precision': 0.87, 'recall': 0.88, 'f1-score': 0.88, 'support': 1500},
                    'fake': {'precision': 0.88, 'recall': 0.87, 'f1-score': 0.87, 'support': 1500}
                }
            },
            'random_forest': {
                'accuracy': 0.93,
                'precision': 0.93,
                'recall': 0.93,
                'f1_score': 0.93,
                'support': 3000,
                'confusion_matrix': [[1467, 33], [183, 1317]],
                'classification_report': {
                    'genuine': {'precision': 0.89, 'recall': 0.98, 'f1-score': 0.93, 'support': 1500},
                    'fake': {'precision': 0.98, 'recall': 0.88, 'f1-score': 0.92, 'support': 1500}
                }
            },
            'distilbert': {
                'accuracy': 0.93,
                'precision': 0.93,
                'recall': 0.93,
                'f1_score': 0.93,
                'support': 3000,
                'confusion_matrix': [[1377, 123], [74, 1426]],
                'classification_report': {
                    'genuine': {'precision': 0.95, 'recall': 0.92, 'f1-score': 0.93, 'support': 1500},
                    'fake': {'precision': 0.92, 'recall': 0.95, 'f1-score': 0.94, 'support': 1500}
                }
            }
        }

    def get_model_info(self):
        return {
            'ensemble_config': self.config,
            'model_versions': {
                'svm': 'SVM with RBF kernel',
                'random_forest': 'Random Forest 500 estimators',
                'distilbert': 'Fine-tuned DistilBERT for fake review detection',
                'tfidf': 'TF-IDF Vectorizer (7500 features)'
            },
            'training_data_size': 15000,
            'test_data_size': 3000,
            'features_used': [
                'review_length', 'sentiment', 'length_bucket',
                'kw_fast', 'kw_recommended', 'kw_bad', 'kw_fake', 'kw_original', 'kw_authentic'
            ]
        }

_detector_instance = None

def get_detector():
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = FakeReviewDetector()
    return _detector_instance