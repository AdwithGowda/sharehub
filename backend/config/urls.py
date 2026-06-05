from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/kyc/', include('kyc.urls')),
    path('api/items/', include('items.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/disputes/', include('disputes.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/core/', include('core.urls')),
]

# Serves uploaded media photos (profile pics, item images, KYC IDs) locally during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
