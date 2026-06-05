import React, { useState } from 'react';
import { walletService } from '../../services/walletService';
import { formatINR } from '../../utils/formatCurrency';
import Button from '../common/Button';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentCard({ booking, onPaymentSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Compute absolute combined escrow charge parameters
  const rentalFee = parseFloat(booking.rental_fee);
  const depositFee = parseFloat(booking.deposit_amount);
  const serviceFee = parseFloat(booking.platform_fee);
  const aggregateTotal = rentalFee + depositFee + serviceFee;

  const handleRazorpayCheckout = async () => {
    try {
      setProcessing(true);
      setError('');

      // Load SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay SDK. Check network connection.');
        setProcessing(false);
        return;
      }

      // Create Order
      const order = await walletService.createRazorpayOrder(booking.id);

      if (order.is_mock) {
        // Fallback mock mode
        const simulatedPaymentToken = `pay_rzp_mock_${Math.random().toString(36).substring(2, 11)}`;
        await walletService.processBookingPayment({
          booking: booking.id,
          razorpay_payment_id: simulatedPaymentToken,
          razorpay_order_id: order.id,
          razorpay_signature: 'mock_signature'
        });
        if (onPaymentSuccess) onPaymentSuccess();
        setProcessing(false);
        return;
      }

      // Real Razorpay integration options
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'ShareHub Platform',
        description: `Escrow Security Shield for Booking #B-${booking.id}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            setProcessing(true);
            await walletService.processBookingPayment({
              booking: booking.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            if (onPaymentSuccess) onPaymentSuccess();
          } catch (err) {
            setError(err.response?.data?.error || 'Verification of signature failed.');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: booking.renter_username || '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.error || 'Payment gateway interface sync failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs max-w-sm w-full space-y-4">
      <div className="border-b border-slate-50 pb-3">
        <h4 className="font-bold text-slate-900 tracking-tight text-base">Escrow Payment Gateway</h4>
        <p className="text-[11px] text-slate-400 font-medium">Order Reference Target: #B-{booking.id}</p>
      </div>

      <div className="space-y-2 text-xs font-semibold text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100/60">
        <div className="flex justify-between">
          <span>Rental Allocation Rate</span>
          <span className="text-slate-900">{formatINR(rentalFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Insurance Margin</span>
          <span className="text-slate-900">{formatINR(serviceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Security Vault Deposit</span>
          <span className="text-slate-900">{formatINR(depositFee)}</span>
        </div>
        <hr className="border-slate-200/60 my-1" />
        <div className="flex justify-between text-sm font-black text-slate-900">
          <span>Total Payable Gross</span>
          <span className="text-blue-600">{formatINR(aggregateTotal)}</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">{error}</p>}

      <Button onClick={handleRazorpayCheckout} loading={processing}>
        Authorize Shield Payment
      </Button>
    </div>
  );
}
