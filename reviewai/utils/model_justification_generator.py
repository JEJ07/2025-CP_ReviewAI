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
            'norm_repetition_score',
            'excessive_punctuation'
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
            },
            'authentic': {
                'fake': {
                    'technical': "Excessive authenticity claims (red flag pattern)",
                    'simple': "Says 'authentic' too many times (suspicious)"
                },
            }
        }
        
        self.positive_indicators = {
            'product_details': ['works', 'quality', 'arrived', 'packaging', 'size', 'color', 
                               'fits', 'material', 'design', 'feature', 'function'],
            'positive_words': ['good', 'great', 'love', 'excellent', 'amazing', 'perfect', 
                              'happy', 'satisfied', 'recommend'],
            'negative_words': ['issue', 'problem', 'disappointed', 'defect', 'broken', 
                              'poor', 'terrible', 'awful', 'waste', 'cheap', 'worst'],
            'complaint_patterns': ['wish it', 'would be better if', 'only problem', 
                                  'only issue', 'downside', 'cons:', 'negatives:', 
                                  'disappointed that', 'unfortunately', 'however', 
                                  'but the', 'but it'],
            'positive_negations': ['nothing is wrong', 'nothing wrong', 'no issues', 
                                  'no problems', 'not bad', 'not disappointed', 
                                  'no complaints', 'nothing to complain', 'can\'t complain', 
                                  'no regrets', 'couldn\'t be better'],
            'time_references': ['yesterday', 'today', 'week', 'month', 'day', 'ago', 'recently'],
            'comparison_words': ['than', 'compared', 'better', 'worse', 'similar', 'like', 'unlike']
        }
    def generate_justification(self, review_text, prediction, confidence, cleaned_text=None, individual_predictions=None):
        try:
            justification = {
                'prediction': prediction,
                'confidence': confidence,
                'reasons': [],
                'flags': {},
                'sentiment_analysis': {},
                'feature_importance': {},
                'overall_summary': '',
                'individual_predictions': individual_predictions or {}
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
        
        model_agreement = 0
        ind_preds = justification.get('individual_predictions', {})
        if ind_preds:
            svm_fake = ind_preds.get('svm', {}).get('fake', 0)
            rf_fake = ind_preds.get('rf', {}).get('fake', 0)
            bert_fake = ind_preds.get('distilbert', {}).get('fake', 0)
            
            # Count "strong agreement" (>0.6) separately from "weak agreement" (>0.5)
            strong_agreements = sum([svm_fake > 0.6, rf_fake > 0.6, bert_fake > 0.6])
            weak_agreements = sum([svm_fake > 0.5, rf_fake > 0.5, bert_fake > 0.5])
            
            model_agreement = weak_agreements
            justification['strong_agreement'] = strong_agreements
        
        justification['model_agreement'] = model_agreement

        if confidence >= 0.9:
            reasons.append(f"Very high confidence")
            simple_reasons.append(f"Very suspicious")
        elif confidence >= 0.75:
            reasons.append(f"High confidence")
            simple_reasons.append(f"Likely fake")
        elif confidence >= 0.6:
            reasons.append(f"Moderate confidence")
            simple_reasons.append(f"Some red flags")
        
        if not rf_features or len(rf_features) == 0:
            logger.warning("Random Forest features are empty - using fallback analysis")
            
            # Use TextBlob for sentiment fallback
            polarity = TextBlob(text).sentiment.polarity
            
            justification['sentiment_analysis'] = {
                'polarity': polarity,
                'polarity_label': self._get_polarity_label(polarity)
            }
            
            if polarity > 0.7:
                reasons.append(f"Overly positive sentiment (score: {polarity:.2f}) - exaggerated enthusiasm")
                flags['extreme_sentiment'] = True
            elif polarity < -0.3:
                reasons.append(f"Overly negative sentiment (score: {polarity:.2f}) - biased or malicious")
                flags['extreme_sentiment'] = True
            
            reasons.append("Model feature extraction incomplete - analysis may be limited")
            simple_reasons.append("Analysis based on available data")
        
        else:
            sentiment_feature = next((f for f in rf_features if f['feature'] == 'sentiment'), None)
            if sentiment_feature:
                polarity = sentiment_feature['value']
                justification['sentiment_analysis'] = {
                    'polarity': polarity,
                    'polarity_label': self._get_polarity_label(polarity)
                }
                if polarity > 0.7:
                    reasons.append(f"Overly positive sentiment (score: {polarity:.2f}) - exaggerated enthusiasm")
                    flags['extreme_sentiment'] = True
                elif polarity < -0.3:
                    reasons.append(f"Overly negative sentiment (score: {polarity:.2f}) - biased or malicious")
                    flags['extreme_sentiment'] = True
        
        processed_text = self.detector.preprocess_text(text).lower()
    
        keyword_features = [f for f in rf_features if f['feature'].startswith('kw_') and f['value'] > 0]
        for kw_feat in keyword_features:
            keyword = kw_feat['feature'].replace('kw_', '')
            keyword_count = processed_text.count(keyword)
            
            if keyword == 'good':
                reasons.append(f"Use of repetitive generic praise word 'good' without specifics")
                simple_reasons.append(f"Says 'good' too many times without details")
                flags['suspicious_keywords'] = True
            else:
                context_info = self.keyword_context.get(keyword, {}).get('fake', {})
                if keyword_count == 1:
                    technical_msg = f"Detected keyword '{keyword}' (model considers it suspicious in this context)"
                    simple_msg = f"Word '{keyword}' flagged by AI model"
                else:
                    technical_msg = f"Repeated use of '{keyword}' ({keyword_count} times) - {context_info.get('technical', 'generic language pattern')}"
                    simple_msg = f"Says '{keyword}' {keyword_count} times - {context_info.get('simple', 'suspicious pattern')}"
                
                reasons.append(f"Suspicious keyword '{keyword}': {technical_msg}")
                simple_reasons.append(f"{simple_msg}")
                flags['suspicious_keywords'] = True
        
        has_excessive_repetition = False

        immediate_rep = next((f for f in rf_features if f['feature'] == 'immediate_repetition'), None)
        max_rep = next((f for f in rf_features if f['feature'] == 'max_repetition'), None)

        if immediate_rep and immediate_rep['value'] >= 2:
            if max_rep:
                total_occurrences = int(max_rep['value'])
                consecutive_pairs = int(immediate_rep['value'])
                
                if consecutive_pairs + 1 == total_occurrences:
                    reasons.append(f"Excessive immediate word repetition: {total_occurrences} identical words in continuous sequence")
                    simple_reasons.append(f"Same word repeated {total_occurrences} times in a row - unnatural pattern")
                else:
                    reasons.append(f"Excessive word repetition: word appears {total_occurrences} times with {consecutive_pairs} back-to-back occurrences")
                    simple_reasons.append(f"Same word used {total_occurrences} times ({consecutive_pairs} repetitive patterns)")
            elif immediate_rep['value'] >= 1:
                reasons.append("Moderate word repetition detected")
                simple_reasons.append("Some repeated words (borderline)")

            has_excessive_repetition = True

        norm_rep = next((f for f in rf_features if f['feature'] == 'norm_repetition_score'), None)
        if norm_rep and norm_rep['value'] > 5.0:
            reasons.append(f"Abnormal repetition pattern score: {norm_rep['value']:.2f} (bot-like behavior)")
            simple_reasons.append(f"Unnatural writing pattern (bot-like behavior)")
            has_excessive_repetition = True
        if has_excessive_repetition:
            flags['excessive_repetition'] = True
            flags['unnatural_language'] = True
        
        for feat in rf_features[:5]:
            feature_name = feat['feature']
            value = feat['value']
            
            if feature_name in ['sentiment', 'immediate_repetition', 'max_repetition', 'norm_repetition_score'] or feature_name.startswith('kw_'):
                continue
            
            if feature_name == 'review_length':
                word_count = int(value)
                if word_count < 10:
                    reasons.append(f"Suspiciously short review length: {word_count} words")
                    simple_reasons.append(f"Too short ({word_count} words) - lacks details")
                    flags['suspicious_length'] = True
                elif word_count > 100:
                    reasons.append(f"Unusually long review: {word_count} words (possible spam)")
                    simple_reasons.append(f"Unusually long ({word_count} words) - possible spam")
                    flags['suspicious_length'] = True
            
            elif feature_name == 'emoji_count':
                if value > 2:
                    reasons.append(f"Excessive emoji usage: {int(value)} emojis detected")
                    simple_reasons.append(f"Too many emojis ({int(value)}) - trying too hard")
                    flags['excessive_emojis'] = True
            
            elif feature_name == 'excessive_punctuation':
                if value > 0:
                    reasons.append(f"Excessive punctuation marks (>3 exclamation/question marks)")
                    simple_reasons.append(f"Too many exclamation marks - trying too hard")
                    flags['unnatural_language'] = True
            
            elif feature_name == 'repetition_ratio':
                if value > 0.3:
                    reasons.append(f"High word repetition ratio: {value:.2f} (limited vocabulary)")
                    simple_reasons.append(f"Too many repeated words (doesn't use variety)")
                    flags['excessive_repetition'] = True
        
        # DistilBERT attention
        if distilbert_attention and len(distilbert_attention) > 0:
            meaningful_tokens = [
                t for t in distilbert_attention[:10]
                if self._is_meaningful_word(t['token']) and t['attention'] > 0.02
            ]
            
            if meaningful_tokens:
                top_words = ', '.join([t['token'] for t in meaningful_tokens[:3]])
                reasons.append(f"DistilBERT AI focused on: {top_words}")
                simple_reasons.append(f"AI examined: {top_words}")
                
                suspicious_keywords = ['good', 'bad', 'amazing', 'terrible', 'best', 'worst', 
                                    'perfect', 'awful', 'love', 'hate', 'dissapointed', 
                                    'recommended', 'authentic', 'fake', 'original']
                
                suspicious_found = [t['token'] for t in meaningful_tokens 
                                if t['token'].lower() in suspicious_keywords]
                
                if suspicious_found and len(suspicious_found) >= 2:
                    reasons.append(
                        f"Multiple known red-flag words detected: {', '.join(suspicious_found[:3])}"
                    )
                    simple_reasons.append(f"Red-flag words: {', '.join(suspicious_found[:2])}")
        
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
        
        active_flags = sum(1 for v in flags.values() if v)
        if reasons and confidence >= 0.75:
            strong_count = justification.get('strong_agreement', 0)
            
            if model_agreement >= 3:
                reasons[0] = f"High confidence: {active_flags} red flags detected, all 3 AI models agree (unanimous)"
                simple_reasons[0] = f"{active_flags} warning signs found, all 3 AI systems agree it's fake"
            elif model_agreement >= 2:
                reasons[0] = f"High confidence: {active_flags} red flags detected, {model_agreement}/3 AI models agree"
                simple_reasons[0] = f"{active_flags} warning signs found, {model_agreement}/3 AI systems agree it's fake"
            elif strong_count >= 1:
                reasons[0] = f"High confidence: {active_flags} red flags detected, {strong_count} model(s) strongly agree"
                simple_reasons[0] = f"{active_flags} warning signs found (AI models lean toward fake)"
            else:
                reasons[0] = f"High confidence: {active_flags} red flags detected"
                simple_reasons[0] = f"{active_flags} warning signs found"
        
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
            'natural_repetition': False,
            'natural_language': False,
            'appropriate_emojis': False,
            'specific_details': False,
            'balanced_perspective': False,
            'natural_questions': False
        }

        model_agreement = 0
        ind_preds = justification.get('individual_predictions', {})
        if ind_preds:
            svm_genuine = ind_preds.get('svm', {}).get('genuine', 0)
            rf_genuine = ind_preds.get('rf', {}).get('genuine', 0)
            bert_genuine = ind_preds.get('distilbert', {}).get('genuine', 0)
            
            strong_agreements = sum([svm_genuine > 0.6, rf_genuine > 0.6, bert_genuine > 0.6])
            weak_agreements = sum([svm_genuine > 0.5, rf_genuine > 0.5, bert_genuine > 0.5])
            
            model_agreement = weak_agreements
            justification['strong_agreement'] = strong_agreements
        
        justification['model_agreement'] = model_agreement
        
        # Confidence explanation
        if confidence >= 0.9:
            if model_agreement >= 3:
                reasons.append("Strong confidence in genuine classification - all 3 models agree")
                simple_reasons.append("Very likely real - all AI systems agree")
            elif strong_agreements >= 2:
                reasons.append(f"Strong confidence in genuine classification - {strong_agreements}/3 models strongly agree")
                simple_reasons.append(f"Very likely real - {strong_agreements}/3 AI systems strongly agree")
            else:
                reasons.append("Strong confidence in genuine classification based on model analysis")
                simple_reasons.append("Very likely real - natural patterns detected")
        elif confidence >= 0.75:
            if model_agreement >= 2:
                reasons.append(f"High confidence in genuine classification - {model_agreement}/3 models agree")
                simple_reasons.append(f"Likely genuine - {model_agreement}/3 AI systems agree")
            else:
                reasons.append("High confidence in genuine classification based on model analysis")
                simple_reasons.append("Likely genuine - natural patterns detected")
        
        # FORCE CHECK SENTIMENT (ALWAYS)
        sentiment_feature = next((f for f in rf_features if f['feature'] == 'sentiment'), None)
        if sentiment_feature:
            polarity = sentiment_feature['value']
            justification['sentiment_analysis'] = {
                'polarity': polarity,
                'polarity_label': self._get_polarity_label(polarity)
            }
            
            if -0.3 <= polarity <= 0.7:
                reasons.append(f"Balanced sentiment (score: {polarity:.2f}) typical of genuine reviews")
                simple_reasons.append(f"Natural emotional tone (not over-the-top)")
                flags['balanced_sentiment'] = True
        
        # FORCE CHECK REPETITION FEATURES (ALWAYS)
        immediate_rep = next((f for f in rf_features if f['feature'] == 'immediate_repetition'), None)
        repetition_ratio_feat = next((f for f in rf_features if f['feature'] == 'repetition_ratio'), None)
        max_rep = next((f for f in rf_features if f['feature'] == 'max_repetition'), None)
        norm_rep = next((f for f in rf_features if f['feature'] == 'norm_repetition_score'), None)
        
        if immediate_rep:
            if immediate_rep['value'] <= 1:
                reasons.append(f"Natural word usage without excessive repetition")
                simple_reasons.append(f"Words flow naturally (not repetitive)")
                flags['natural_repetition'] = True
                flags['natural_language'] = True
            else:
                pass

        if repetition_ratio_feat and repetition_ratio_feat['value'] <= 0.2:
            reasons.append(f"Low repetition ratio ({repetition_ratio_feat['value']:.2f}) indicates natural language")
            simple_reasons.append(f"Good vocabulary variety (natural writing)")
            flags['natural_repetition'] = True
            flags['natural_language'] = True
        
        if max_rep and max_rep['value'] <= 3:
            reasons.append(f"Word usage shows natural variation (max repeat: {int(max_rep['value'])})")
            simple_reasons.append(f"Words used in moderation ({int(max_rep['value'])}x max)")
            flags['natural_repetition'] = True
            flags['natural_language'] = True
        
        if norm_rep and norm_rep['value'] <= 3.0:
            reasons.append(f"Normal repetition pattern (score: {norm_rep['value']:.2f}) suggests genuine review")
            simple_reasons.append(f"Natural writing pattern (human-like)")
            flags['natural_repetition'] = True
            flags['natural_language'] = True
        
        # CHECK OTHER TOP FEATURES (skip already processed)
        for feat in rf_features[:5]:
            feature_name = feat['feature']
            value = feat['value']
            
            # Skip already processed features
            if feature_name in ['sentiment', 'immediate_repetition', 'repetition_ratio', 
                            'max_repetition', 'norm_repetition_score'] or feature_name.startswith('kw_'):
                continue
            
            if feature_name == 'review_length':
                word_count = int(value)
                if 15 <= word_count <= 80:
                    reasons.append(f"Appropriate review length ({word_count} words) for genuine feedback")
                    simple_reasons.append(f"Good length ({word_count} words) - detailed but not excessive")
                    flags['appropriate_length'] = True
            
            elif feature_name == 'emoji_count':
                if value <= 2:
                    reasons.append(f"Appropriate emoji usage ({int(value)}) typical of genuine reviews")
                    simple_reasons.append(f"Emojis used naturally ({int(value)}) - not excessive")
                    flags['appropriate_emojis'] = True
            
            elif feature_name == 'excessive_punctuation':
                if value == 0:
                    reasons.append(f"Natural punctuation usage")
                    simple_reasons.append(f"Punctuation used appropriately")
                    flags['natural_language'] = True
        
        # Check for product-specific details
        processed_text = text.lower()
        product_terms = self.positive_indicators['product_details']
        specific_count = sum(1 for term in product_terms if term in processed_text)
        
        if specific_count >= 2:
            reasons.append(f"Review mentions specific product details ({specific_count} found) - typical of genuine feedback")
            simple_reasons.append(f"Talks about specific details ({specific_count} mentioned) - not generic")
            flags['specific_details'] = True
        
        # Check for balanced perspective
        processed_text = text.lower()
        
        # Check for positive words
        positive_words = self.positive_indicators['positive_words']
        has_positive = any(word in processed_text for word in positive_words)
        
        negative_words = self.positive_indicators['negative_words']
        complaint_patterns = self.positive_indicators['complaint_patterns']
        positive_negations = self.positive_indicators['positive_negations']
        
        is_positive_negation = any(phrase in processed_text for phrase in positive_negations)
        
        has_negative_words = any(word in processed_text for word in negative_words)
        has_complaint_pattern = any(pattern in processed_text for pattern in complaint_patterns)
        has_actual_negative = (has_negative_words or has_complaint_pattern) and not is_positive_negation
        
        if has_positive and has_actual_negative:
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
                simple_reasons.append(f"AI examined: {token_names}")
                
                product_terms = self.positive_indicators['product_details']
                specific_tokens = [t['token'] for t in meaningful_tokens 
                                if t['token'].lower() in product_terms]
                
                if specific_tokens:
                    reasons.append(
                        f"DistilBERT focused on product-specific details: {', '.join(specific_tokens[:3])}"
                    )
                    simple_reasons.append(f"AI noticed product details: {', '.join(specific_tokens[:2])}")
        
        # SVM contributions
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