from django import template
from django.utils import timezone
from ..utils.timezone_utils import convert_to_user_timezone

register = template.Library()

@register.filter
def user_localtime(datetime_obj, user=None):

    # Convert UTC datetime to user's local timezone
    # Usage: {{ review.created_at|user_localtime:request.user }}

    return convert_to_user_timezone(datetime_obj, user)

@register.simple_tag(takes_context=True)
def current_user_time(context):

    # Get current time in user's timezone
    # Usage: {% current_user_time %}
    
    user = context.get('request').user if context.get('request') else None
    return convert_to_user_timezone(timezone.now(), user)