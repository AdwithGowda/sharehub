import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatINR } from '../../utils/formatCurrency';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed loading booking pipeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (id, action) => {
    const actionLabels = {
      APPROVE: 'approve',
      REJECT: 'reject',
      CANCEL: 'cancel',
      COMPLETE: 'complete',
      HANDOVER: 'handover'
    };
    
    const confirmMessage = action === 'CANCEL'
      ? "Are you sure you want to cancel this booking? If the renter has paid, their escrow balance will be fully refunded."
      : `Are you sure you want to ${actionLabels[action]} this booking?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setProcessingId(id);
      await adminService.updateBookingStatus(id, action);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.error || `Error executing action: ${action}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Pipeline Auditing</h2>
        <p className="text-sm text-slate-500 mt-1">Monitor active and pending leases, verify escrow status, and execute administrative order status overrides.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-xs max-h-[615px] overflow-y-auto relative">
        {bookings.length === 0 ? (
          <div className="text-center py-12 font-semibold text-slate-400 text-xs">
            No booking transactions logged in the system.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-[inset_0_-1px_0_rgba(241,245,249,1)]">
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Booking Ref</th>
                <th className="px-4 py-3">Rental Gear</th>
                <th className="px-4 py-3">Renter</th>
                <th className="px-4 py-3">Lease Dates</th>
                <th className="px-4 py-3">Total Fee</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-2 font-mono font-bold text-slate-900">
                    #B-{b.id}
                  </td>
                  <td className="px-4 py-2">
                    <div>
                      <p className="font-bold text-slate-900">{b.item_details?.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Owner: @{b.item_details?.owner_username}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    @{b.renter_username}
                  </td>
                  <td className="px-4 py-2">
                    <div>
                      <p className="font-bold text-slate-800">{b.start_date}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">to {b.end_date}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-bold text-slate-900">
                    {formatINR(parseFloat(b.rental_fee) + parseFloat(b.deposit_amount) + parseFloat(b.platform_fee))}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-3 py-1.5 rounded-2xl border text-[10px] font-extrabold uppercase tracking-wider ${
                      b.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                      b.status === 'PENDING' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                      b.status === 'CANCELLED' ? 'border-slate-200 bg-slate-100 text-slate-600' :
                      b.status === 'DISPUTED' ? 'border-red-200 bg-red-50 text-red-700' :
                      'border-blue-200 bg-blue-50 text-blue-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
