from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views
app_name = 'reviewai'

urlpatterns = [
    path('', views.analyze_view, name='analyze'),
    
    path('blueprint', views.blueprint_view, name='blueprint'),
    path('developer-page', views.developer_page, name='developer_page'),
    path('blueprintdev', views.blueprint_developer_page, name='blueprintdeveloper_page'),

    # CHABOT FAQ
    path("chatbot/", views.chatbot_view, name="chatbot"),
    path("faq-list/", views.faq_list, name="faq_list"),
    path('chatbot/initial-suggestions/', views.initial_suggestions, name='initial_suggestions'),

    path('predict/', views.predict_review, name='predict'),
    path('history/', views.review_history, name='history'),
    path('dashboard/', views.user_dashboard, name='user_dashboard'),

    # API PATH FOR REVIEW COUNT AJAX
    path("review-count/", views.review_count, name="review_count"),


    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-history/', views.admin_history, name='admin_history'),
    path('admin-activity-log/', views.admin_activity_log, name='admin_activity_log'),
    path('admin-model-performance/', views.admin_model_performance, name='admin_model_performance'),


    ###### ROUTES FOR PLATFORMS ###########
    path('admin-lazada/', views.admin_lazada, name='admin_lazada'),
    path('admin-shopee/', views.admin_shopee, name='admin_shopee'),
    path('admin-amazon/', views.admin_amazon, name='admin_amazon'),
    path('admin-ebay/', views.admin_ebay, name='admin_ebay'),

    ###### ENDD ###########
    
    

    
    path('export-dashboard-pdf/', views.export_dashboard_pdf, name='export_dashboard_pdf'),

    ###### api routes for extension ###########
    path('api/analyze-review/', views.extension_predict, name='extension_predict'),
    path('api/analyze-batch-reviews/', views.extension_batch_predict, name='extension_batch'),
    path('api/quick-analyze/', views.extension_quick_analyze, name='extension_quick_analyze'),
    path('api/get-batch-limit/', views.get_batch_limit, name='get_batch_limit'),

    path('api/login/', views.extension_login, name='api_login'),
    path('api/logout/', views.extension_logout, name='api_logout'),
    path('api/user-info/', views.extension_user_info, name='api_user_info'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)