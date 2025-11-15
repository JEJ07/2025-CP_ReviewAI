from langdetect import detect, LangDetectException
import logging

logger = logging.getLogger(__name__)

def is_english(text):
    """
    Check if the given text is in English.
    
    Args:
        text (str): Text to check
        
    Returns:
        tuple: (is_english: bool, detected_language: str)
    """
    if not text or len(text.strip()) < 10:
        return False, "too_short"
    
    try:
        detected_lang = detect(text)
        return detected_lang == 'en', detected_lang
    except LangDetectException as e:
        logger.warning(f"Language detection failed: {e}")
        return False, "detection_failed"

def get_language_error_message(detected_lang):
    """
    Get user-friendly error message for non-English text.
    
    Args:
        detected_lang (str): Detected language code
        
    Returns:
        str: Error message
    """
    if detected_lang == "too_short":
        return "Text is too short for language detection. Please provide at least 10 characters."
    elif detected_lang == "detection_failed":
        return "Could not detect the language of the text. Please ensure it's in English."
    else:
        language_names = {
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'zh-cn': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'ru': 'Russian',
            'hi': 'Hindi',
            'tl': 'Tagalog',
        }
        lang_name = language_names.get(detected_lang, detected_lang.upper())
        return f"Only English reviews are supported. Detected language: {lang_name}."