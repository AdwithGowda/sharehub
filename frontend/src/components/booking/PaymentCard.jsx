import React, { useState } from 'react';
import { walletService } from '../../services/walletService';
import { formatINR } from '../../utils/formatCurrency';
import Button from '../common/Button';

export default function PaymentCard({ booking, onPaymentSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Compute absolute combined escrow charge parameters
  const rentalFee = parseFloat(booking.rental_fee);
  const depositFee = parseFloat(booking.deposit_amount);
  const serviceFee = parseFloat(booking.platform_fee);
  const aggregateTotal = rentalFee + depositFee + serviceFee;

  const handleSimulatedCheckout = async () => {
    try {
      setProcessing(true);
      setError('');
      
      // Generate a mock unique reference string matching payment gateway formats
      const simulatedPaymentToken = `pay_rzp_mock_${Math.random().toString(36).substring(2, 11)}`;
      
      // Dispatch verification payload to payment app backend layers
      await walletService.processBookingPayment(booking.id, simulatedPaymentToken);
      
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment gateway interface sync failed.');
    } finally {
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

      <Button onClick={handleSimulatedCheckout} loading={processing}>
        Authorize Shield Payment
      </Button>
    </div>
  );
}
