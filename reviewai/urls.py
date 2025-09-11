from django.urls import path
from . import views

app_name = 'reviewai'

urlpatterns = [
    path('', views.analyze_view, name='analyze'),
    
    path('blueprint', views.blueprint_view, name='blueprint'),
    path('landing', views.landing_view, name='landing'),
    
    path('predict/', views.predict_review, name='predict'),
    path('history/', views.review_history, name='history'),
    path('dashboard/', views.user_dashboard, name='user_dashboard'),

    # API PATH FOR REVIEW COUNT AJAX
    path("review-count/", views.review_count, name="review_count"),


    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-history/', views.admin_history, name='admin_history'),


    path('api/analyze-review/', views.extension_predict, name='extension_predict'),
    path('api/analyze-batch-reviews/', views.extension_batch_predict, name='extension_batch'),
    path('api/quick-analyze/', views.extension_quick_analyze, name='extension_quick_analyze'),
    path('api/get-batch-limit/', views.get_batch_limit, name='get_batch_limit'),
]