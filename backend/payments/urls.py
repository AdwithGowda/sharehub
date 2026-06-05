from django.urls import path
from .views import ProcessPaymentView, AdminPaymentListView, CreateRazorpayOrderView

urlpatterns = [
    path('create-order/', CreateRazorpayOrderView.as_view(), name='create_razorpay_order'),
    path('process/', ProcessPaymentView.as_view(), name='payment_process'),
    path('', AdminPaymentListView.as_view(), name='admin_payment_list'),
]
