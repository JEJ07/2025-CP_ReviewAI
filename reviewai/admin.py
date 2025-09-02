from django.contrib import admin
from .models import Review, ReviewAnalysis

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product_name', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['product_name', 'review_text', 'user__username']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(ReviewAnalysis)
class ReviewAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'review', 'result', 'confidence_score', 'model', 'created_at']
    list_filter = ['result', 'created_at', 'model']
    search_fields = ['review__product_name', 'review__user__username']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('review__user')