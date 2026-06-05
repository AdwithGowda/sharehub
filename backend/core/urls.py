from django.urls import path

from .views import PlatformSettingsView

urlpatterns = [
    path('platform-settings/', PlatformSettingsView.as_view(), name='platform_settings'),
]
