import re
from textblob import TextBlob
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class JustificationGenerator:
    """Generate explanations for fake review predictions"""
    
    def __init__(self):
        self.suspicious_keywords = {
            'exaggeration': [
                'amazing', 'perfect', 'best', 'incredible', 'awesome', 'fantastic',
                'outstanding', 'excellent', 'wonderful', 'phenomenal', 'magnificent',
                'extraordinary', 'exceptional', 'superb', 'spectacular', 'flawless'
            ],
            'generic': [
                'good', 'nice', 'great', 'ok', 'fine', 'decent', 'alright',
                'recommend', 'highly recommend', 'must buy', 'buy it', 'get it'
            ],
            'urgency': [
                'limited', 'hurry', 'now', 'today', 'immediately', 'quick',
                'fast', 'instant', 'urgent', 'don\'t miss', 'act now'
            ],
            'promotional': [
                'deal', 'discount', 'sale', 'offer', 'promo', 'coupon',
                'free', 'bonus', 'gift', 'special', 'exclusive'
            ],
            'extreme_negative': [
                'terrible', 'horrible', 'worst', 'awful', 'disgusting', 'hate',
                'pathetic', 'useless', 'garbage', 'trash', 'scam', 'fraud'
            ]
        }
        
        # Repetitive phrase patterns
        self.repetitive_patterns = [
            r'\b(\w+)\s+\1\b',  # Repeated words ("very very")
            r'\b(\w{4,})\s+(?:\w+\s+){0,3}\1\b'  # Repeated longer words within short distance
        ]
    
    def generate_justification(self, review_text, prediction, confidence, cleaned_text=None):
        """
        Generate detailed justification for the prediction
        
        Args:
            review_text: Original review text
            prediction: Model prediction (genuine/fake)
            confidence: Confidence score (0-1)
            cleaned_text: Preprocessed text from model
        
        Returns:
            dict: Justification data with reasons and flags
        """
        try:
            text_to_analyze = cleaned_text or review_text
            
            justification = {
                'prediction': prediction,
                'confidence': confidence,
                'reasons': [],
                'flags': {},
                'sentiment_analysis': {},
                'keyword_analysis': {},
                'overall_summary': ''
            }
            
            # Only generate detailed justification for fake predictions
            if prediction.lower() == 'fake':
                justification = self._analyze_fake_indicators(text_to_analyze, justification, confidence)
            elif prediction.lower() == 'genuine':
                justification = self._analyze_genuine_indicators(text_to_analyze, justification, confidence)
            
            # Generate overall summary
            justification['overall_summary'] = self._generate_summary(justification)
            
            return justification
            
        except Exception as e:
            logger.error(f"Error generating justification: {str(e)}")
            return {
                'prediction': prediction,
                'confidence': confidence,
                'reasons': ['Unable to generate detailed analysis'],
                'flags': {},
                'overall_summary': 'Analysis completed but details unavailable'
            }
    
    def _analyze_fake_indicators(self, text, justification, confidence):
        """Analyze indicators that suggest a fake review"""
        
        # Sentiment Analysis
        sentiment = self._analyze_sentiment(text)
        justification['sentiment_analysis'] = sentiment
        
        if sentiment['polarity'] > 0.8:
            justification['reasons'].append("Overly positive sentiment detected")
            justification['flags']['extreme_positive'] = True
        elif sentiment['polarity'] < -0.8:
            justification['reasons'].append("Overly negative sentiment detected")
            justification['flags']['extreme_negative'] = True
        
        if sentiment['subjectivity'] > 0.8:
            justification['reasons'].append("Highly subjective language without factual details")
            justification['flags']['high_subjectivity'] = True
        
        # Keyword Analysis
        keyword_results = self._analyze_keywords(text)
        justification['keyword_analysis'] = keyword_results
        
        if keyword_results['exaggeration_count'] >= 3:
            justification['reasons'].append(
                f"Excessive use of exaggerated terms ({keyword_results['exaggeration_count']} found)"
            )
            justification['flags']['exaggeration'] = True
        
        if keyword_results['generic_count'] >= 5:
            justification['reasons'].append(
                f"Heavy use of generic phrases ({keyword_results['generic_count']} found)"
            )
            justification['flags']['generic'] = True
        
        if keyword_results['urgency_count'] >= 2:
            justification['reasons'].append("Contains urgency/pressure tactics")
            justification['flags']['urgency'] = True
        
        if keyword_results['promotional_count'] >= 2:
            justification['reasons'].append("Contains promotional language")
            justification['flags']['promotional'] = True
        
        # Repetition Analysis
        repetition = self._analyze_repetition(text)
        if repetition['has_repetition']:
            justification['reasons'].append(
                f"Repetitive patterns detected: {', '.join(repetition['examples'][:3])}"
            )
            justification['flags']['repetition'] = True
        
        # Length and Structure Analysis
        structure = self._analyze_structure(text)
        
        if structure['is_too_short']:
            justification['reasons'].append("Suspiciously short review with limited detail")
            justification['flags']['too_short'] = True
        
        if structure['lacks_specifics']:
            justification['reasons'].append("Lacks specific product details or context")
            justification['flags']['lacks_specifics'] = True
        
        # Confidence-based reasoning
        if confidence >= 0.9:
            justification['reasons'].insert(0, "Strong confidence in fake classification")
        elif confidence >= 0.75:
            justification['reasons'].insert(0, "High confidence in fake classification")
        
        return justification
    
    def _analyze_genuine_indicators(self, text, justification, confidence):
        """Analyze indicators that suggest a genuine review"""
        
        sentiment = self._analyze_sentiment(text)
        justification['sentiment_analysis'] = sentiment
        
        structure = self._analyze_structure(text)
        
        reasons = []
        
        if 0.2 <= sentiment['polarity'] <= 0.7:
            reasons.append("Balanced sentiment typical of genuine reviews")
        
        if sentiment['subjectivity'] < 0.6:
            reasons.append("Includes factual, objective information")
        
        if structure['has_specifics']:
            reasons.append("Contains specific product details and context")
        
        if structure['word_count'] >= 20:
            reasons.append("Adequate detail and explanation provided")
        
        if confidence >= 0.9:
            reasons.insert(0, "Strong confidence in genuine classification")
        elif confidence >= 0.75:
            reasons.insert(0, "High confidence in genuine classification")
        
        justification['reasons'] = reasons if reasons else ["Review shows characteristics of genuine feedback"]
        
        return justification
    
    def _analyze_sentiment(self, text):
        """Analyze sentiment using TextBlob"""
        try:
            blob = TextBlob(text)
            return {
                'polarity': blob.sentiment.polarity,
                'subjectivity': blob.sentiment.subjectivity,
                'polarity_label': self._get_polarity_label(blob.sentiment.polarity)
            }
        except:
            return {
                'polarity': 0.0,
                'subjectivity': 0.5,
                'polarity_label': 'neutral'
            }
    
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
    
    def _analyze_keywords(self, text):
        """Analyze presence of suspicious keywords"""
        text_lower = text.lower()
        
        results = {
            'exaggeration_count': 0,
            'exaggeration_words': [],
            'generic_count': 0,
            'generic_words': [],
            'urgency_count': 0,
            'urgency_words': [],
            'promotional_count': 0,
            'promotional_words': [],
            'extreme_negative_count': 0,
            'extreme_negative_words': []
        }
        
        for category, keywords in self.suspicious_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    count_key = f'{category}_count'
                    words_key = f'{category}_words'
                    results[count_key] += text_lower.count(keyword)
                    if keyword not in results[words_key]:
                        results[words_key].append(keyword)
        
        return results
    
    def _analyze_repetition(self, text):
        examples = []
        
        for pattern in self.repetitive_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                examples.append(match.group(0))
        
        return {
            'has_repetition': len(examples) > 0,
            'repetition_count': len(examples),
            'examples': examples[:5]  # Limit to 5
        }
    
    def _analyze_structure(self, text):
        """Analyze review structure and content"""
        words = text.split()
        word_count = len(words)
        
        has_numbers = bool(re.search(r'\d+', text))
        has_time_ref = bool(re.search(r'\b(day|week|month|year|hour|minute)s?\b', text, re.IGNORECASE))
        has_comparisons = bool(re.search(r'\b(than|better|worse|compared|versus)\b', text, re.IGNORECASE))
        
        return {
            'word_count': word_count,
            'is_too_short': word_count < 10,
            'has_specifics': has_numbers or has_time_ref or has_comparisons,
            'lacks_specifics': not (has_numbers or has_time_ref or has_comparisons) and word_count < 30
        }
    
    def _generate_summary(self, justification):
        """Generate a human-readable summary"""
        prediction = justification['prediction'].lower()
        confidence = justification['confidence']
        reasons = justification['reasons']
        
        if prediction == 'fake':
            if confidence >= 0.9:
                summary = "This review is highly likely to be fake. "
            elif confidence >= 0.75:
                summary = "This review is likely to be fake. "
            else:
                summary = "This review shows some suspicious characteristics. "
            
            # if reasons:
            #     summary += "Key indicators: " + "; ".join(reasons[:3]) + "."
            
        else:
            if confidence >= 0.9:
                summary = "This review appears to be genuine with high confidence. "
            elif confidence >= 0.75:
                summary = "This review appears to be genuine. "
            else:
                summary = "This review shows characteristics of genuine feedback. "
            
            # if reasons:
            #     summary += "Key factors: " + "; ".join(reasons[:3]) + "."
        
        return summary


_justification_generator = None

def get_justification_generator():
    """Get or create justification generator instance"""
    global _justification_generator
    if _justification_generator is None:
        _justification_generator = JustificationGenerator()
    return _justification_generator