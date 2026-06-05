from django.apps import apps
from core.models import PlatformSettings

def create_notification(user, title, message):
    """
    Creates and saves a notification for the specified user if platform notifications are enabled.
    """
    settings = PlatformSettings.load()
    if not settings.notifications_enabled:
        return None
    
    Notification = apps.get_model('notifications', 'Notification')
    return Notification.objects.create(user=user, title=title, message=message)
