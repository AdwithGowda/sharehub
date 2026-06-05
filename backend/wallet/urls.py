from django.urls import path
from .views import CreateWalletTopupOrderView, AddTestFundsView, AdminWalletAdjustmentView, AdminWalletListView, WalletDashboardView

urlpatterns = [
    path('dashboard/', WalletDashboardView.as_view(), name='wallet_dashboard'),
    path('create-topup-order/', CreateWalletTopupOrderView.as_view(), name='wallet_create_topup_order'),
    path('test-topup/', AddTestFundsView.as_view(), name='wallet_test_topup'),
    path('admin/wallets/', AdminWalletListView.as_view(), name='admin_wallet_list'),
    path('admin/wallets/<int:pk>/adjust/', AdminWalletAdjustmentView.as_view(), name='admin_wallet_adjust'),
]
