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
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Set up logging
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
            # Path to ml_models directory
            self.model_folder = os.path.join(settings.BASE_DIR, 'reviewai', 'ml_models')
            
            self.device = torch.device('cpu')
            logger.info(f"Using device: {self.device}")
            
            # Load configuration
            config_path = os.path.join(self.model_folder, 'ensemble_config.json')
            if not os.path.exists(config_path):
                raise FileNotFoundError(f"Configuration file not found: {config_path}")
                
            with open(config_path, 'r') as f:
                self.config = json.load(f)
            
            self._load_traditional_models()
            
            self._load_distilbert_model()
            
            # Load weights and classes
            self.weights = np.array(self.config['weights'])
            self.classes = self.config['label_mapping']['classes']
            
            self._initialized = True
            logger.info("Fake Review Detector loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error initializing FakeReviewDetector: {str(e)}")
            raise
    
    def _load_traditional_models(self):
        try:
            svm_path = os.path.join(self.model_folder, 'svm_model_mild.pkl')
            rf_path = os.path.join(self.model_folder, 'rf_model_mild.pkl')
            tfidf_path = os.path.join(self.model_folder, 'tfidf_vectorizer_mild.pkl')
            
            # Check if files exist
            for path, name in [(svm_path, 'SVM'), (rf_path, 'Random Forest'), (tfidf_path, 'TF-IDF')]:
                if not os.path.exists(path):
                    raise FileNotFoundError(f"{name} model file not found: {path}")
            
            # Load models
            self.svm_model = joblib.load(svm_path)
            self.rf_model = joblib.load(rf_path)
            self.tfidf_vectorizer = joblib.load(tfidf_path)
            
            logger.info("Traditional ML models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading traditional models: {str(e)}")
            raise
    
    def _load_distilbert_model(self):
        try:
            distilbert_path = os.path.join(self.model_folder, 'distilbert_model')
            
            if not os.path.exists(distilbert_path):
                raise FileNotFoundError(f"DistilBERT model directory not found: {distilbert_path}")
            
            # Load tokenizer
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
        
        # Basic cleaning
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)  # Remove URLs
        
        # Normalize whitespace and convert to lowercase
        text = re.sub(r'\s+', ' ', text).strip().lower()
        
        # Keep only letters, numbers, and basic punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\/\:]', ' ', text)
        
        # Remove standalone numbers at the end
        text = re.sub(r'\s+\d+\s*$', '', text)
        
        # Normalize multiple spaces again
        text = re.sub(r'\s+', ' ', text).strip()
        
        try:
            tokens = word_tokenize(text)
            
            # Filter out stop words but keep meaningful content
            stop_words = set(stopwords.words('english'))
            # Keep numbers and important punctuation
            tokens = [word for word in tokens if word not in stop_words or word.isdigit()]
            
            # Apply lemmatization
            lemmatizer = WordNetLemmatizer()
            tokens = [lemmatizer.lemmatize(word) for word in tokens if word.strip()]
            
        except Exception as e:
            # Fallback to simple split if NLTK fails
            tokens = text.split()
        
        # Final cleanup
        result = " ".join(tokens).strip()
        return result

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
        # Remove emojis only
        text = emoji_pattern.sub(' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def predict_single_review(self, review_text):
        try:
            if not review_text or not isinstance(review_text, str):
                raise ValueError("Review text must be a non-empty string")
            
            # Preprocess text for ML models only
            processed_text = self.preprocess_text(review_text)

            distilbert_text = self.preprocess_for_distilbert(review_text)

            if not processed_text:
                raise ValueError("Review text becomes empty after preprocessing")
            
            # Get traditional ML predictions (use processed text)
            text_tfidf = self.tfidf_vectorizer.transform([processed_text])
            svm_proba = self.svm_model.predict_proba(text_tfidf)[0]
            rf_proba = self.rf_model.predict_proba(text_tfidf)[0]
            
            # Get DistilBERT prediction
            inputs = self.tokenizer(
                distilbert_text,
                return_tensors="pt",
                truncation=True,
                padding=True, 
                max_length=512
            )
            
            # Ensure all inputs are on the correct device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.distilbert_model(**inputs)
                logits = outputs.logits.cpu().detach()
                distilbert_proba = torch.softmax(logits, dim=-1).numpy()[0]
            
            # Apply label mapping fix (flip if needed)
            if self.config['label_mapping']['distilbert_needs_flip']:
                distilbert_proba = distilbert_proba[[1, 0]]
            
            # Create ensemble prediction
            ensemble_proba = (self.weights[0] * svm_proba + 
                            self.weights[1] * rf_proba + 
                            self.weights[2] * distilbert_proba)
            
            prediction = np.argmax(ensemble_proba)
            confidence = np.max(ensemble_proba)
            
            return {
                'prediction': self.classes[prediction],
                'confidence': float(confidence),
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
        
        # Process in batches for memory efficiency
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

    # # Models Information
    # def get_model_info(self):
    #     return {
    #         'svm_classes': len(self.svm_model.classes_),
    #         'rf_classes': len(self.rf_model.classes_),
    #         'tfidf_features': self.tfidf_vectorizer.get_feature_names_out().shape[0],
    #         'distilbert_model': self.distilbert_model.config.name_or_path,
    #         'ensemble_weights': self.weights.tolist(),
    #         'device': str(self.device)
    #     }

# Global instance for Django views
_detector_instance = None

def get_detector():
    """Get or create detector instance (thread-safe)"""
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = FakeReviewDetector()
    return _detector_instance