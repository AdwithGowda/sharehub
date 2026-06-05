from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, AdminBroadcastNotificationView, MarkAllNotificationsReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('read-all/', MarkAllNotificationsReadView.as_view(), name='notification_mark_all_read'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification_mark_read'),
    path('admin/broadcast/', AdminBroadcastNotificationView.as_view(), name='notification_admin_broadcast'),
]
