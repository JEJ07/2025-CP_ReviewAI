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
from .utils.fake_review_detector import get_detector
from .utils.model_justification_generator import get_model_justification_generator  # NEW
# from .utils.fake_review_detector2 import get_detector
# from .utils.justification_generator import get_justification_generator
from .utils.language_detector import is_english, get_language_error_message
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Count, Avg, Q
from .models import ActivityLog

import os
import io
import base64
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from reportlab.lib.utils import ImageReader
from django.conf import settings
from .models import Review, ReviewAnalysis
from .utils.timezone_utils import convert_to_user_timezone, get_current_user_time
from .utils.visualization import create_confusion_matrix_plot, create_performance_comparison_chart
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from matplotlib.figure import Figure
from .models import FAQ
import difflib
from difflib import SequenceMatcher
import random

logger = logging.getLogger(__name__)


from django.http import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from matplotlib.figure import Figure

from .models import Review



from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from matplotlib.figure import Figure
from reviewai.models import Review
from django.contrib.auth.models import User
from datetime import datetime



from datetime import datetime
from django.http import FileResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from matplotlib.figure import Figure
from django.contrib.auth.models import User
from .models import Review
from datetime import date

def privacy_policy(request):
    return render(request, "reviewai/privacy.html", {
        "effective_date": date.today().strftime("%B %d, %Y")
    })
    
@staff_member_required
def export_dashboard_pdf(request):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    ## Title ##
    p.setFont("Helvetica-Bold", 20)
    p.setFillColor(colors.HexColor("#333333"))
    p.drawCentredString(width / 2, height - 50, "📊 ReviewAI Dashboard Report")

    ### Statss ###
    total_reviews = Review.objects.count()
    fake_count = Review.objects.filter(analyses__result__in=["fake", "likely_fake"]).count()
    genuine_count = Review.objects.filter(analyses__result__in=["genuine", "likely_genuine"]).count()
    total_users = User.objects.count()
    guest_reviews = Review.objects.filter(user__isnull=True).count()

    # Platforms
    extension_reviews = Review.objects.filter(platform="extension").count()
    web_reviews = Review.objects.filter(platform="web").count()
    lazada_reviews = Review.objects.filter(platform="lazada").count()
    shopee_reviews = Review.objects.filter(platform="shopee").count()
    amazon_reviews = Review.objects.filter(platform="amazon").count()

    stats_left = [
        f"• Total Reviews: {total_reviews}",
        f"• Fake Reviews: {fake_count}",
        f"• Genuine Reviews: {genuine_count}",
        f"• Active Users: {total_users}",
    ]
    stats_right = [
        f"• Guest Reviews: {guest_reviews}",
        f"• Web App Reviews: {web_reviews}",
        f"• Extension Reviews: {extension_reviews}",
        f"• Lazada Reviews: {lazada_reviews}",
        f"• Shopee Reviews: {shopee_reviews}",
        f"• Amazon Reviews: {amazon_reviews}",
    ]

    p.setFont("Helvetica", 11)
    p.setFillColor(colors.black)

    y = height - 120
    for line in stats_left:
        p.drawString(60, y, line)
        y -= 18

    y = height - 120
    for line in stats_right:
        p.drawString(300, y, line)
        y -= 18

    ## Charts ##
    # Classification chart
    fig1 = Figure(figsize=(3, 2))
    ax1 = fig1.subplots()
    bars1 = ax1.bar(
        ["Genuine", "Fake"],
        [genuine_count, fake_count],
        color=["#4CAF50", "#F44336"]
    )
    ax1.set_title("Classification Results")

    #  value labels
    for bar in bars1:
        height_val = bar.get_height()
        ax1.text(
            bar.get_x() + bar.get_width() / 2, height_val + 0.5,
            f"{height_val}", ha="center", va="bottom", fontsize=8
        )

    chart_buf1 = io.BytesIO()
    fig1.savefig(chart_buf1, format="PNG", bbox_inches="tight")
    chart_buf1.seek(0)
    chart_img1 = ImageReader(chart_buf1)
    p.drawImage(chart_img1, 60, height - 380, width=200, height=150)

    # Platforms chart
    fig2 = Figure(figsize=(3.5, 2.5))  
    ax2 = fig2.subplots()
    platforms = ["Web", "Extension", "Lazada", "Shopee", "Amazon"]
    values = [web_reviews, extension_reviews, lazada_reviews, shopee_reviews, amazon_reviews]
    colors_list = ["#2196F3", "#FF9800", "#4CAF50", "#9C27B0", "#FF5722"]

    bars2 = ax2.bar(platforms, values, color=colors_list)
    ax2.set_title("Top Platforms")
    ax2.set_xticklabels(platforms, rotation=30, ha="right")  

    # Add value labels
    for bar in bars2:
        height_val = bar.get_height()
        ax2.text(
            bar.get_x() + bar.get_width() / 2, height_val + 0.5,
            f"{height_val}", ha="center", va="bottom", fontsize=8
        )

    chart_buf2 = io.BytesIO()
    fig2.savefig(chart_buf2, format="PNG", bbox_inches="tight")
    chart_buf2.seek(0)
    chart_img2 = ImageReader(chart_buf2)
    p.drawImage(chart_img2, 320, height - 380, width=220, height=160)

    ## Summary ##
    p.setFont("Helvetica-Bold", 14)
    p.setFillColor(colors.black)
    p.drawString(50, height - 430, "Summary")

    p.setFont("Helvetica", 12)
    p.drawString(70, height - 450, f"✔ {genuine_count} Genuine reviews detected")
    p.drawString(70, height - 470, f"✘ {fake_count} Fake reviews detected")
    p.drawString(70, height - 490, f"👥 {guest_reviews} Guest reviews submitted")

    ## Recent Reviews ##
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, height - 520, "Recent Reviews (Last 10)")
    p.setFont("Helvetica", 10)

    y = height - 540
    for r in Review.objects.all().order_by("-created_at")[:10]:
        analysis = r.analyses.first()
        line = f"{r.product_name[:50]} → {analysis.get_result_display() if analysis else 'N/A'}"
        p.drawString(70, y, line)
        y -= 15
        if y < 60:
            p.showPage()
            y = height - 60

    ## FOOTER
    now = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    p.setFont("Helvetica-Oblique", 9)
    p.setFillColor(colors.grey)
    p.drawCentredString(width / 2, 30, f"Generated on {now} | ReviewAI Dashboard")

    p.showPage()
    p.save()
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename="dashboard_report.pdf")





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
        "ebay": {
            "logo": "reviewai/images/ebay.png",
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
                "confidence": round(p["avg_conf"] * 100, 1),
                "color": platform_meta[code]["color"],
                "text_color": platform_meta[code]["text_color"],
            })
            
    video_filename = "tutorial/reviewai_installation.mp4"
    video_path = os.path.join(settings.MEDIA_ROOT, video_filename)

    video_url = settings.MEDIA_URL + video_filename if os.path.exists(video_path) else None

    return render(request, 'reviewai/analyze.html', {
        "stats": stats,
        "video_url": video_url,
        })

# api for review count ajax
def review_count(request):
    total_reviews = Review.objects.count()
    return JsonResponse({"total_reviews": total_reviews})

def terms_of_use(request):
    return render(request, 'reviewai/terms_of_use.html', {
        "effective_date": date.today().strftime("%B %d, %Y")
    })

def blueprint_view(request):
    return render(request, 'reviewai/blueprint.html')
def landing_view(request):
    return render(request, 'reviewai/landing.html')


def developer_page(request):
    return render(request, 'reviewai/developers_page.html')

def blueprint_developer_page(request):
    return render(request, 'reviewai/blueprint_developer.html')

@csrf_exempt
@require_http_methods(["POST"])
def predict_review(request):
    try:
        data = json.loads(request.body)
        review_text = data.get('review_text', '').strip()
        
        logger.info(f"DEBUG: Received review_text = '{review_text}'")
        logger.info(f"DEBUG: Byte representation = {review_text.encode('utf-8')}")

        if not review_text or len(review_text) < 3:
            return JsonResponse({
                'success': False,
                'error': 'Review text must be at least 3 characters long'
            }, status=400)

        word_count = len(review_text.split())
        if word_count < 1:
            return JsonResponse({
                'success': False,
                'error': 'Review text must contain at least 1 word'
            }, status=400)
        
        detector_instance = get_detector()

        is_eng, detected_lang = is_english(review_text)
        if not is_eng:
            error_msg = get_language_error_message(detected_lang)
            return JsonResponse({
                'error': error_msg,
                'detected_language': detected_lang,
                'supported_languages': ['en']
            }, status=400)
        
        result = detector_instance.predict_single_review(review_text)
        
        # Generate model-based justification
        justification_gen = get_model_justification_generator(detector_instance)
        justification = justification_gen.generate_justification(
            review_text=review_text,
            prediction=result['prediction'],
            confidence=result['confidence'],
            cleaned_text=result.get('cleaned_text')
        )
        
        logger.info(f"Prediction completed for review length: {len(review_text)}")
        
        try:
            product_name = data.get('product_name', 'Unknown Product')
            user = request.user if request.user.is_authenticated else None
            
            cleaned_text = result.get('cleaned_text', review_text)
            
            review = Review.objects.create(
                user=user,
                product_name=product_name[:255],
                review_text=cleaned_text,
                platform='web',
                created_at=timezone.now()
            )

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
            logger.info(f"Saved review {review.id} with cleaned text and analysis {analysis.id} for user {username}")
            
        except Exception as save_error:
            logger.warning(f"Database save failed: {save_error}")
        
        return JsonResponse({
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'individual_predictions': result.get('individual_predictions'),
            'cleaned_text': result.get('cleaned_text'),
            'original_text': review_text,
            'justification': justification
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
    
    user_fake_analyses = ReviewAnalysis.objects.filter(
        review__user=request.user,
        result__in=['fake', 'likely_fake', 'possibly_fake']
    ).select_related('review')
    
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
    
    #wordcloud img for specific user
    user_wordcloud_image = generate_wordcloud(user_fake_analyses)

    
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
    ##    'user_fake_word_frequency': user_fake_word_frequency, ## OPTIONAL NA
        'user_wordcloud_image': user_wordcloud_image,
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

        token = data.get('token')
        user = get_user_from_token(token) if token else None
        
        detector_instance = get_detector()

        is_eng, detected_lang = is_english(review_text)
        if not is_eng:
            error_msg = get_language_error_message(detected_lang)
            return JsonResponse({
                'success': False,
                'error': error_msg,
                'detected_language': detected_lang,
                'supported_languages': ['en'],
                'status': 'error'
            }, status=400)

        result = detector_instance.predict_single_review(review_text)
        
        justification_gen = get_model_justification_generator(detector_instance)
        justification = justification_gen.generate_justification(
            review_text=review_text,
            prediction=result['prediction'],
            confidence=result['confidence'],
            cleaned_text=result.get('cleaned_text')
        )

        try:
            raw_product = data.get('product_name', 'Unknown Product')
            product_name = str(raw_product).strip() if raw_product else 'Unknown Product'
            
            platform = data.get('platform_name', 'extension')
            
            raw_link = data.get('link', '')
            link = str(raw_link).strip() if raw_link else None
            if link == '':
                link = None
            
            cleaned_text = result.get('cleaned_text', review_text)
            
            logger.info(f"Processing extension review - Platform: {platform}")
            logger.info(f"User: {user.username if user else 'Anonymous'}")
            logger.info(f"Original text: '{review_text[:50]}...'")
            logger.info(f"Cleaned text: '{cleaned_text[:50]}...'")
            
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
                
                logger.info(f"SAVED: Extension review {review.id} with cleaned text and analysis {analysis.id} for user {user.username if user else 'Anonymous'}")
            
        except Exception as save_error:
            logger.error(f"Extension database save failed: {save_error}")
        
        return JsonResponse({
            'success': True,
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'individual_predictions': result.get('individual_predictions'),
            'cleaned_text': result.get('cleaned_text'),
            'original_text': review_text,
            'justification': justification,
            'justification_simple': {
                'prediction': justification['prediction'],
                'confidence': justification['confidence'],
                'reasons': justification.get('simple_reasons', justification.get('reasons', [])),
                'overall_summary': justification.get('overall_summary', ''),
                'flags': justification.get('flags', {}),
                'sentiment_analysis': justification.get('sentiment_analysis', {})
            },
            'link': link,
            'user_logged_in': user is not None
        })
        
    except Exception as e:
        logger.error(f"Extension prediction error: {str(e)}")
        return JsonResponse({
            'success': False,
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

        # Get user from token
        token = data.get('token')
        user = get_user_from_token(token) if token else None

        detector_instance = get_detector()
        justification_gen = get_model_justification_generator(detector_instance)
        results = []
        skipped = []
        
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
                elif isinstance(review_data, dict):
                    raw_text = review_data.get('text', '')
                    if not isinstance(raw_text, str):
                        logger.error(f"Batch #{i+1}: 'text' field is not a string: {type(raw_text)} - {raw_text}")
                        results.append({
                            'error': f'Invalid text format at review {i+1}',
                            'prediction': 'error'
                        })
                        continue
                    
                    review_text = raw_text.strip()
                    
                    raw_product = review_data.get('product_name', default_product)
                    product_name = str(raw_product).strip() if raw_product else default_product
                    
                    link = review_data.get('link', default_link)
                else:
                    logger.error(f"Batch #{i+1}: Invalid review_data type: {type(review_data)}")
                    results.append({
                        'error': f'Invalid data format at review {i+1}',
                        'prediction': 'error'
                    })
                    continue

                if not review_text or len(review_text) < 5:
                    logger.warning(f"Batch #{i+1}: Empty or too short review text")
                    results.append({
                        'error': f'Empty review text at review {i+1}',
                        'prediction': 'error'
                    })
                    continue

                is_eng, detected_lang = is_english(review_text)
                if not is_eng:
                    error_msg = get_language_error_message(detected_lang)
                    logger.warning(f"Batch #{i+1}: Non-English review detected ({detected_lang})")
                    skipped.append({
                        'index': i,
                        'reason': error_msg,
                        'text': review_text[:100]
                    })
                    continue

                logger.info(f"Batch #{i+1}: Processing review: '{review_text[:50]}...'")
                
                result = detector_instance.predict_single_review(review_text)
                
                justification = justification_gen.generate_justification(
                    review_text=review_text,
                    prediction=result['prediction'],
                    confidence=result['confidence'],
                    cleaned_text=result.get('cleaned_text')
                )
                
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
                            user=user,
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
                    'justification': justification,
                    'justification_simple': {
                        'prediction': justification['prediction'],
                        'confidence': justification['confidence'],
                        'reasons': justification.get('simple_reasons', justification.get('reasons', [])),
                        'overall_summary': justification.get('overall_summary', ''),
                        'flags': justification.get('flags', {}),
                        'sentiment_analysis': justification.get('sentiment_analysis', {})
                    },
                    'original_text': review_text,
                    'link': link,
                    'text': review_text
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
            'skipped': skipped,
            'user_logged_in': user is not None,
            'total_processed': len(results),
            'total_skipped': len(skipped)
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

        is_eng, detected_lang = is_english(review_text)
        if not is_eng:
            error_msg = get_language_error_message(detected_lang)
            return JsonResponse({
                'error': error_msg,
                'detected_language': detected_lang,
                'supported_languages': ['en'],
                'status': 'error'
            }, status=400)
        
        result = detector_instance.predict_single_review(review_text)
        
        # justification_gen = get_justification_generator()
        # justification = justification_gen.generate_justification(
        #     review_text=review_text,
        #     prediction=result['prediction'],
        #     confidence=result['confidence'],
        #     cleaned_text=result.get('cleaned_text')
        # )
        
        logger.info(f"Quick analysis completed (not saved): {len(review_text)} chars")
        
        return JsonResponse({
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities'],
            'individual_predictions': result.get('individual_predictions'),
            'cleaned_text': result.get('cleaned_text'),
            # 'justification': justification 
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

@staff_member_required
def admin_model_performance(request):
    try:
        detector_instance = get_detector()
        performance_data = detector_instance.get_model_performance()
        model_info = detector_instance.get_model_info()

        static_dir = os.path.join(settings.BASE_DIR, 'reviewai', 'static', 'reviewai', 'charts')

        for model_name, metrics in performance_data.items():
            img_path = os.path.join(static_dir, f'confusion_matrix_{model_name}.png')
            if not os.path.exists(img_path):
                create_confusion_matrix_plot(metrics['confusion_matrix'], model_name, save_path=img_path)

        perf_chart_path = os.path.join(static_dir, 'performance_comparison.png')
        if not os.path.exists(perf_chart_path):
            create_performance_comparison_chart(performance_data, save_path=perf_chart_path)

        # Prepare data for Plotly charts
        plotly_data = {
            "models": list(performance_data.keys()),
            "accuracy": [performance_data[m]["accuracy"] for m in performance_data],
            "precision": [performance_data[m]["precision"] for m in performance_data],
            "recall": [performance_data[m]["recall"] for m in performance_data],
            "f1_score": [performance_data[m]["f1_score"] for m in performance_data],
        }

        context = {
            'performance_data': performance_data,
            'model_info': model_info,
            'plotly_data': json.dumps(plotly_data),
        }

        return render(request, 'reviewai/admin/admin_model_performance.html', context)

    except Exception as e:
        logger.error(f"Model performance view error: {str(e)}")
        context = {
            'error': str(e),
            'performance_data': {},
            'model_info': {},
            'plotly_data': json.dumps({}),
        }
        return render(request, 'reviewai/admin/admin_model_performance.html', context)

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

### CHATBOT FAQ
def faq_list(request):
    faqs = FAQ.objects.all().order_by('category')
    grouped = {}

    for faq in faqs:
        if faq.category not in grouped:
            grouped[faq.category] = []
        grouped[faq.category].append({
            "id": faq.id,
            "question": faq.question,
            "answer": faq.answer,
        })
    
    return JsonResponse(grouped)

def initial_suggestions(request):
    faqs = list(FAQ.objects.all())
    random.shuffle(faqs)
    suggestions = [f.question for f in faqs[:3]]
    return JsonResponse({"suggestions": suggestions})


@csrf_exempt
def chatbot_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        message = data.get("message", "").strip().lower()

        faqs = FAQ.objects.all()
        best_match = None
        highest_score = 0

        # Fuzzy similarity matching to find closest FAQ
        for faq in faqs:
            score = SequenceMatcher(None, message, faq.question.lower()).ratio()
            if score > highest_score:
                highest_score = score
                best_match = faq

        # Consider anything above 0.4 as "good enough" match
        if best_match and highest_score > 0.4:
            category = best_match.category

            # Related questions from same category
            related_same = list(
                FAQ.objects.filter(category=category).exclude(id=best_match.id)
            )
            random.shuffle(related_same)
            related_same = related_same[:2]

            # Add one random from another category to encourage flow
            other_category = random.choice(
                [c for c in FAQ.objects.values_list("category", flat=True).distinct() if c != category]
            )
            related_other = random.choice(list(FAQ.objects.filter(category=other_category)))

            suggestions = [r.question for r in related_same]
            suggestions.append(related_other.question)

            response = {
                "answer": best_match.answer,
                "suggestions": suggestions,
            }

        else:
            # No close match found
            general_faqs = list(FAQ.objects.filter(category="general")[:3])
            suggestions = [f.question for f in general_faqs]
            response = {
                "answer": "I'm sorry, I couldn’t find a direct match. Try one of these related questions:",
                "suggestions": suggestions,
            }

        return JsonResponse(response)
    
@csrf_exempt
@require_http_methods(["POST"])
def check_language(request):
    try:
        data = json.loads(request.body)
        text = data.get('text', '').strip()
        
        if not text:
            return JsonResponse({
                'success': False,
                'error': 'Text is required'
            }, status=400)

        is_eng, detected_lang = is_english(text)
        
        return JsonResponse({
            'success': True,
            'isEnglish': is_eng,
            'detectedLanguage': detected_lang
        })
        
    except Exception as e:
        logger.error(f"Language check error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)