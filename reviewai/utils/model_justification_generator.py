import logging
from textblob import TextBlob

logger = logging.getLogger(__name__)

class ModelJustificationGenerator:
    def __init__(self, detector_instance):
        self.detector = detector_instance
        
        self.engineered_features = {
            'review_length',
            'sentiment',
            'length_bucket',
            'kw_fast',
            'kw_recommended',
            'kw_bad',
            'kw_fake',
            'kw_original',
            'kw_authentic'
        }
        
        # Common stopwords and punctuation to exclude
        self.stopwords = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'you', 'your', 'if', 'or', 'but',
            'this', 'they', 'we', 'can', 'could', 'would', 'should', 'may',
            'i', 'me', 'my', 'mine', 'am', 'have', 'had', 'do', 'does',
            '.', ',', '!', '?', ':', ';', '-', '_', '(', ')', '[', ']'
        }
    
    def generate_justification(self, review_text, prediction, confidence, cleaned_text=None):
        try:
            justification = {
                'prediction': prediction,
                'confidence': confidence,
                'reasons': [],
                'flags': {},
                'sentiment_analysis': {},
                'feature_importance': {},
                'overall_summary': ''
            }
            
            # Get Random Forest feature importance
            rf_features = self.detector.get_rf_feature_importance(review_text)
            justification['feature_importance']['random_forest'] = rf_features
            
            # Get SVM contributions
            svm_features = self.detector.get_svm_feature_contributions(review_text)
            justification['feature_importance']['svm'] = svm_features
            
            # Get DistilBERT attention
            distilbert_attention = self.detector.get_distilbert_attention(review_text)
            justification['feature_importance']['distilbert'] = distilbert_attention
            
            # Analyze based on prediction
            if prediction.lower() == 'fake':
                justification = self._analyze_fake_from_model(
                    review_text, justification, rf_features, svm_features, 
                    distilbert_attention, confidence
                )
            else:
                justification = self._analyze_genuine_from_model(
                    review_text, justification, rf_features, svm_features,
                    distilbert_attention, confidence
                )
            
            # Generate summary
            justification['overall_summary'] = self._generate_summary(justification)
            
            return justification
            
        except Exception as e:
            logger.error(f"Error generating model-based justification: {str(e)}")
            return {
                'prediction': prediction,
                'confidence': confidence,
                'reasons': ['Unable to generate detailed analysis'],
                'flags': {},
                'overall_summary': 'Analysis completed but details unavailable'
            }
    
    def _is_meaningful_word(self, word):
        """Check if a word is meaningful (not stopword, punctuation, or engineered feature)"""
        word_lower = word.lower()
        return (
            word_lower not in self.stopwords and
            word not in self.engineered_features and
            len(word) > 2 and
            word.isalpha()
        )

    def _analyze_fake_from_model(self, text, justification, rf_features, svm_features, 
                            distilbert_attention, confidence):
        reasons = []
        
        # Initialize flags with default values (always present)
        flags = {
            'extreme_sentiment': False,
            'suspicious_length': False,
            'suspicious_keywords': False,
            'distilbert_attention': False,
            'svm_analysis': False,
            'rf_analysis': False
        }
        
        # Add confidence-based reasoning
        if confidence >= 0.9:
            reasons.append("Strong confidence in fake classification based on model analysis")
        elif confidence >= 0.75:
            reasons.append("High confidence in fake classification based on model analysis")
        
        # Extract sentiment FIRST
        sentiment_processed = False
        for feat in rf_features[:10]:
            if feat['feature'] == 'sentiment':
                polarity = feat['value']
                justification['sentiment_analysis'] = {
                    'polarity': polarity,
                    'polarity_label': self._get_polarity_label(polarity)
                }
                sentiment_processed = True
                break
        
        # Analyze RF top features
        for feat in rf_features[:5]:
            feature_name = feat['feature']
            contribution = feat['contribution']
            value = feat['value']
            
            if feature_name == 'sentiment':
                polarity = value
                
                if polarity > 0.5:
                    reasons.append(f"Highly positive sentiment (score: {polarity:.2f}) flagged by model")
                    flags['extreme_sentiment'] = True
                elif polarity < -0.5:
                    reasons.append(f"Highly negative sentiment (score: {polarity:.2f}) flagged by model")
                    flags['extreme_sentiment'] = True
                else:
                    reasons.append(f"Sentiment tone (score: {polarity:.2f}) analyzed by model")
                flags['rf_analysis'] = True
            
            elif feature_name == 'review_length':
                word_count = int(value)
                if word_count < 10:
                    reasons.append(f"Suspiciously short review ({word_count} words) identified by model")
                    flags['suspicious_length'] = True
                elif word_count > 100:
                    reasons.append(f"Unusually long review ({word_count} words) flagged by model")
                    flags['suspicious_length'] = True
                flags['rf_analysis'] = True
            
            elif feature_name.startswith('kw_'):
                keyword = feature_name.replace('kw_', '')
                if value > 0:
                    reasons.append(f"Keyword '{keyword}' was a significant indicator in model's decision")
                    flags['suspicious_keywords'] = True
                flags['rf_analysis'] = True
            
            elif contribution > 0.005 and self._is_meaningful_word(feature_name):
                reasons.append(f"Word '{feature_name}' had high importance in classification")
                flags['rf_analysis'] = True
        
        if len(rf_features) > 0:
            flags['rf_analysis'] = True

        # If sentiment not in top 5, check top 10
        if not sentiment_processed:
            for feat in rf_features[:10]:
                if feat['feature'] == 'sentiment':
                    polarity = feat['value']
                    justification['sentiment_analysis'] = {
                        'polarity': polarity,
                        'polarity_label': self._get_polarity_label(polarity)
                    }
                    break
        
        # Analyze DistilBERT attention
        if distilbert_attention and len(distilbert_attention) > 0:
            meaningful_tokens = [
                t['token'] for t in distilbert_attention[:10]
                if self._is_meaningful_word(t['token']) and t['attention'] > 0.02
            ]
            
            if meaningful_tokens:
                reasons.append(f"DistilBERT model focused on: {', '.join(meaningful_tokens[:3])}")
                flags['distilbert_attention'] = True
        
        # Analyze SVM contributions
        svm_fake_pushers = [f for f in svm_features if f['direction'] == 'FAKE'][:10]
        if svm_fake_pushers:
            svm_words = [
                f['feature'] for f in svm_fake_pushers 
                if self._is_meaningful_word(f['feature'])
            ]
            
            if svm_words:
                reasons.append(f"Words like '{', '.join(svm_words[:3])}' pushed towards fake classification")
                flags['svm_analysis'] = True
        
        justification['reasons'] = reasons[:7]
        justification['flags'] = flags  # Always contains all keys
        
        return justification

    def _analyze_genuine_from_model(self, text, justification, rf_features, svm_features,
                                    distilbert_attention, confidence):
        reasons = []
        
        # Initialize flags with default values (always present)
        flags = {
            'balanced_sentiment': False,
            'appropriate_length': False,
            'genuine_keywords': False,
            'distilbert_attention': False,
            'svm_analysis': False,
            'rf_analysis': False
        }
        
        if confidence >= 0.9:
            reasons.append("Strong confidence in genuine classification based on model analysis")
        elif confidence >= 0.75:
            reasons.append("High confidence in genuine classification based on model analysis")
        
        # Extract sentiment FIRST
        sentiment_processed = False
        for feat in rf_features[:10]:
            if feat['feature'] == 'sentiment':
                polarity = feat['value']
                justification['sentiment_analysis'] = {
                    'polarity': polarity,
                    'polarity_label': self._get_polarity_label(polarity)
                }
                sentiment_processed = True
                break
        
        # Analyze RF top features
        for feat in rf_features[:5]:
            feature_name = feat['feature']
            value = feat['value']
            
            if feature_name == 'sentiment':
                polarity = value
                
                if -0.3 <= polarity <= 0.7:
                    reasons.append(f"Balanced sentiment (score: {polarity:.2f}) typical of genuine reviews")
                    flags['balanced_sentiment'] = True
                else:
                    reasons.append(f"Sentiment tone (score: {polarity:.2f}) analyzed by model")
                flags['rf_analysis'] = True
            
            elif feature_name == 'review_length':
                word_count = int(value)
                if 15 <= word_count <= 80:
                    reasons.append(f"Appropriate review length ({word_count} words) for genuine feedback")
                    flags['appropriate_length'] = True
                flags['rf_analysis'] = True
            
            elif feature_name.startswith('kw_'):
                keyword = feature_name.replace('kw_', '')
                if keyword in ['original', 'authentic', 'recommended']:
                    reasons.append(f"Presence of genuine indicator keyword '{keyword}'")
                    flags['genuine_keywords'] = True
                flags['rf_analysis'] = True
        
        # If RF found ANY features, mark as analyzed
        if len(rf_features) > 0:
            flags['rf_analysis'] = True
            
        # If sentiment not in top 5, check top 10
        if not sentiment_processed:
            for feat in rf_features[:10]:
                if feat['feature'] == 'sentiment':
                    polarity = feat['value']
                    justification['sentiment_analysis'] = {
                        'polarity': polarity,
                        'polarity_label': self._get_polarity_label(polarity)
                    }
                    break
        
        # Analyze DistilBERT attention
        if distilbert_attention and len(distilbert_attention) > 0:
            meaningful_tokens = [
                t['token'] for t in distilbert_attention[:10]
                if self._is_meaningful_word(t['token']) and t['attention'] > 0.02
            ]
            
            if meaningful_tokens:
                reasons.append(f"DistilBERT model analyzed: {', '.join(meaningful_tokens[:3])}")
                flags['distilbert_attention'] = True  # Set to True
        
        # Analyze SVM contributions
        svm_genuine_pushers = [f for f in svm_features if f['direction'] == 'GENUINE'][:10]
        if svm_genuine_pushers:
            svm_words = [
                f['feature'] for f in svm_genuine_pushers 
                if self._is_meaningful_word(f['feature'])
            ]
            
            if svm_words:
                reasons.append(f"Words like '{', '.join(svm_words[:3])}' supported genuine classification")
                flags['svm_analysis'] = True  # Set to True
        
        # If no specific reasons, add general one
        if not reasons or len(reasons) == 1:
            reasons.append("Review content and structure align with genuine feedback patterns")
        
        justification['reasons'] = reasons[:7]
        justification['flags'] = flags  # Always contains all keys
        
        return justification
    
    def _get_polarity_label(self, polarity):
        """Convert polarity score to label"""
        if polarity > 0.5:
            return 'very positive'
        elif polarity > 0.1:
            return 'positive'
        elif polarity > -0.1:
            return 'neutral'
        elif polarity > -0.5:
            return 'negative'
        else:
            return 'very negative'
    
    def _generate_summary(self, justification):
        prediction = justification['prediction'].lower()
        confidence = justification['confidence']
        
        if prediction == 'fake':
            if confidence >= 0.9:
                return "This review is highly likely to be fake based on model analysis."
            elif confidence >= 0.75:
                return "This review is likely to be fake based on model analysis."
            else:
                return "This review shows suspicious characteristics according to the model."
        else:
            if confidence >= 0.9:
                return "This review appears to be genuine with high confidence."
            elif confidence >= 0.75:
                return "This review appears to be genuine based on model analysis."
            else:
                return "This review shows characteristics of genuine feedback."

_model_justification_generator = None

def get_model_justification_generator(detector_instance):
    global _model_justification_generator
    if _model_justification_generator is None:
        _model_justification_generator = ModelJustificationGenerator(detector_instance)
    return _model_justification_generator