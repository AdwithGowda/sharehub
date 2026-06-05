from django.urls import path
from .views import ProcessPaymentView, AdminPaymentListView

urlpatterns = [
    path('process/', ProcessPaymentView.as_view(), name='payment_process'),
    path('', AdminPaymentListView.as_view(), name='admin_payment_list'),
]
