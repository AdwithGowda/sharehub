import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { formatINR } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/imageUrl';
import Loader from '../../components/common/Loader';

export default function MyListings() {
  const { user } = useContext(AuthContext);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadOwnerReservations();
  }, [user]);

  const loadOwnerReservations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await bookingService.getUserBookings();
      setIncomingRequests(data.filter(b => b.item_details && b.item_details.owner === user.id));
    } catch (err) {
      console.error("Failed gathering owner listing requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionType) => {
    try {
      setActionId(id);
      await bookingService.triggerBookingAction(id, actionType);
      loadOwnerReservations();
    } catch (err) {
      alert(err.response?.data?.error || "Failed updating the rental request.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Loader />;

  const pendingRequests = incomingRequests.filter(r => r.status === 'PENDING');
  const activeRequests = incomingRequests.filter(r => r.status !== 'PENDING' && r.status !== 'CANCELLED' && r.status !== 'REJECTED');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Requests for My Listings</h2>
          <p className="text-sm text-slate-500 mt-1">Review rental requests from renters for items you own, then approve or reject them.</p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 p-6">
            <h4 className="font-bold text-slate-700 mt-1">All caught up!</h4>
            <p className="text-xs text-slate-400 mt-0.5">No renters are waiting for approval on your listed items right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    <img src={getImageUrl(req.item_details.images?.[0]?.image) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{req.item_details.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Requested by: <span className="font-bold text-slate-700">@{req.renter_username}</span>
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Rental dates: {req.start_date} to {req.end_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-0 pt-3 md:pt-0 border-slate-50">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Earnings</p>
                    <p className="text-base font-black text-emerald-600">{formatINR(req.rental_fee)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction(req.id, 'REJECT')}
                      disabled={actionId !== null}
                      className="px-3 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'APPROVE')}
                      disabled={actionId !== null}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionId === req.id ? "Updating..." : "Approve Request"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Approved and Active Rentals</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track approved requests, payment status, handovers, and completed rentals for your listings.</p>
        </div>

        {activeRequests.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 p-6 text-xs text-slate-400 font-semibold">
            No approved or active rentals found for your listings.
          </div>
        ) : (
          <div className="space-y-4">
            {activeRequests.map((req) => {
              const statusColors = {
                APPROVED: "bg-blue-50 text-blue-700 border-blue-100",
                PAID: "bg-indigo-50 text-indigo-700 border-indigo-100",
                ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
                COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
                DISPUTED: "bg-orange-50 text-orange-700 border-orange-100"
              };

              return (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                      <img src={getImageUrl(req.item_details.images?.[0]?.image) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColors[req.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {req.status}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{req.item_details.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Renter: <span className="font-bold text-slate-700">@{req.renter_username}</span>
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {req.start_date} to {req.end_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-0 pt-3 md:pt-0 border-slate-50">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earnings</p>
                      <p className="text-base font-black text-emerald-600">{formatINR(req.rental_fee)}</p>
                    </div>

                    <Link
                      to={`/dashboard/booking/${req.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer inline-block"
                    >
                      Manage Rental
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
