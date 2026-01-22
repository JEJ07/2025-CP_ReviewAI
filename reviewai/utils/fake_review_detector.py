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

    def get_feature_names(self):
        """Get all feature names used by the models"""
        tfidf_features = self.tfidf_vectorizer.get_feature_names_out().tolist()
        engineered_features = [
            'review_length',
            'sentiment', 
            'length_bucket',
            'kw_fast',
            'kw_recommended',
            'kw_bad',
            'kw_fake',
            'kw_original',
            'kw_authentic'
        ]
        return tfidf_features + engineered_features
    
    def get_rf_feature_importance(self, review_text):
        """
        Get Random Forest's feature importances for a specific review
        
        Args:
            review_text: The review text to analyze
            
        Returns:
            list: Top contributing features with their values and importances
        """
        try:
            # Preprocess and extract features (same as prediction)
            processed_text = self.preprocess_text(review_text)
            text_tfidf = self.tfidf_vectorizer.transform([processed_text])
            extra_features = self._feature_engineering(processed_text, review_text)
            X = sparse.hstack([text_tfidf, sparse.csr_matrix(extra_features)])
            
            # Get feature importances from trained RF model
            feature_importance = self.rf_model.feature_importances_
            feature_names = self.get_feature_names()
            
            # Get this review's feature values
            review_features = X.toarray()[0]
            
            # Find non-zero features (features present in this review)
            important_indices = np.where(review_features != 0)[0]
            
            # Calculate contribution for each feature
            feature_contributions = []
            for idx in important_indices:
                contribution = review_features[idx] * feature_importance[idx]
                if abs(contribution) > 0.0001:  # Threshold for significance
                    feature_contributions.append({
                        'feature': feature_names[idx],
                        'value': float(review_features[idx]),
                        'importance': float(feature_importance[idx]),
                        'contribution': float(contribution)
                    })
            
            # Sort by absolute contribution
            feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
            
            return feature_contributions[:15]  # Top 15 features
            
        except Exception as e:
            logger.error(f"Error getting RF feature importance: {str(e)}")
            return []
    
    def get_svm_feature_contributions(self, review_text):
        """
        Get SVM's feature contributions for a specific review
        
        Args:
            review_text: The review text to analyze
            
        Returns:
            list: Top contributing features with their weights
        """
        try:
            # Preprocess and extract features
            processed_text = self.preprocess_text(review_text)
            text_tfidf = self.tfidf_vectorizer.transform([processed_text])
            extra_features = self._feature_engineering(processed_text, review_text)
            X = sparse.hstack([text_tfidf, sparse.csr_matrix(extra_features)])
            
            # Handle both dense and sparse coefficient formats
            if sparse.issparse(self.svm_model.coef_):
                coef = self.svm_model.coef_.toarray()[0]
            else:
                coef = self.svm_model.coef_[0]
            
            # Get this review's feature values
            review_features = X.toarray()[0]
            
            # Calculate contribution: feature_value * weight
            contributions = review_features * coef
            
            feature_names = self.get_feature_names()
            
            # Get top contributing features (both positive and negative)
            top_positive_indices = np.argsort(contributions)[-10:][::-1]  # Top 10 pushing to FAKE
            top_negative_indices = np.argsort(contributions)[:10]  # Top 10 pushing to GENUINE
            
            result = []
            
            # Add positive contributors (push towards FAKE)
            for idx in top_positive_indices:
                if abs(contributions[idx]) > 0.001:
                    result.append({
                        'feature': feature_names[idx],
                        'value': float(review_features[idx]),
                        'weight': float(coef[idx]),
                        'contribution': float(contributions[idx]),
                        'direction': 'FAKE'
                    })
            
            # Add negative contributors (push towards GENUINE)
            for idx in top_negative_indices:
                if abs(contributions[idx]) > 0.001:
                    result.append({
                        'feature': feature_names[idx],
                        'value': float(review_features[idx]),
                        'weight': float(coef[idx]),
                        'contribution': float(contributions[idx]),
                        'direction': 'GENUINE'
                    })
            
            # Sort by absolute contribution
            result.sort(key=lambda x: abs(x['contribution']), reverse=True)
            
            return result[:15]  # Top 15 features
            
        except Exception as e:
            logger.error(f"Error getting SVM contributions: {str(e)}")
            return []

    def get_distilbert_attention(self, review_text):
        """
        Get DistilBERT's attention weights to see which tokens mattered most
        
        Args:
            review_text: The review text to analyze
            
        Returns:
            list: Top attended tokens with their attention scores
        """
        try:
            distilbert_text = self.preprocess_for_distilbert(review_text)
            
            inputs = self.tokenizer(
                distilbert_text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=128
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                # Request attention outputs
                outputs = self.distilbert_model(**inputs, output_attentions=True)
                
                # Get attention from last layer
                # Shape: [batch_size, num_heads, seq_len, seq_len]
                attentions = outputs.attentions[-1][0]  # Get first (only) batch item
                
                # Average across all attention heads
                # Shape: [seq_len, seq_len]
                avg_attention = attentions.mean(dim=0)
                
                # Get attention TO the [CLS] token (classification token)
                # This shows what tokens influenced the final classification
                cls_attention = avg_attention[0]  # First token is [CLS]
                
                # Convert token IDs to tokens
                tokens = self.tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
                
                # Pair tokens with attention scores
                token_importance = []
                for i, (token, attn_score) in enumerate(zip(tokens, cls_attention)):
                    # Skip special tokens
                    if token not in ['[CLS]', '[SEP]', '[PAD]']:
                        # Remove ## from subword tokens
                        clean_token = token.replace('##', '')
                        token_importance.append({
                            'token': clean_token,
                            'attention': float(attn_score),
                            'position': i
                        })
                
                # Sort by attention score (highest first)
                token_importance.sort(key=lambda x: x['attention'], reverse=True)
                
                return token_importance[:10]  # Top 10 most important tokens
                
        except Exception as e:
            logger.error(f"Error getting DistilBERT attention: {str(e)}")
            return []

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
            prediction_idx = np.argmax(ensemble_proba)
            confidence = float(np.max(ensemble_proba))
            
            final_prediction = self.classes[prediction_idx]
            
            prob_genuine = float(ensemble_proba[0])
            prob_fake = float(ensemble_proba[1])
            
            svm_prob_genuine = float(svm_proba[0])
            svm_prob_fake = float(svm_proba[1])
            
            rf_prob_genuine = float(rf_proba[0])
            rf_prob_fake = float(rf_proba[1])
            
            distilbert_prob_genuine = float(distilbert_proba[0])
            distilbert_prob_fake = float(distilbert_proba[1])

            result = {
                'prediction': final_prediction,
                'confidence': confidence,
                'probabilities': {
                    'genuine': prob_genuine,
                    'fake': prob_fake
                },
                'individual_predictions': {
                    'svm': {'genuine': svm_prob_genuine, 'fake': svm_prob_fake},
                    'rf': {'genuine': rf_prob_genuine, 'fake': rf_prob_fake},
                    'distilbert': {'genuine': distilbert_prob_genuine, 'fake': distilbert_prob_fake}
                },
                'cleaned_text': processed_text
            }
            
            return result

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