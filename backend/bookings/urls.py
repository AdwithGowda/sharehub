from django.urls import path
from .views import BookingListCreateView, BookingActionView, QRVerifyHandoverView, UploadReturnEvidenceView, ActivateLeaseView

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking_list_create'),
    path('<int:pk>/action/', BookingActionView.as_view(), name='booking_action'),
    path('<int:pk>/activate-lease/', ActivateLeaseView.as_view(), name='activate_lease'),
    path('<int:pk>/verify-pickup/', QRVerifyHandoverView.as_view(), name='qr_verify_pickup'),
    path('<int:pk>/upload-return/', UploadReturnEvidenceView.as_view(), name='booking_return_photos'),
]
