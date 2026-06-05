from django.urls import path
from .views import RaiseDamageClaimView, AdminResolveDisputeView, AdminDamageClaimListView

urlpatterns = [
    path('raise/', RaiseDamageClaimView.as_view(), name='dispute_raise'),
    path('admin/resolve/<int:pk>/', AdminResolveDisputeView.as_view(), name='dispute_admin_resolve'),
    path('admin/claims/', AdminDamageClaimListView.as_view(), name='admin_claims_list'),
]

