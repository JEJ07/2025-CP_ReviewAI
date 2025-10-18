from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from reviewai.views import log_activity


from django.core.cache import cache
import time
from django.http import HttpResponseForbidden
from django.conf import settings
from django.utils.http import url_has_allowed_host_and_scheme
from django.http import JsonResponse
from django.utils import timezone
import ipaddress
from .forms import RegisterForm  


def register_view(request):
    if request.user.is_authenticated:
        return redirect('reviewai:analyze')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            login(request, user)
            messages.success(request, f'Welcome, {username}! Your account was created successfully.')

            log_activity(
                user=user,
                action='user_register',
                description='User registered via web app',
                request=request
            )

            return redirect('reviewai:analyze')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = RegisterForm()

    return render(request, 'users/register.html', {'form': form})

##SETTINGS
MAX_FAILED_ATTEMPTS = getattr(settings, 'MAX_FAILED_ATTEMPTS', 5)
LOCKOUT_TIME = getattr(settings, 'LOCKOUT_TIME', 300)  # 5 minutes


def login_view(request):
    if request.user.is_authenticated:
        return redirect('reviewai:analyze')

    client_ip = get_client_ip(request)
    cache_key = f"login_attempts_{client_ip}"

    # Rate limiting logic only in prod 
    if not settings.DEBUG:
        attempts_data = cache.get(cache_key, {"count": 0, "lock_until": 0})
        locked = attempts_data["lock_until"] > time.time()
        time_left = int(attempts_data["lock_until"] - time.time()) if locked else 0
    else:
        attempts_data = {"count": 0, "lock_until": 0}
        locked = False
        time_left = 0

    if request.method == 'POST':
        # Honeypot protection
        if request.POST.get('email_confirm'):
            return HttpResponseForbidden("Bot detected")

        # Check if user is locked out
        if locked:
            messages.error(
                request,
                f"Too many failed login attempts. Try again in {time_left} seconds."
            )
            return render(request, 'users/login.html', {
                'form': AuthenticationForm(),
                'locked': True,
                'time_left': time_left
            })

        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            # Reset failed attempts on successful login
            cache.delete(cache_key)
            
            user = form.get_user()
            login(request, user)

            remember_me = request.POST.get("remember-me") == "on"  # checkbox value
            
            if remember_me:
                # if checked, may age of expiry
                request.session.set_expiry(settings.SESSION_COOKIE_AGE)
                print(f"[DEBUG] Remember Me ENABLED - Session will last {settings.SESSION_COOKIE_AGE} seconds")
            else:
                # session expires when browser closes
                request.session.set_expiry(0)
                print(f"[DEBUG] Remember Me DISABLED - Session expires when browser closes")
            
            # Force session to be saved
            request.session.modified = True

            #  debugging
            expiry_date = request.session.get_expiry_date()
            expiry_age = request.session.get_expiry_age()
            session_key = request.session.session_key
            
            print(f"""
                [DEBUG SESSION INFO]
                User: {user.username}
                Remember Me: {remember_me}
                Session Key: {session_key}
                Expires at: {expiry_date}
                Expires in: {expiry_age} seconds
                Browser close expiry: {request.session.get_expire_at_browser_close()}
            """)

            messages.success(request, f'Welcome back, {user.username}!')
            
            try:
                log_activity(
                    user=user,
                    action='login',
                    description=f'User logged in via web app (Remember Me: {remember_me})',
                    request=request
                )
            except NameError:
                pass  

            # redirect
            next_url = request.POST.get('next')
            if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
                return redirect(next_url)

            # Redirect based on user type
            if user.is_staff or user.is_superuser:
                return redirect('reviewai:admin_dashboard')
            else:
                return redirect('reviewai:user_dashboard')
                
        else:
            # failed login attempts
            attempts_data["count"] += 1
            if attempts_data["count"] >= MAX_FAILED_ATTEMPTS:
                attempts_data["lock_until"] = time.time() + LOCKOUT_TIME
                messages.error(
                    request,
                    f"Too many failed login attempts. Try again in {LOCKOUT_TIME // 60} minutes."
                )
            else:
                messages.error(request, "Invalid username or password.")
            
            cache.set(cache_key, attempts_data, LOCKOUT_TIME)

    else:
        form = AuthenticationForm()

    return render(request, 'users/login.html', {
        'form': form,
        'locked': locked,
        'time_left': time_left
    })


def get_client_ip(request):
    ## Extracts and validates the real client IP address.
    ## Handles proxies, spoofing, and invalid values.
    ip = None
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        ip_list = [ip.strip() for ip in x_forwarded_for.split(",") if ip.strip()]
        ip = ip_list[0] if ip_list else None

    if not ip:
        ip = request.META.get("HTTP_X_REAL_IP")

    if not ip:
        ip = request.META.get("REMOTE_ADDR")

    try:
        ip_obj = ipaddress.ip_address(ip)
        ip = "127.0.0.1" if ip_obj.is_loopback else str(ip_obj)
    except Exception:
        ip = "unknown"

    return ip




@login_required
def logout_view(request):
    if request.user.is_authenticated:
        username = request.user.username

        try:
            log_activity(
                user=request.user,
                action='logout',
                description='User logged out via web app',
                request=request
            )
        except NameError:
            pass
    
    logout(request)
    messages.info(request, f'You have been logged out. See you later, {username}!')
    return redirect('reviewai:analyze')



@login_required  
def update_session_preference(request):
    """AJAX view to update remember me preference without re-login"""
    if request.method == 'POST':
        remember_me = request.POST.get('remember_me') == 'true'
        
        if remember_me:
            request.session.set_expiry(settings.SESSION_COOKIE_AGE)
            message = f"Session extended to {settings.SESSION_COOKIE_AGE // 86400} days"
        else:
            request.session.set_expiry(0)  # Expire when browser closes
            message = "Session will expire when browser closes"
        
        request.session.modified = True
        
        return JsonResponse({
            'success': True, 
            'message': message,
            'expire_at_browser_close': request.session.get_expire_at_browser_close(),
            'expiry_age': request.session.get_expiry_age()
        })
    
    return JsonResponse({'error': 'POST method required'})

@login_required
def profile_view(request):
    return render(request, 'users/profile.html')

@login_required
def edit_profile_view(request):
    if request.method == 'POST':
        # Get form data
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        email = request.POST.get('email', '').strip()
        
        # Validate email uniqueness (if provided)
        if email and User.objects.filter(email=email).exclude(pk=request.user.pk).exists():
            messages.error(request, 'This email is already in use by another account.')
            return render(request, 'users/edit_profile.html')
        
        # Update user profile
        user = request.user
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.save()

        log_activity(
            user=user,
            action='edit_profile',
            description='User updated profile information',
            request=request
        )
        
        messages.success(request, 'Your profile has been updated successfully!')
        return redirect('users:profile')
    
    return render(request, 'users/edit_profile.html')