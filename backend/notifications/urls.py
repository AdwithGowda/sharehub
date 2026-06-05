from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, AdminBroadcastNotificationView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification_mark_read'),
    path('admin/broadcast/', AdminBroadcastNotificationView.as_view(), name='notification_admin_broadcast'),
]
