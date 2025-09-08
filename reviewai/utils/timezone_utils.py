from django.utils import timezone
from django.conf import settings
import pytz

def get_user_timezone(user=None):

    # You can extend this later to get from user.profile.timezone
    return settings.TIME_ZONE  # 'Asia/Manila'

def convert_to_user_timezone(datetime_obj, user=None):
 
    if datetime_obj is None:
        return None
    
    user_tz = get_user_timezone(user)
    user_timezone = pytz.timezone(user_tz)
    
    # Convert to user's timezone
    return timezone.localtime(datetime_obj, user_timezone)

def get_current_user_time(user=None):

    return convert_to_user_timezone(timezone.now(), user)