import logging
from sys import flags
from textblob import TextBlob

logger = logging.getLogger(__name__)

class ModelJustificationGenerator:
    def __init__(self, detector_instance):
        self.detector = detector_instance
        
        self.engineered_features = {
            'review_length',
            'sentiment',
            'length_bucket',
            'emoji_count',
            'kw_fast',
            'kw_good',
            'kw_recommended',
            'kw_bad',
            'kw_fake',
            'kw_original',
            'kw_authentic',
            'immediate_repetition',
            'repetition_ratio',
            'max_repetition',
            'norm_repetition_score'
        }
        self.stopwords = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'you', 'your', 'if', 'or', 'but',
            'this', 'they', 'we', 'can', 'could', 'would', 'should', 'may',
            'i', 'me', 'my', 'mine', 'am', 'have', 'had', 'do', 'does',
            '.', ',', '!', '?', ':', ';', '-', '_', '(', ')', '[', ']'
        }

        self.keyword_context = {
            'fast': {
                'fake': {
                    'technical': "Generic praise word often overused in fake reviews",
                    'simple': "The word 'fast' is used too much without specific details"
                },
                'genuine': {
                    'technical': "Mentions delivery speed (common in genuine feedback)",
                    'simple': "Talks about quick delivery (normal for real reviews)"
                }
            },
            'good': {
                'fake': {
                    'technical': "Vague generic praise without specific product details",
                    'simple': "Just says 'good' repeatedly without explaining why"
                },
                'genuine': {
                    'technical': "Simple positive word (acceptable in genuine reviews)",
                    'simple': "Uses 'good' naturally in sentence"
                }
            },
            'recommended': {
                'fake': {
                    'technical': "Generic endorsement without personal experience details",
                    'simple': "Says to buy it but doesn't explain why"
                },
                'genuine': {
                    'technical': "Personal recommendation based on actual experience",
                    'simple': "Recommends based on their own experience"
                }
            },
            'bad': {
                'fake': {
                    'technical': "Overly negative language (possible competitor sabotage)",
                    'simple': "Extremely negative without balanced feedback"
                },
                'genuine': {
                    'technical': "Honest criticism of specific product issues",
                    'simple': "Points out real problems with the product"
                }
            },
            'fake': {
                'fake': {
                    'technical': "Self-aware fake review attempting reverse psychology",
                    'simple': "Review tries to sound real by using the word 'fake'"
                },
                'genuine': {
                    'technical': "Warning others about fake reviews (protective behavior)",
                    'simple': "Alerting buyers about fake reviews"
                }
            },
            'original': {
                'fake': {
                    'technical': "Overcompensating to appear authentic",
                    'simple': "Tries too hard to prove it's real"
                },
                'genuine': {
                    'technical': "Verifying product authenticity (concern about counterfeits)",
                    'simple': "Confirms they got a real product"
                }
            },
            'authentic': {
                'fake': {
                    'technical': "Excessive authenticity claims (red flag pattern)",
                    'simple': "Says 'authentic' too many times (suspicious)"
                },
                'genuine': {
                    'technical': "Confirming genuine product received",
                    'simple': "Verifies product is authentic"
                }
            }
        }
        
        self.positive_indicators = {
            'product_details': ['works', 'quality', 'arrived', 'packaging', 'size', 'color', 
                               'fits', 'material', 'design', 'feature', 'function'],
            'personal_pronouns': ['i', 'my', 'me', 'mine', 'we', 'our', 'us'],
            'positive_words': ['good', 'great', 'love', 'excellent', 'amazing', 'perfect', 
                              'happy', 'satisfied', 'recommend'],
            'negative_words': ['but', 'however', 'although', 'issue', 'problem', 'disappointed',
                              'not', 'wish', 'could', 'better'],
            'time_references': ['yesterday', 'today', 'week', 'month', 'day', 'ago', 'recently'],
            'comparison_words': ['than', 'compared', 'better', 'worse', 'similar', 'like', 'unlike']
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
            
            rf_features = self.detector.get_rf_feature_importance(review_text)
            justification['feature_importance']['random_forest'] = rf_features
            
            svm_features = self.detector.get_svm_feature_contributions(review_text)
            justification['feature_importance']['svm'] = svm_features
            
            distilbert_attention = self.detector.get_distilbert_attention(review_text)
            justification['feature_importance']['distilbert'] = distilbert_attention
            
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
        simple_reasons = []
        
        flags = {
            'extreme_sentiment': False,
            'suspicious_length': False,
            'suspicious_keywords': False,
            'excessive_repetition': False,
            'unnatural_language': False,
            'excessive_emojis': False
        }
        
        # Confidence explanation with model agreement
        model_agreement = 0
        if hasattr(justification, 'individual_predictions'):
            ind_preds = justification.get('individual_predictions', {})
            if ind_preds:
                svm_fake = ind_preds.get('svm', {}).get('fake', 0) > 0.5
                rf_fake = ind_preds.get('rf', {}).get('fake', 0) > 0.5
                bert_fake = ind_preds.get('distilbert', {}).get('fake', 0) > 0.5
                model_agreement = sum([svm_fake, rf_fake, bert_fake])
        
        # Count active flags
        active_flags = 0
        
        if confidence >= 0.9:
            reasons.append(f"Very high confidence in fake classification (all AI models agree)")
            simple_reasons.append(f"Very suspicious - all 3 AI systems detected fake patterns")
        elif confidence >= 0.75:
            reasons.append(f"High confidence in fake classification based on model analysis")
            simple_reasons.append(f"Likely fake - multiple warning signs detected")
        elif confidence >= 0.6:
            reasons.append(f"Moderate confidence - some suspicious patterns detected")
            simple_reasons.append(f"Some red flags found - manual review recommended")
        
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
            
            # SENTIMENT
            if feature_name == 'sentiment':
                polarity = value
                
                if polarity > 0.5:
                    reasons.append(f"Highly positive sentiment (score: {polarity:.2f}) flagged by model")
                    simple_reasons.append(f"Overly enthusiastic tone (suspiciously happy)")
                    flags['extreme_sentiment'] = True
                elif polarity < -0.5:
                    reasons.append(f"Highly negative sentiment (score: {polarity:.2f}) flagged by model")
                    simple_reasons.append(f"Extremely negative tone (possibly malicious)")
                    flags['extreme_sentiment'] = True
                else:
                    reasons.append(f"Sentiment tone (score: {polarity:.2f}) analyzed by model")
                    simple_reasons.append(f"Emotional tone analyzed")
            
            # REVIEW LENGTH
            elif feature_name == 'review_length':
                word_count = int(value)
                if word_count < 10:
                    reasons.append(f"Suspiciously short review ({word_count} words) identified by model")
                    simple_reasons.append(f"Too short ({word_count} words) - lacks details")
                    flags['suspicious_length'] = True
                elif word_count > 100:
                    reasons.append(f"Unusually long review ({word_count} words) flagged by model")
                    simple_reasons.append(f"Unusually long ({word_count} words) - possible spam")
                    flags['suspicious_length'] = True
            
            # KEYWORD FEATURES
            elif feature_name.startswith('kw_'):
                keyword = feature_name.replace('kw_', '')
                
                if keyword != 'good' and value > 0:
                    context_info = self.keyword_context.get(keyword, {}).get('fake', {})
                    technical_msg = context_info.get('technical', f"Keyword '{keyword}' was a significant indicator")
                    simple_msg = context_info.get('simple', f"Uses suspicious word '{keyword}'")
                    
                    reasons.append(f"Keyword '{keyword}': {technical_msg}")
                    simple_reasons.append(f"{simple_msg}")
                    flags['suspicious_keywords'] = True
            
            # KW_GOOD
            elif feature_name == 'kw_good':
                if value > 0:
                    reasons.append(f"Overuse of generic praise word 'good' detected")
                    simple_reasons.append(f"Says 'good' too many times without details")
                    flags['suspicious_keywords'] = True
            
            # REPETITION FEATURES
            elif feature_name == 'immediate_repetition':
                if value > 2:
                    reasons.append(f"Excessive immediate word repetition ({int(value)} occurrences) suggests unnatural language")
                    simple_reasons.append(f"Repeats words back-to-back unnaturally ({int(value)} times)")
                    flags['excessive_repetition'] = True
                    flags['unnatural_language'] = True

            elif feature_name == 'repetition_ratio':
                if value > 0.3:
                    reasons.append(f"High word repetition ratio ({value:.2f}) indicates possible fake review")
                    simple_reasons.append(f"Too many repeated words (doesn't use variety)")
                    flags['excessive_repetition'] = True
                    flags['unnatural_language'] = True

            elif feature_name == 'max_repetition':
                if value > 5:
                    reasons.append(f"Single word repeated excessively ({int(value)} times) - typical of fake reviews")
                    simple_reasons.append(f"One word used {int(value)} times (copy-paste pattern)")
                    flags['excessive_repetition'] = True
                    flags['unnatural_language'] = True

            elif feature_name == 'norm_repetition_score':
                if value > 5.0:
                    reasons.append(f"Abnormal repetition pattern (score: {value:.2f}) flagged by model")
                    simple_reasons.append(f"Unnatural writing pattern (bot-like behavior)")
                    flags['excessive_repetition'] = True
                    flags['unnatural_language'] = True

            # EMOJI COUNT
            elif feature_name == 'emoji_count':
                if value > 2:
                    reasons.append(f"Excessive emoji usage ({int(value)} emojis) may indicate fake review")
                    simple_reasons.append(f"Too many emojis ({int(value)}) - trying too hard")
                    flags['excessive_emojis'] = True
            
            # MEANINGFUL TF-IDF WORDS
            elif contribution > 0.005 and self._is_meaningful_word(feature_name):
                reasons.append(f"Word '{feature_name}' had high importance in classification")
                simple_reasons.append(f"Word '{feature_name}' triggered suspicion")
                flags['unnatural_language'] = True
        
        # FORCED EMOJI CHECK
        emoji_feature = next((f for f in rf_features if f['feature'] == 'emoji_count'), None)
        if emoji_feature and emoji_feature['value'] > 2 and not flags['excessive_emojis']:
            reasons.append(f"Excessive emoji usage ({int(emoji_feature['value'])} emojis) may indicate fake review")
            simple_reasons.append(f"Too many emojis ({int(emoji_feature['value'])}) - trying too hard")
            flags['excessive_emojis'] = True

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
        
        # Categorize DistilBERT tokens
        if distilbert_attention and len(distilbert_attention) > 0:
            meaningful_tokens = [
                t for t in distilbert_attention[:10]
                if self._is_meaningful_word(t['token']) and t['attention'] > 0.02
            ]
            
            if meaningful_tokens:
                suspicious_keywords = ['good', 'bad', 'amazing', 'terrible', 'best', 'worst', 
                                    'perfect', 'awful', 'love', 'hate']
                
                suspicious_tokens = [t['token'] for t in meaningful_tokens 
                                if t['token'].lower() in suspicious_keywords]
                neutral_tokens = [t['token'] for t in meaningful_tokens 
                                if t['token'].lower() not in suspicious_keywords]
                
                if suspicious_tokens:
                    token_names = ', '.join(suspicious_tokens[:3])
                    reasons.append(f"DistilBERT AI detected suspicious language patterns in: {token_names}")
                    simple_reasons.append(f"AI flagged suspicious words: {token_names}")
                elif neutral_tokens:
                    token_names = ', '.join(neutral_tokens[:3])
                    reasons.append(f"DistilBERT model focused on key terms: {token_names}")
                    simple_reasons.append(f"AI analyzed words: {token_names}")
        
        # SVM contributions
        svm_fake_pushers = [f for f in svm_features if f['direction'] == 'FAKE'][:10]
        if svm_fake_pushers:
            svm_words = [
                f['feature'] for f in svm_fake_pushers 
                if self._is_meaningful_word(f['feature'])
            ]
            
            if svm_words:
                word_list = ', '.join(svm_words[:3])
                reasons.append(f"Words like '{word_list}' contributed to fake classification")
                simple_reasons.append(f"Suspicious words detected: {word_list}")
        
        # Add model agreement to first reason
        active_flags = sum(1 for v in flags.values() if v)
        if reasons and confidence >= 0.75:
            reasons[0] = f"High confidence: {active_flags} red flags detected, {model_agreement} out of 3 AI models agree"
            simple_reasons[0] = f"{active_flags} warning signs found, {model_agreement}/3 AI systems agree it's fake"
        
        justification['reasons'] = reasons[:7]
        justification['simple_reasons'] = simple_reasons[:7]
        justification['flags'] = flags
        
        return justification

    def _analyze_genuine_from_model(self, text, justification, rf_features, svm_features,
                            distilbert_attention, confidence):
        reasons = []
        simple_reasons = []
        
        flags = {
            'balanced_sentiment': False,
            'appropriate_length': False,
            'genuine_keywords': False,
            'natural_repetition': False,
            'natural_language': False,
            'appropriate_emojis': False,
            'specific_details': False,
            'personal_experience': False,
            'balanced_perspective': False,
            'natural_questions': False
        }
        
        if confidence >= 0.9:
            reasons.append("Strong confidence in genuine classification based on model analysis")
            simple_reasons.append("Very likely real - all AI systems agree")
        elif confidence >= 0.75:
            reasons.append("High confidence in genuine classification based on model analysis")
            simple_reasons.append("Likely genuine - natural patterns detected")
        
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
                    simple_reasons.append(f"Natural emotional tone (not over-the-top)")
                    flags['balanced_sentiment'] = True
                else:
                    reasons.append(f"Sentiment tone (score: {polarity:.2f}) analyzed by model")
                    simple_reasons.append(f"Emotional tone analyzed")
            
            elif feature_name == 'review_length':
                word_count = int(value)
                if 15 <= word_count <= 80:
                    reasons.append(f"Appropriate review length ({word_count} words) for genuine feedback")
                    simple_reasons.append(f"Good length ({word_count} words) - detailed but not excessive")
                    flags['appropriate_length'] = True
            
            elif feature_name.startswith('kw_'):
                keyword = feature_name.replace('kw_', '')
                if keyword in ['original', 'authentic', 'recommended']:
                    context_info = self.keyword_context.get(keyword, {}).get('genuine', {})
                    technical_msg = context_info.get('technical', f"Presence of genuine indicator keyword '{keyword}'")
                    simple_msg = context_info.get('simple', f"Uses word '{keyword}' naturally")
                    
                    reasons.append(technical_msg)
                    simple_reasons.append(f"{simple_msg}")
                    flags['genuine_keywords'] = True
            
            # REPETITION FEATURES
            elif feature_name == 'immediate_repetition':
                if value <= 1:
                    reasons.append(f"Natural word usage without excessive repetition")
                    simple_reasons.append(f"Words flow naturally (not repetitive)")
                    flags['natural_repetition'] = True
                    flags['natural_language'] = True

            elif feature_name == 'repetition_ratio':
                if value <= 0.2:
                    reasons.append(f"Low repetition ratio ({value:.2f}) indicates natural language")
                    simple_reasons.append(f"Good vocabulary variety (natural writing)")
                    flags['natural_repetition'] = True
                    flags['natural_language'] = True

            elif feature_name == 'max_repetition':
                if value <= 3:
                    reasons.append(f"Word usage shows natural variation (max repeat: {int(value)})")
                    simple_reasons.append(f"Words used in moderation ({int(value)}x max)")
                    flags['natural_repetition'] = True
                    flags['natural_language'] = True

            elif feature_name == 'norm_repetition_score':
                if value <= 3.0:
                    reasons.append(f"Normal repetition pattern (score: {value:.2f}) suggests genuine review")
                    simple_reasons.append(f"Natural writing pattern (human-like)")
                    flags['natural_repetition'] = True
                    flags['natural_language'] = True
    
            # EMOJI COUNT
            elif feature_name == 'emoji_count':
                if value <= 2:
                    reasons.append(f"Appropriate emoji usage ({int(value)}) typical of genuine reviews")
                    simple_reasons.append(f"Emojis used naturally ({int(value)}) - not excessive")
                    flags['appropriate_emojis'] = True

            elif feature_name == 'kw_good':
                pass
        
        # FORCED EMOJI CHECK
        emoji_feature = next((f for f in rf_features if f['feature'] == 'emoji_count'), None)
        if emoji_feature and emoji_feature['value'] <= 2 and not flags['appropriate_emojis']:
            reasons.append(f"Appropriate emoji usage ({int(emoji_feature['value'])}) typical of genuine reviews")
            simple_reasons.append(f"Emojis used naturally ({int(emoji_feature['value'])}) - not excessive")
            flags['appropriate_emojis'] = True
        
        # Check for product-specific details
        processed_text = text.lower()
        product_terms = self.positive_indicators['product_details']
        specific_count = sum(1 for term in product_terms if term in processed_text)
        
        if specific_count >= 2:
            reasons.append(f"Review mentions specific product details ({specific_count} found) - typical of genuine feedback")
            simple_reasons.append(f" Talks about specific details ({specific_count} mentioned) - not generic")
            flags['specific_details'] = True
        
        # Check for personal experience
        personal_pronouns = self.positive_indicators['personal_pronouns']
        has_personal = any(f' {pronoun} ' in f' {processed_text} ' for pronoun in personal_pronouns)
        
        if has_personal:
            reasons.append("Uses personal experience language (e.g., 'I bought', 'My experience') - typical of genuine reviews")
            simple_reasons.append("Uses personal words like 'I' or 'my' (shares experience)")
            flags['personal_experience'] = True
        
        # Check for balanced perspective
        positive_words = self.positive_indicators['positive_words']
        negative_words = self.positive_indicators['negative_words']
        has_positive = any(word in processed_text for word in positive_words)
        has_negative = any(word in processed_text for word in negative_words)
        
        if has_positive and has_negative:
            reasons.append("Review discusses both positives and negatives (balanced perspective typical of genuine reviews)")
            simple_reasons.append("Mentions both good and bad points (honest review)")
            flags['balanced_perspective'] = True
        
        # Check for questions
        has_questions = '?' in text
        if has_questions:
            reasons.append("Review asks questions or expresses concerns (natural behavior)")
            simple_reasons.append("Asks questions (genuine curiosity)")
            flags['natural_questions'] = True

        # DistilBERT attention
        if distilbert_attention and len(distilbert_attention) > 0:
            meaningful_tokens = [
                t for t in distilbert_attention[:10]
                if self._is_meaningful_word(t['token']) and t['attention'] > 0.02
            ]
            
            if meaningful_tokens:
                token_names = ', '.join([t['token'] for t in meaningful_tokens[:3]])
                reasons.append(f"DistilBERT AI analyzed key terms: {token_names}")
                simple_reasons.append(f"AI examined important words: {token_names}")
        
        svm_genuine_pushers = [f for f in svm_features if f['direction'] == 'GENUINE'][:10]
        if svm_genuine_pushers:
            svm_words = [
                f['feature'] for f in svm_genuine_pushers 
                if self._is_meaningful_word(f['feature'])
            ]
            
            if svm_words:
                word_list = ', '.join(svm_words[:3])
                reasons.append(f"Words like '{word_list}' supported genuine classification")
                simple_reasons.append(f"Natural words detected: {word_list}")
        
        # Ensure at least some reasons exist
        if not reasons or len(reasons) == 1:
            reasons.append("Review content and structure align with genuine feedback patterns")
            simple_reasons.append("Review follows natural patterns of real feedback")
        
        justification['reasons'] = reasons[:7]
        justification['simple_reasons'] = simple_reasons[:7]
        justification['flags'] = flags
        
        return justification
    
    def _get_polarity_label(self, polarity):
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