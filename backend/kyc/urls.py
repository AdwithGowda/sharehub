from django.urls import path
from .views import KYCSubmitView, AdminKYCReviewView

urlpatterns = [
    path('submit/', KYCSubmitView.as_view(), name='kyc_submit'),
    path('admin/review/', AdminKYCReviewView.as_view(), name='admin_kyc_list'),
    path('admin/review/<int:pk>/', AdminKYCReviewView.as_view(), name='admin_kyc_action'),
]
