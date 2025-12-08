from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Review(models.Model):
    PLATFORM_CHOICES = [
        ('web', 'Web Application'),
        ('amazon', 'Amazon'),
        ('ebay', 'eBay'),
        ('shopee', 'Shopee'),
        ('lazada', 'Lazada'),
        ('flipkart', 'Flipkart'),
        ('aliexpress', 'AliExpress'),
        ('walmart', 'Walmart'),
        ('alibaba', 'Alibaba'),
        ('temu', 'Temu'),
        ('zalora', 'Zalora'),
        ('carousell', 'Carousell'),
        ('extension', 'Browser Extension'),
        ('other', 'Other Platform'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    product_name = models.CharField(max_length=255, default='Unknown Product')
    review_text = models.TextField()
    link = models.URLField(max_length=500, blank=True, null=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='web')  # NEW FIELD
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'review'
        
    def __str__(self):
        username = self.user.username if self.user else 'Guest'
        return f"{self.product_name} - {username} ({self.get_platform_display()})"

class ReviewAnalysis(models.Model):
    RESULT_CHOICES = [
        ('genuine', 'Genuine'),
        ('fake', 'Fake'),
        ('likely_genuine', 'Likely Genuine'),
        ('likely_fake', 'Likely Fake'),
        ('possibly_genuine', 'Possibly Genuine'),
        ('possibly_fake', 'Possibly Fake'),
        ('uncertain', 'Uncertain'),
    ]
    
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='analyses')
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    confidence_score = models.FloatField()
    model = models.CharField(max_length=100, default='ensemble_svm_rf_distilbert')
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'review_analysis'
        
    def __str__(self):
        return f"{self.review.product_name} - {self.result}"
    
    @property
    def confidence_percentage(self):
        return f"{self.confidence_score * 100:.1f}%"
    
class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        # ('review_create', 'Review Created'),
        # ('review_update', 'Review Updated'),
        # ('review_delete', 'Review Deleted'),
        ('analysis', 'Review Analyzed'),
        ('batch_analysis', 'Batch Analysis'),
        # ('user_register', 'User Registered'),
        # ('user_update', 'User Updated'),
        ('edit_profile', 'User Updated'),
        ('user_delete', 'User Deleted'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = 'activity_log'
        
    def __str__(self):
        return f"{self.user or 'Anonymous'} - {self.action} at {self.timestamp}"
    

### FAQ CHATBOT
class FAQ(models.Model):
    category_choices = [
        ("general", "General"),
        ("process", "Detection Process"),
        ("models", "Models Used"),
        ("data", "Data Sources"),
        ("usage", "System Usage"),
        ("nlp", "NLP"),
        ("performance", "Performance"),
        ("privacy", "Privacy"),
        ("features", "Features"),
        ("technology", "Technology"),
        ("future", "Future Improvements"),
    ]

    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=50, choices=category_choices, default="general")

    def __str__(self):
        return self.question