from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, ProfileView, WithdrawalRequestView, WithdrawalRequestDetailView,
    AdminUserListView, AdminUserToggleActiveView, AdminAnalyticsView, CustomTokenObtainPairView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='user_profile'),
    path('withdrawals/', WithdrawalRequestView.as_view(), name='user_withdrawals'),
    path('withdrawals/<int:pk>/', WithdrawalRequestDetailView.as_view(), name='withdrawal_detail'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/toggle/', AdminUserToggleActiveView.as_view(), name='admin_user_toggle'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
]
