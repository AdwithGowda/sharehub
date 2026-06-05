import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { formatINR } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/imageUrl';
import Loader from '../../components/common/Loader';

export default function MyBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadRenterPipeline();
  }, [user]);

  const loadRenterPipeline = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await bookingService.getUserBookings();
      setBookings(data.filter(b => b.renter === user.id && b.item_details));
    } catch (err) {
      console.error("Failed gathering renter rows:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    try {
      setActionLoading(id);
      await bookingService.triggerBookingAction(id, 'CANCEL');
      loadRenterPipeline();
    } catch (err) {
      alert(err.response?.data?.error || "Error updating transaction.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Rental Bookings</h2>
        <p className="text-sm text-slate-500 mt-1">Track equipment you have leased or requested from local owners.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <h4 className="font-bold text-slate-800 mt-2">No active bookings found</h4>
          <p className="text-xs text-slate-400 mt-0.5">Explore the marketplace to find gear you need.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusColors = {
              PENDING: "bg-amber-50 text-amber-700 border-amber-100",
              APPROVED: "bg-blue-50 text-blue-700 border-blue-100",
              PAID: "bg-indigo-50 text-indigo-700 border-indigo-100",
              REJECTED: "bg-red-50 text-red-700 border-red-100",
              ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
              COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
              CANCELLED: "bg-slate-100 text-slate-400 border-slate-200",
              DISPUTED: "bg-orange-50 text-orange-700 border-orange-100"
            };

            const totalFee = parseFloat(booking.rental_fee) + parseFloat(booking.deposit_amount) + parseFloat(booking.platform_fee);
            const isPaymentReady = booking.status === 'APPROVED' && !booking.is_paid;

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 ${isPaymentReady ? 'border-blue-200' : 'border-slate-100'}`}
              >
                {isPaymentReady && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">Owner Approved</p>
                      <h3 className="text-sm font-black text-blue-950 mt-0.5">Proceed to Payment Gateways</h3>
                      <p className="text-xs font-medium text-blue-700 mt-1">
                        Your request is approved. Open the transaction panel to authorize escrow and lock the booking.
                      </p>
                    </div>
                    <Link
                      to={`/dashboard/booking/${booking.id}`}
                      className="shrink-0 text-center text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Proceed to Payment Gateways
                    </Link>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(booking.item_details.images?.[0]?.image) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border ${statusColors[booking.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {booking.status}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1">{booking.item_details.title}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {booking.start_date} to {booking.end_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left sm:text-right">Total Fee</p>
                      <p className="text-base font-black text-slate-900">
                        {formatINR(totalFee)}
                      </p>
                    </div>

                    {booking.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelClick(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 hover:bg-red-100/70 border border-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading === booking.id ? "Processing..." : "Cancel Request"}
                      </button>
                    )}

                    {booking.status !== 'PENDING' && booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && !isPaymentReady && (
                      <Link
                        to={`/dashboard/booking/${booking.id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-100 rounded-lg transition-colors cursor-pointer inline-block"
                      >
                        Manage & Chat
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
