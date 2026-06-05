from django.urls import path
from .views import LeaveReviewView, AdminReviewListView, AdminReviewDeleteView

urlpatterns = [
    path('leave-feedback/', LeaveReviewView.as_view(), name='review_leave'),
    path('admin/', AdminReviewListView.as_view(), name='admin_review_list'),
    path('admin/<int:pk>/', AdminReviewDeleteView.as_view(), name='admin_review_delete'),
]
