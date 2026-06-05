from django.urls import path
from .views import BookingChatView, AdminChatListView

urlpatterns = [
    path('thread/<int:booking_id>/', BookingChatView.as_view(), name='chat_thread'),
    path('admin/threads/', AdminChatListView.as_view(), name='admin_chat_list'),
]
