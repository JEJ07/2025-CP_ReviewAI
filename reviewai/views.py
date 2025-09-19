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
import re
from collections import Counter
# from .utils.fake_review_detector import get_detector
from .utils.fake_review_detector2 import get_detector
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Count, Avg, Q
from .models import ActivityLog


import io
import base64
from wordcloud import WordCloud
import matplotlib.pyplot as plt

from django.conf import settings
from .models import Review, ReviewAnalysis
from .utils.timezone_utils import convert_to_user_timezone, get_current_user_time


logger = logging.getLogger(__name__)

def analyze_view(request):
    platform_stats = (
        ReviewAnalysis.objects
        .values("review__platform")  
        .annotate(avg_conf=Avg("confidence_score"))
    )
    
    platform_meta = {
        "lazada": {
            "logo": "reviewai/images/laz.png",
            "color": "bg-blue-500",
            "text_color": "text-blue-600",
        },
        "shopee": {
            "logo": "reviewai/images/shopee.png",
            "color": "bg-orange-500",
            "text_color": "text-orange-600",
        },
        "amazon": {
            "logo": "reviewai/images/amazon.png",
            "color": "bg-blue-700",
            "text_color": "text-blue-700",
        },
        # add lng other platforms here if ok
    }
    
    stats = []
    for p in platform_stats:
        code = p["review__platform"]
        if code in platform_meta:
            stats.append({
                "name": code.capitalize(),
                "logo": platform_meta[code]["logo"],
                "confidence": round(p["avg_conf"] * 100, 1),  # % format
                "color": platform_meta[code]["color"],
                "text_color": platform_meta[code]["text_color"],
            })

    return render(request, 'reviewai/analyze.html', {"stats": stats})

# api for review count ajax
def review_count(request):
    total_reviews = Review.objects.count()
    return JsonResponse({"total_reviews": total_reviews})


def blueprint_view(request):
    return render(request, 'reviewai/blueprint.html')
def landing_view(request):
    return render(request, 'reviewai/landing.html')

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
            
            # Get ML-cleaned text
            cleaned_text = result.get('cleaned_text', review_text)
            
            review = Review.objects.create(
                user=user,
                product_name=product_name[:255],
                review_text=cleaned_text,
                platform='web',
                created_at=timezone.now()
            )

            # Log the activity
            log_activity(
                user=user,
                action='analysis',
                description=f'Analyzed review for "{product_name[:50]}..." via web app',
                request=request
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
            
            analysis = ReviewAnalysis.objects.create(
                review=review,
                result=db_result,
                confidence_score=confidence,
                model='ensemble_svm_rf_distilbert',
                created_at=timezone.now()
            )
            
            username = request.user.username if request.user.is_authenticated else 'Guest'
            logger.info(f"Saved review {review.id} with cleaned text and analysis {analysis.id} for user {username}")
            
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
    
    for review in reviews:
        review.local_created_at = convert_to_user_timezone(review.created_at, request.user)
        for analysis in review.analyses.all():
            analysis.local_created_at = convert_to_user_timezone(analysis.created_at, request.user)
    
    context = {
        'reviews': reviews,
        'total_reviews': all_reviews.count(),
    }
    return render(request, 'reviewai/history.html', context)

@staff_member_required
def admin_history(request):
    
    result_filter = request.GET.get('result')
    confidence_filter = request.GET.get('confidence')
    platform_filter = request.GET.get('platform')
    
    all_reviews = Review.objects.select_related('user').prefetch_related('analyses').order_by('-created_at')
    
    #filter result
    if result_filter:
        all_reviews = all_reviews.filter(analyses__result=result_filter)
    
    if confidence_filter:
        try:
            threshold = float(confidence_filter)
            #print("Filtering with threshold:", threshold)  
            all_reviews = all_reviews.filter(analyses__confidence_score__gte=threshold)
            #print("Count after filter:", all_reviews.count())  # DEBUG
        except ValueError:
            pass
        
        
    if platform_filter:
        all_reviews = all_reviews.filter(platform=platform_filter)
        
        
    paginator = Paginator(all_reviews, 25)
    page_number = request.GET.get('page')
    reviews = paginator.get_page(page_number)
    
    for review in reviews:
        review.local_created_at = convert_to_user_timezone(review.created_at, request.user)
        for analysis in review.analyses.all():
            analysis.local_created_at = convert_to_user_timezone(analysis.created_at, request.user)
    
    context = {
        'reviews': reviews,
        'total_reviews': all_reviews.count(),
        'platform_choices': Review.PLATFORM_CHOICES, 
        "selected_platform": platform_filter, 
        
    }
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'reviewai/admin/partials/review_table.html', context)

    return render(request, 'reviewai/admin/admin_history.html', context)

# FUNC TO ADMIN LAZADA
@staff_member_required
def admin_lazada(request):
    lazada_reviews = (
        Review.objects.filter(platform="lazada")
        .prefetch_related("analyses")
        .order_by("-created_at")
    )

    total_reviews = lazada_reviews.count()
    paginator = Paginator(lazada_reviews, 25)
    page_number = request.GET.get("page")
    reviews = paginator.get_page(page_number)


    
    raw_stats = (
        ReviewAnalysis.objects.filter(review__platform="lazada")
        .values("result")
        .annotate(count=Count("id"))
    )
    
    analysis_stats = []
    for stat in raw_stats:
        temp = ReviewAnalysis(result=stat["result"])
        analysis_stats.append({
            "result": temp.get_result_display(),  # Human-readable Likely Genuine
            "code": stat["result"],               # Raw code likely_genuine
            "count": stat["count"],
        })
    

    genuine_count = ReviewAnalysis.objects.filter(
        review__platform="lazada", result="genuine"
    ).count()

    fake_count = ReviewAnalysis.objects.filter(
        review__platform="lazada", result="fake"
    ).count()

    avg_confidence = (
        ReviewAnalysis.objects.filter(review__platform="lazada")
        .aggregate(Avg("confidence_score"))["confidence_score__avg"]
    )

    context = {
        "reviews": reviews,
        "total_reviews": total_reviews,
        "analysis_stats": analysis_stats,
        "genuine_count": genuine_count,     
        "fake_count": fake_count,
        "avg_confidence": round(avg_confidence * 100, 2) if avg_confidence else None,
    }

    return render(request, "reviewai/admin/admin_lazada.html", context)

# FUNC TO ADMIN SHOPEE
@staff_member_required
def admin_shopee(request):
    shopee_reviews = (
        Review.objects.filter(platform="shopee")
        .prefetch_related("analyses")
        .order_by("-created_at")
    )

    total_reviews = shopee_reviews.count()
    paginator = Paginator(shopee_reviews, 25)
    page_number = request.GET.get("page")
    reviews = paginator.get_page(page_number)

    # Stats
    analysis_stats = (
        ReviewAnalysis.objects.filter(review__platform="shopee")
        .values("result")
        .annotate(count=Count("id"))
    )
    
    genuine_count = ReviewAnalysis.objects.filter(
        review__platform="shopee", result="genuine"
    ).count()

    fake_count = ReviewAnalysis.objects.filter(
        review__platform="shopee", result="fake"
    ).count()

    avg_confidence = (
        ReviewAnalysis.objects.filter(review__platform="shopee")
        .aggregate(Avg("confidence_score"))["confidence_score__avg"]
    )

    context = {
        "reviews": reviews,
        "total_reviews": total_reviews,
        "analysis_stats": analysis_stats,
        "genuine_count": genuine_count,     
        "fake_count": fake_count,
        "avg_confidence": round(avg_confidence * 100, 2) if avg_confidence else None,
    }

    return render(request, "reviewai/admin/admin_shopee.html", context)

@staff_member_required
def admin_amazon(request):
    amazon_reviews = (
        Review.objects.filter(platform="amazon")
        .prefetch_related("analyses")
        .order_by("-created_at")
    )

    total_reviews = amazon_reviews.count()
    paginator = Paginator(amazon_reviews, 25)
    page_number = request.GET.get("page")
    reviews = paginator.get_page(page_number)

    # Stats
    analysis_stats = (
        ReviewAnalysis.objects.filter(review__platform="amazon")
        .values("result")
        .annotate(count=Count("id"))
    )
    
    genuine_count = ReviewAnalysis.objects.filter(
        review__platform="amazon", result="genuine"
    ).count()

    fake_count = ReviewAnalysis.objects.filter(
        review__platform="amazon", result="fake"
    ).count()

    avg_confidence = (
        ReviewAnalysis.objects.filter(review__platform="amazon")
        .aggregate(Avg("confidence_score"))["confidence_score__avg"]
    )

    context = {
        "reviews": reviews,
        "total_reviews": total_reviews,
        "analysis_stats": analysis_stats,
        "genuine_count": genuine_count,     
        "fake_count": fake_count,
        "avg_confidence": round(avg_confidence * 100, 2) if avg_confidence else None,
    }

    return render(request, "reviewai/admin/admin_amazon.html", context)

@staff_member_required
def admin_ebay(request):
    ebay_reviews = (
        Review.objects.filter(platform="ebay")
        .prefetch_related("analyses")
        .order_by("-created_at")
    )

    total_reviews = ebay_reviews.count()
    paginator = Paginator(ebay_reviews, 25)
    page_number = request.GET.get("page")
    reviews = paginator.get_page(page_number)

    # Stats
    analysis_stats = (
        ReviewAnalysis.objects.filter(review__platform="ebay")
        .values("result")
        .annotate(count=Count("id"))
    )
    
    genuine_count = ReviewAnalysis.objects.filter(
        review__platform="ebay", result="genuine"
    ).count()

    fake_count = ReviewAnalysis.objects.filter(
        review__platform="ebay", result="fake"
    ).count()

    avg_confidence = (
        ReviewAnalysis.objects.filter(review__platform="ebay")
        .aggregate(Avg("confidence_score"))["confidence_score__avg"]
    )

    context = {
        "reviews": reviews,
        "total_reviews": total_reviews,
        "analysis_stats": analysis_stats,
        "genuine_count": genuine_count,     
        "fake_count": fake_count,
        "avg_confidence": round(avg_confidence * 100, 2) if avg_confidence else None,
    }

    return render(request, "reviewai/admin/admin_ebay.html", context)

def get_fake_review_word_frequency(user=None, limit=10):
    fake_analyses = ReviewAnalysis.objects.filter(
        result__in=['fake', 'likely_fake', 'possibly_fake']
    )
    
    if user:
        fake_analyses = fake_analyses.filter(review__user=user)
    
    fake_texts = fake_analyses.select_related('review').values_list('review__review_text', flat=True)
    
    # Process words
    word_counter = Counter()
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
        'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 
        'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 
        'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 
        'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 
        'which', 'who', 'whom', 'whose', 'am', 'is', 'are', 'was', 'were', 
        'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
        'did', 'doing', 'will', 'would', 'should', 'could', 'can', 'may', 
        'might', 'must', 'shall', 'not', 'no', 'yes'
    }
    
    for text in fake_texts:
        if text:
            words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
            filtered_words = [word for word in words if word not in stop_words and len(word) >= 3]
            word_counter.update(filtered_words)
    
    return word_counter.most_common(limit)


def get_top_platforms(limit=5):
    return (
        Review.objects.values('platform')
        .annotate(count=Count('id'))
        .order_by('-count')[:limit]
    )


def generate_wordcloud(fake_reviews):
    
    # join all fake review texts
    fake_texts = " ".join([
        fa.review.review_text 
        for fa in fake_reviews 
        if fa.review.review_text
    ])

    #DEBUG PURPOSE LNG TO IDELETE LNG
    if fake_texts.strip():
        words = fake_texts.lower().split()
        word_counts = Counter(words)
        for word, count in word_counts.most_common(10):
            print(f"[DEBUG] The word count for '{word}' is: {count}")

        # Generate na once may text
        try:
            wc = WordCloud(width=800, height=400, background_color="white").generate(fake_texts)
            buf = io.BytesIO()
            wc.to_image().save(buf, format="PNG")
            buf.seek(0)
            return base64.b64encode(buf.getvalue()).decode("utf-8")
        except Exception as e:
            print("WordCloud error:", e)

    return None
    
@staff_member_required
def admin_dashboard(request):    
    
    #wordcloud
    fake_reviews = ReviewAnalysis.objects.filter(
        result__in=['fake', 'likely_fake', 'possibly_fake']
    ).select_related('review')

    #call lng ung function to generate wordcloud
    wordcloud_image = generate_wordcloud(fake_reviews)

    ##########DEBUG PURPOSE LNG TO IDELETE LNG #############
    if wordcloud_image:
        print("[DEBUG] WordCloud image generated successfully.")
    else:
        print("[DEBUG] WordCloud image generation failed.")

    total_reviews = Review.objects.count()
    total_users = User.objects.filter(reviews__isnull=False).distinct().count()
    guest_reviews_count = Review.objects.filter(user__isnull=True).count()
    top_platforms = get_top_platforms(limit=5)

    web_reviews_count = Review.objects.filter(platform='web').count()
    extension_reviews_count = Review.objects.exclude(platform='web').count()
    
    fake_count = ReviewAnalysis.objects.filter(
        result__in=['fake', 'likely_fake', 'possibly_fake']
    ).count()
    
    genuine_count = ReviewAnalysis.objects.filter(
        result__in=['genuine', 'likely_genuine', 'possibly_genuine']
    ).count()
    
    recent_reviews = Review.objects.select_related('user').prefetch_related('analyses').order_by('-created_at')[:5]
    
    fake_word_frequency = get_fake_review_word_frequency(limit=10)
    
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
    
    recent_reviews = Review.objects.select_related('user').prefetch_related('analyses').order_by('-created_at')[:5]
    
    for review in recent_reviews:
        review.local_created_at = convert_to_user_timezone(review.created_at, request.user)
        for analysis in review.analyses.all():
            analysis.local_created_at = convert_to_user_timezone(analysis.created_at, request.user)
    
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
        'fake_word_frequency': fake_word_frequency,  
        'top_platforms': top_platforms,
        'current_admin_time': get_current_user_time(request.user),
        "wordcloud_image": wordcloud_image,
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
    
    user_fake_word_frequency = get_fake_review_word_frequency(user=request.user, limit=10)
    
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
    
    for review in recent_user_reviews:
        review.local_created_at = convert_to_user_timezone(review.created_at, request.user)
        for analysis in review.analyses.all():
            analysis.local_created_at = convert_to_user_timezone(analysis.created_at, request.user)
    
    context = {
        'total_user_reviews': total_user_reviews,
        'user_fake_count': user_fake_count,
        'user_genuine_count': user_genuine_count,
        'recent_reviews_count': recent_reviews,
        'daily_data': daily_data,
        'top_products': top_products,
        'recent_user_reviews': recent_user_reviews,
        'username': request.user.username,
        'user_fake_word_frequency': user_fake_word_frequency,
        'current_user_time': get_current_user_time(request.user),
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

        # Get user from token
        token = data.get('token')
        user = get_user_from_token(token) if token else None
        
        detector_instance = get_detector()
        result = detector_instance.predict_single_review(review_text)
        
        try:
            product_name = data.get('product_name', 'Unknown Product').strip()
            platform = data.get('platform_name', 'extension')
            link = data.get('link', '').strip() or None
            
            # Get the ML-cleaned text from the result
            cleaned_text = result.get('cleaned_text', review_text)
            
            logger.info(f"Processing extension review - Platform: {platform}")
            logger.info(f"User: {user.username if user else 'Anonymous'}")
            logger.info(f"Original text: '{review_text[:50]}...'")
            logger.info(f"Cleaned text: '{cleaned_text[:50]}...'")
            
            # Check for duplicates using cleaned text AND product name
            existing_review = Review.objects.filter(
                platform=platform,
                product_name=product_name[:255],
                review_text=cleaned_text,
                user=user,
            ).first()
            
            if existing_review:
                logger.info(f"EXTENSION DUPLICATE: Match found (Review ID: {existing_review.id}) - SKIPPING SAVE")
            else:
                logger.info(f"NEW EXTENSION REVIEW: Saving cleaned text to database")
                
                review = Review.objects.create(
                    user=user,
                    product_name=product_name[:255],
                    review_text=cleaned_text,
                    platform=platform,
                    link=link,
                    created_at=timezone.now()
                )

                log_activity(
                    user=user,
                    action='analysis',
                    description=f'Analyzed review for "{product_name[:50]}..." via {platform} extension',
                    request=request
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
                
                analysis = ReviewAnalysis.objects.create(
                    review=review,
                    result=db_result,
                    confidence_score=confidence,
                    model='ensemble_svm_rf_distilbert',
                    created_at=timezone.now()
                )
                
                logger.info(f"SAVED: Extension review {review.id} with cleaned text and analysis {analysis.id} for user {user.username if user else 'Anonymous'}")
            
        except Exception as save_error:
            logger.error(f"Extension database save failed: {save_error}")
        
        return JsonResponse({
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'individual_predictions': result.get('individual_predictions'),
            'cleaned_text': result.get('cleaned_text'),
            'link': link,
            'user_logged_in': user is not None
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

        # Get user from token (new)
        token = data.get('token')
        user = get_user_from_token(token) if token else None

        detector_instance = get_detector()
        results = []
        
        platform = data.get('platform_name', 'extension')
        default_product = data.get('product_name', 'Unknown Product').strip()
        default_link = data.get('link', '').strip() or None

        logger.info(f"Starting batch analysis for platform: {platform}, {len(reviews)} reviews")
        logger.info(f"User: {user.username if user else 'Anonymous'}")
        
        for i, review_data in enumerate(reviews):
            try:
                if isinstance(review_data, str):
                    review_text = review_data.strip()
                    product_name = default_product
                    link = default_link
                else:
                    review_text = review_data.get('text', '').strip()
                    product_name = review_data.get('product_name', default_product).strip()
                    link = review_data.get('link', default_link)

                logger.info(f"Batch #{i+1}: Processing review: '{review_text[:50]}...'")
                
                result = detector_instance.predict_single_review(review_text)
                
                try:
                    cleaned_text = result.get('cleaned_text', review_text)
                    
                    # Check for duplicates using cleaned text AND product name
                    existing_review = Review.objects.filter(
                        platform=platform,
                        product_name=product_name[:255],
                        review_text=cleaned_text,
                        user=user
                    ).first()
                    
                    if existing_review:
                        logger.info(f"Batch #{i+1}: DUPLICATE DETECTED - Review ID {existing_review.id} - SKIPPING SAVE")
                    else:
                        logger.info(f"Batch #{i+1}: NEW REVIEW - Saving cleaned text to database")
                        
                        # Save cleaned text
                        review = Review.objects.create(
                            user=user,  # Now associates with user if logged in
                            product_name=product_name[:255],
                            review_text=cleaned_text,
                            platform=platform,
                            link=link,
                            created_at=timezone.now()
                        )

                        saved_count = len([r for r in results if 'error' not in r])
                        log_activity(
                            user=user,
                            action='batch_analysis',
                            description=f'Batch analyzed {len(results)} reviews ({saved_count} saved) via {platform} extension',
                            request=request
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
                        
                        logger.info(f"Batch #{i+1}: SAVED - Review {review.id} with cleaned text for user {user.username if user else 'Anonymous'}")
                    
                except Exception as save_error:
                    logger.warning(f"Batch extension save failed for review {i}: {save_error}")
                
                results.append({
                    'prediction': result['prediction'],
                    'confidence': result['confidence'],
                    'probabilities': result['probabilities'],
                    'individual_predictions': result.get('individual_predictions'),
                    'cleaned_text': result.get('cleaned_text'),
                    'link': link 
                })
                
            except Exception as e:
                logger.error(f"Batch review {i} processing error: {str(e)}")
                results.append({
                    'error': str(e),
                    'prediction': 'error'
                })
        
        logger.info(f"Batch processing completed. {len(results)} results generated.")
        return JsonResponse({
            'results': results,
            'user_logged_in': user is not None,
            'total_processed': len(results)
        }, safe=False)
        
    except Exception as e:
        logger.error(f"Extension batch prediction error: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def extension_quick_analyze(request):
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
        
        logger.info(f"Quick analysis completed (not saved): {len(review_text)} chars")
        
        return JsonResponse({
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'individual_predictions': result.get('individual_predictions'),
            'cleaned_text': result.get('cleaned_text')
        })
        
    except Exception as e:
        logger.error(f"Quick analysis error: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_batch_limit(request):
    batch_limit = getattr(settings, 'REVIEWAI_BATCH_LIMIT', 20)
    return JsonResponse({'batch_limit': batch_limit})

def log_activity(user, action, description, request=None):
    ip = None
    if request:
        ip = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR')
    print(f"Logging activity: {user}, {action}, {description}, {ip}")
    ActivityLog.objects.create(
        user=user,
        action=action,
        description=description,
        ip_address=ip
    )

@staff_member_required
def admin_activity_log(request):
    # Get filter parameters
    action_filter = request.GET.get('action')
    user_filter = request.GET.get('user')
    
    logs = ActivityLog.objects.select_related('user').order_by('-timestamp')
    
    # Apply filters
    if action_filter:
        logs = logs.filter(action=action_filter)
    
    if user_filter:
        logs = logs.filter(user__username__icontains=user_filter)
    
    # Pagination
    paginator = Paginator(logs, 50)
    page_number = request.GET.get('page')
    logs_page = paginator.get_page(page_number)
    
    # Convert timestamps for display
    for log in logs_page:
        log.local_timestamp = convert_to_user_timezone(log.timestamp, request.user)
    
    context = {
        'logs': logs_page,
        'total_logs': logs.count(),
        'action_choices': ActivityLog.ACTION_CHOICES,
        'current_action_filter': action_filter,
        'current_user_filter': user_filter,
    }
    return render(request, 'reviewai/admin/admin_activity_log.html', context)

def get_user_from_token(token):
    if not token:
        return None
    try:
        token_obj = Token.objects.get(key=token)
        return token_obj.user
    except Token.DoesNotExist:
        return None

# Add API login endpoint
@csrf_exempt
@require_http_methods(["POST"])
def extension_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'error': 'Username and password are required'
            }, status=400)
        
        user = authenticate(username=username, password=password)
        if user and user.is_active:
            token, created = Token.objects.get_or_create(user=user)
            log_activity(
                user=user,
                action='login',
                description='User logged in via browser extension',
                request=request
            )
            
            return JsonResponse({
                'success': True,
                'token': token.key,
                'username': user.username,
                'message': 'Login successful'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid username or password'
            }, status=401)
            
    except Exception as e:
        logger.error(f"API login error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Login failed'
        }, status=500)

# Add API logout endpoint
@csrf_exempt
@require_http_methods(["POST"])
def extension_logout(request):
    try:
        data = json.loads(request.body)
        token = data.get('token')
        
        if token:
            try:
                token_obj = Token.objects.get(key=token)
        
                # Log the logout
                log_activity(
                    user=token_obj.user,
                    action='logout',
                    description='User logged out via browser extension',
                    request=request
                )
                
                token_obj.delete()
                return JsonResponse({
                    'success': True,
                    'message': 'Logged out successfully'
                })
            except Token.DoesNotExist:
                pass
        
        return JsonResponse({
            'success': True,
            'message': 'Logged out'
        })
        
    except Exception as e:
        logger.error(f"API logout error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Logout failed'
        }, status=500)

# Add API user info endpoint
@csrf_exempt
@require_http_methods(["GET"])
def extension_user_info(request):
    try:
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token = auth_header.split(' ')[1]
            user = get_user_from_token(token)
            
            if user:
                return JsonResponse({
                    'success': True,
                    'user': {
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    }
                })
        
        return JsonResponse({
            'success': False,
            'error': 'Authentication required'
        }, status=401)
        
    except Exception as e:
        logger.error(f"API user info error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to get user info'
        }, status=500)