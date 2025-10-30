from reviewai.models import FAQ


FAQ.objects.create(
    question="What is ReviewAI?",
    answer="ReviewAI is an AI-powered system that identifies fake product reviews using Natural Language Processing (NLP) and Machine Learning models.",
    category="general"
)

FAQ.objects.create(
    question="How does ReviewAI detect fake reviews?",
    answer="ReviewAI analyzes the text of reviews using NLP techniques like tokenization, stop-word removal, and TF-IDF, then classifies them using models such as SVM, Random Forest, and DistilBERT.",
    category="process"
)

FAQ.objects.create(
    question="What is the purpose of ReviewAI?",
    answer="The system aims to help consumers make informed purchasing decisions by filtering out fake or deceptive product reviews.",
    category="general"
)


FAQ.objects.create(
    question="What dataset was used for training ReviewAI?",
    answer="ReviewAI was trained on a dataset of genuine and fake reviews collected from e-commerce platforms, preprocessed and labeled for supervised learning.",
    category="data"
)

FAQ.objects.create(
    question="What preprocessing steps are applied to reviews?",
    answer="Each review undergoes text cleaning, tokenization, lemmatization, and removal of stop words before being converted into TF-IDF vectors or word embeddings.",
    category="process"
)

FAQ.objects.create(
    question="What is Natural Language Processing (NLP) and why is it important in ReviewAI?",
    answer=(
        "NLP allows ReviewAI to understand human language and convert text into structured data that machine learning models can analyze. "
        "It includes processes like tokenization, lemmatization, stop-word removal, and vectorization using TF-IDF or embeddings. "
        "Through NLP, ReviewAI can capture the linguistic and semantic patterns that distinguish fake reviews from genuine ones."
    ),
    category="nlp"
)

FAQ.objects.create(
    question="How does NLP work with machine learning in ReviewAI?",
    answer=(
        "NLP prepares and transforms raw text into numerical representations through techniques like TF-IDF or word embeddings. "
        "These processed features are then passed into models such as SVM, Random Forest, and DistilBERT to determine whether a review is genuine or fake. "
        "In essence, NLP handles the language understanding, while the models handle the classification."
    ),
    category="nlp"
)


FAQ.objects.create(
    question="Which machine learning models are used in ReviewAI?",
    answer="ReviewAI uses Support Vector Machine (SVM), Random Forest, and DistilBERT for classifying reviews as real or fake.",
    category="models"
)

FAQ.objects.create(
    question="How does each model contribute to ReviewAI's performance?",
    answer=(
        "Each model supports ReviewAI’s detection in different ways:\n"
        "- **Support Vector Machine (SVM):** Ideal for high-dimensional text data, it uses TF-IDF features to separate fake and real reviews with precise decision boundaries.\n"
        "- **Random Forest:** Combines multiple decision trees to reduce overfitting and handle complex review variations, increasing reliability.\n"
        "- **DistilBERT:** A transformer-based deep learning model that understands the contextual meaning of words, capturing subtle deceptive language patterns that traditional ML models might miss."
    ),
    category="models"
)

FAQ.objects.create(
    question="Why combine multiple models in ReviewAI?",
    answer="Combining multiple models allows ReviewAI to balance interpretability, accuracy, and performance, leading to a more robust and reliable fake review detection system.",
    category="models"
)

FAQ.objects.create(
    question="What is DistilBERT and why is it used?",
    answer="DistilBERT is a lightweight version of BERT that captures semantic meaning. It helps ReviewAI understand complex language structures, enabling better detection of nuanced fake reviews.",
    category="models"
)

FAQ.objects.create(
    question="How accurate is ReviewAI in detecting fake reviews?",
    answer="Accuracy depends on the dataset and model used. Combining models like Random Forest and DistilBERT achieved strong performance in testing based on precision, recall, and F1-score metrics.",
    category="performance"
)

FAQ.objects.create(
    question="Can ReviewAI be used on any review platform?",
    answer="Currently, ReviewAI supports major e-commerce platforms such as Shopee, Lazada, eBay, and Amazon through its web interface and Chrome extension.",
    category="usage"
)

FAQ.objects.create(
    question="Does ReviewAI store user data?",
    answer="No. ReviewAI only processes textual review content and does not store any private or personally identifiable user information.",
    category="privacy"
)

FAQ.objects.create(
    question="Can ReviewAI explain why a review is considered fake?",
    answer="Yes. Depending on the model, ReviewAI can highlight linguistic or semantic cues that influenced the classification, improving interpretability and transparency.",
    category="features"
)

FAQ.objects.create(
    question="What technologies were used to build ReviewAI?",
    answer="The system was built using Python, Django, and NLP/ML libraries such as scikit-learn, NLTK, PyTorch, and Hugging Face Transformers.",
    category="technology"
)

FAQ.objects.create(
    question="Is ReviewAI open source?",
    answer="The project can be open-sourced to promote collaboration, transparency, and continued research improvement.",
    category="general"
)

FAQ.objects.create(
    question="How can ReviewAI improve in the future?",
    answer="Future improvements include expanding multilingual datasets, refining NLP preprocessing, and exploring advanced transformer models like RoBERTa and GPT-based classifiers.",
    category="future"
)
