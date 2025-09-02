from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from django.core.paginator import Paginator
from datetime import datetime, timedelta
import json
import logging
from .utils.fake_review_detector import get_detector
from django.conf import settings
from .models import Review, ReviewAnalysis

logger = logging.getLogger(__name__)

def analyze_view(request):
    return render(request, 'reviewai/analyze.html')
def blueprint_view(request):
    return render(request, 'reviewai/blueprint.html')

@csrf_exempt
@require_http_methods(["POST"])
def predict_review(request):
    try:
        data = json.loads(request.body)
        review_text = data.get('review_text', '').strip()
        
        if not review_text:
            return JsonResponse({
                'success': False,
                'error': 'Please provide review text'
            }, status=400)
        
        detector_instance = get_detector()
        result = detector_instance.predict_single_review(review_text)
        
        logger.info(f"Prediction completed for review length: {len(review_text)}")
        
        try:
            product_name = data.get('product_name', 'Unknown Product')
            
            user = request.user if request.user.is_authenticated else None
            
            review = Review.objects.create(
                user=user,
                product_name=product_name[:255],
                review_text=review_text,
                platform='web',
                created_at=timezone.now()
            )
            
            prediction_lower = result['prediction'].lower().strip()
            confidence = result['confidence']
            
            if 'fake' in prediction_lower:
                if confidence >= 0.9:
                    db_result = 'fake'
                elif confidence >= 0.75:
                    db_result = 'likely_fake'
                elif confidence >= 0.6:
                    db_result = 'possibly_fake'
                else:
                    db_result = 'uncertain'
            else:
                if confidence >= 0.9:
                    db_result = 'genuine'
                elif confidence >= 0.75:
                    db_result = 'likely_genuine'
                elif confidence >= 0.6:
                    db_result = 'possibly_genuine'
                else:
                    db_result = 'uncertain'
            
            analysis = ReviewAnalysis.objects.create(
                review=review,
                result=db_result,
                confidence_score=confidence,
                model='ensemble_svm_rf_distilbert',
                created_at=timezone.now()
            )
            
            username = request.user.username if request.user.is_authenticated else 'Guest'
            logger.info(f"Saved review {review.id} and analysis {analysis.id} for user {username}")
            
        except Exception as save_error:
            logger.warning(f"Database save failed: {save_error}")
        
        return JsonResponse({
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'individual_predictions': result.get('individual_predictions'),
            'cleaned_text': result.get('cleaned_text')
        })
        
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }, status=500)

@login_required
def review_history(request):
    all_reviews = Review.objects.filter(user=request.user).prefetch_related('analyses').order_by('-created_at')
    
    paginator = Paginator(all_reviews, 25)
    page_number = request.GET.get('page')
    reviews = paginator.get_page(page_number)
    
    context = {
        'reviews': reviews,
        'total_reviews': all_reviews.count(),
    }
    return render(request, 'reviewai/history.html', context)

@staff_member_required
def admin_history(request):
    all_reviews = Review.objects.select_related('user').prefetch_related('analyses').order_by('-created_at')
    
    paginator = Paginator(all_reviews, 25)
    page_number = request.GET.get('page')
    reviews = paginator.get_page(page_number)
    
    context = {
        'reviews': reviews,
        'total_reviews': all_reviews.count(),
    }
    return render(request, 'reviewai/admin/admin_history.html', context)


@staff_member_required
def admin_dashboard(request):    
    total_reviews = Review.objects.count()
    
    total_users = User.objects.filter(reviews__isnull=False).distinct().count()
    guest_reviews_count = Review.objects.filter(user__isnull=True).count()
    
    web_reviews_count = Review.objects.filter(platform='web').count()
    extension_reviews_count = Review.objects.exclude(platform='web').count()
    
    fake_count = ReviewAnalysis.objects.filter(
        result__in=['fake', 'likely_fake', 'possibly_fake']
    ).count()
    
    genuine_count = ReviewAnalysis.objects.filter(
        result__in=['genuine', 'likely_genuine', 'possibly_genuine']
    ).count()
    
    recent_reviews = Review.objects.select_related('user').prefetch_related('analyses').order_by('-created_at')[:5]
    
    daily_data = []
    
    if total_reviews > 0:
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        reviews_by_date = Review.objects.filter(
            created_at__gte=thirty_days_ago
        ).extra(
            select={'date': 'DATE(created_at)'}
        ).values('date').annotate(
            total=Count('id')
        ).order_by('-date')[:7]
        
        for item in reviews_by_date:
            if item['date']:
                try:
                    if isinstance(item['date'], str):
                        date_obj = datetime.strptime(item['date'], '%Y-%m-%d').date()
                    else:
                        date_obj = item['date']
                    
                    daily_data.append({
                        'date': date_obj.strftime('%b %d'),
                        'total': item['total']
                    })
                except Exception:
                    daily_data.append({
                        'date': str(item['date']),
                        'total': item['total']
                    })
        
        daily_data = list(reversed(daily_data))
    
    top_users = User.objects.annotate(
        review_count=Count('reviews')
    ).filter(review_count__gt=0).order_by('-review_count')[:5]
    
    context = {
        'total_reviews': total_reviews,
        'fake_count': fake_count,
        'genuine_count': genuine_count,
        'total_users': total_users,
        'guest_reviews_count': guest_reviews_count,
        'web_reviews_count': web_reviews_count,
        'extension_reviews_count': extension_reviews_count,
        'recent_reviews': recent_reviews,
        'daily_data': daily_data,
        'top_users': top_users,
    }
    
    return render(request, 'reviewai/admin/admin_dashboard.html', context)

@login_required
def user_dashboard(request):    
    user_reviews = Review.objects.filter(user=request.user)
    total_user_reviews = user_reviews.count()
    
    user_fake_count = ReviewAnalysis.objects.filter(
        review__user=request.user,
        result__in=['fake', 'likely_fake', 'possibly_fake']
    ).count()
    
    user_genuine_count = ReviewAnalysis.objects.filter(
        review__user=request.user,
        result__in=['genuine', 'likely_genuine', 'possibly_genuine']
    ).count()
    
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_reviews = user_reviews.filter(created_at__gte=thirty_days_ago).count()
    
    daily_data = []
    if total_user_reviews > 0:
        user_reviews_by_date = user_reviews.filter(
            created_at__gte=thirty_days_ago
        ).extra(
            select={'date': 'DATE(created_at)'}
        ).values('date').annotate(
            total=Count('id')
        ).order_by('-date')[:7]
        
        for item in user_reviews_by_date:
            if item['date']:
                try:
                    if isinstance(item['date'], str):
                        date_obj = datetime.strptime(item['date'], '%Y-%m-%d').date()
                    else:
                        date_obj = item['date']
                    
                    daily_data.append({
                        'date': date_obj.strftime('%b %d'),
                        'total': item['total']
                    })
                except Exception:
                    daily_data.append({
                        'date': str(item['date']),
                        'total': item['total']
                    })
        
        daily_data = list(reversed(daily_data))
    
    top_products = user_reviews.values('product_name').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    recent_user_reviews = user_reviews.prefetch_related('analyses').order_by('-created_at')[:5]
    
    context = {
        'total_user_reviews': total_user_reviews,
        'user_fake_count': user_fake_count,
        'user_genuine_count': user_genuine_count,
        'recent_reviews_count': recent_reviews,
        'daily_data': daily_data,
        'top_products': top_products,
        'recent_user_reviews': recent_user_reviews,
        'username': request.user.username,
    }
    
    return render(request, 'reviewai/user_dashboard.html', context)

@csrf_exempt
@require_http_methods(["POST"])
def predict_batch(request):
    try:
        data = json.loads(request.body)
        review_texts = data.get('review_texts', [])
        batch_size = data.get('batch_size', 32)
        
        if not review_texts or not isinstance(review_texts, list):
            return JsonResponse({
                'success': False,
                'error': 'Please provide a list of review texts'
            }, status=400)
        
        detector_instance = get_detector()
        results = detector_instance.predict_batch(review_texts, batch_size)
        
        return JsonResponse({
            'success': True,
            'results': results,
            'total_processed': len(results)
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def extension_predict(request):
    try:
        data = json.loads(request.body)
        review_text = data.get('review_text', '').strip()
        
        if not review_text:
            return JsonResponse({
                'success': False,
                'error': 'Review text is required'
            }, status=400)

        detector_instance = get_detector()
        result = detector_instance.predict_single_review(review_text)
        
        try:
            product_name = data.get('product_name', 'Unknown Product')
            platform = data.get('platform_name', 'extension')
            
            review = Review.objects.create(
                user=None,
                product_name=product_name[:255],
                review_text=review_text,
                platform=platform,
                created_at=timezone.now()
            )
            
            prediction_lower = result['prediction'].lower().strip()
            confidence = result['confidence']
            
            if 'fake' in prediction_lower:
                if confidence >= 0.9:
                    db_result = 'fake'
                elif confidence >= 0.75:
                    db_result = 'likely_fake'
                elif confidence >= 0.6:
                    db_result = 'possibly_fake'
                else:
                    db_result = 'uncertain'
            else:
                if confidence >= 0.9:
                    db_result = 'genuine'
                elif confidence >= 0.75:
                    db_result = 'likely_genuine'
                elif confidence >= 0.6:
                    db_result = 'possibly_genuine'
                else:
                    db_result = 'uncertain'
            
            analysis = ReviewAnalysis.objects.create(
                review=review,
                result=db_result,
                confidence_score=confidence,
                model='ensemble_svm_rf_distilbert',
                created_at=timezone.now()
            )
            
            logger.info(f"Saved extension review {review.id} from platform: {platform}")
            
        except Exception as save_error:
            logger.warning(f"Extension database save failed: {save_error}")
        
        return JsonResponse({
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'individual_predictions': result.get('individual_predictions'),
            'cleaned_text': result.get('cleaned_text')
        })
        
    except Exception as e:
        logger.error(f"Extension prediction error: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def extension_batch_predict(request):
    try:
        data = json.loads(request.body)
        reviews = data.get('reviews', [])
        
        batch_limit = getattr(settings, 'REVIEWAI_BATCH_LIMIT', 20)
        if not reviews or len(reviews) > batch_limit:
            return JsonResponse({
                'error': f'Invalid number of reviews (1-{batch_limit} allowed)'
            }, status=400)

        detector_instance = get_detector()
        results = []
        
        platform = data.get('platform_name', 'extension')
        default_product = data.get('product_name', 'Unknown Product')
        
        for i, review_data in enumerate(reviews):
            try:
                if isinstance(review_data, str):
                    review_text = review_data
                    product_name = f"{default_product} #{i+1}"
                else:
                    review_text = review_data.get('text', '')
                    product_name = review_data.get('product_name', f"{default_product} #{i+1}")
                
                result = detector_instance.predict_single_review(review_text)
                
                try:
                    review = Review.objects.create(
                        user=None,
                        product_name=product_name[:255],
                        review_text=review_text,
                        platform=platform,
                        created_at=timezone.now()
                    )
                    
                    prediction_lower = result['prediction'].lower().strip()
                    confidence = result['confidence']
                    
                    if 'fake' in prediction_lower:
                        if confidence >= 0.9:
                            db_result = 'fake'
                        elif confidence >= 0.75:
                            db_result = 'likely_fake'
                        elif confidence >= 0.6:
                            db_result = 'possibly_fake'
                        else:
                            db_result = 'uncertain'
                    else:  # genuine
                        if confidence >= 0.9:
                            db_result = 'genuine'
                        elif confidence >= 0.75:
                            db_result = 'likely_genuine'
                        elif confidence >= 0.6:
                            db_result = 'possibly_genuine'
                        else:
                            db_result = 'uncertain'
                    
                    ReviewAnalysis.objects.create(
                        review=review,
                        result=db_result,
                        confidence_score=confidence,
                        model='ensemble_svm_rf_distilbert',
                        created_at=timezone.now()
                    )
                    
                    logger.info(f"Saved batch extension review {review.id}")
                    
                except Exception as save_error:
                    logger.warning(f"Batch extension save failed for review {i}: {save_error}")
                
                results.append({
                    'prediction': result['prediction'],
                    'confidence': result['confidence'],
                    'probabilities': result['probabilities'],
                    'individual_predictions': result.get('individual_predictions'),
                    'cleaned_text': result.get('cleaned_text')
                })
                
            except Exception as e:
                results.append({
                    'error': str(e),
                    'prediction': 'error'
                })
        
        return JsonResponse(results, safe=False)
        
    except Exception as e:
        logger.error(f"Extension batch prediction error: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_batch_limit(request):
    batch_limit = getattr(settings, 'REVIEWAI_BATCH_LIMIT', 20)
    return JsonResponse({'batch_limit': batch_limit})

# def model_info(request):
#     try:
#         detector_instance = get_detector()
#         info = detector_instance.get_model_info()
        
#         return JsonResponse({
#             'success': True,
#             'model_info': info
#         })
        
#     except Exception as e:
#         logger.error(f"Model info error: {str(e)}")
#         return JsonResponse({
#             'success': False,
#             'error': str(e)
#         }, status=500)