import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemService } from '../../services/itemService';
import { bookingService } from '../../services/bookingService';
import { platformService } from '../../services/platformService';
import { AuthContext } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/imageUrl';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [platformSettings, setPlatformSettings] = useState({ commission_rate: 10, max_booking_days: 30 });

  // Form Date Parameter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Real-Time Calculation Matrix States
  const [totals, setTotals] = useState({ days: 0, rent: 0, fee: 0, deposit: 0, gross: 0 });

  useEffect(() => {
    const loadItemDetails = async () => {
      try {
        const [data, settings] = await Promise.all([
          itemService.getItemDetail(id),
          platformService.getSettings()
        ]);
        setItem(data);
        setPlatformSettings(settings);
      } catch (err) {
        setError('Failed to retrieve the specification profile for this asset listing.');
      } finally {
        setLoading(false);
      }
    };
    loadItemDetails();
  }, [id]);

  // Recalculate transaction aggregates dynamically when calendar variables adjust
  useEffect(() => {
    if (!startDate || !endDate || !item) {
      setTotals({ days: 0, rent: 0, fee: 0, deposit: 0, gross: 0 });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const computedDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (computedDays <= 0) {
      setTotals({ days: 0, rent: 0, fee: 0, deposit: 0, gross: 0 });
      return;
    }

    const rentalFee = item.price_per_day * computedDays;
    const commissionRate = parseFloat(platformSettings.commission_rate || 10) / 100;
    const platformFee = rentalFee * commissionRate;
    const depositAmount = parseFloat(item.deposit_amount);

    setTotals({
      days: computedDays,
      rent: rentalFee,
      fee: platformFee,
      deposit: depositAmount,
      gross: rentalFee + platformFee + depositAmount
    });
  }, [startDate, endDate, item, platformSettings]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (totals.days <= 0) {
      setError(' Leases must contain a valid duration window minimum of 1 day.');
      return;
    }

    if (totals.days > Number(platformSettings.max_booking_days || 30)) {
      setError(`Bookings cannot exceed ${platformSettings.max_booking_days} days.`);
      return;
    }
    
    if (user && Number(item?.owner) === Number(user?.id)) {
      setError('You cannot rent your own listed asset.');
      return;
    }

    if (user && !user.is_verified) {
      setError(
        <span>
          You must complete identity verification (KYC) before renting or booking assets. Please upload your documents in the{' '}
          <Link to="/dashboard/kyc" className="underline text-blue-600 font-bold hover:text-blue-800 transition-colors">
            Trust Verification
          </Link>{' '}
          page.
        </span>
      );
      return;
    }
    
    setError('');
    setSuccessMsg('');
    setBookingLoading(true);

    try {
      await bookingService.createBooking({
        item: item.id,
        start_date: startDate,
        end_date: endDate
      });
      setSuccessMsg('Your reservation proposal was filed successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'A problem occurred processing your order terms.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      setError('');
      setSuccessMsg('');
      await itemService.deleteItem(id);
      setSuccessMsg('Listing deleted successfully. Redirecting to home...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete the listing.');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error && !item) return <div className="text-center text-red-600 font-semibold py-12">{error}</div>;

  const mainImage = item.images && item.images.length > 0 
    ? getImageUrl(item.images[0].image) 
    : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Structural Path Indicator Crumbs */}
      <nav className="text-sm font-semibold text-slate-400">
        <Link to="/" className="hover:text-blue-600 transition-colors">Marketplace</Link> &gt; <span>{item.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Media Gallery Asset Block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video w-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
            <img src={mainImage} alt={item.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">{item.title}</h1>
                <p className="text-sm font-semibold text-blue-600 mt-1">{item.category_name}</p>
              </div>
              <p className="text-xs bg-slate-100 px-3 py-1.5 text-slate-500 rounded-lg font-bold">📍 {item.location}</p>
            </div>
            
            <hr className="border-slate-100" />
            
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Description From Owner</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Lease Calculation & Checkout Control Sidebar */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-24 space-y-6">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Daily Rate Base</p>
            <h2 className="text-3xl font-black text-slate-900 mt-0.5">
              {formatINR(item.price_per_day)}<span className="text-sm font-medium text-slate-400"> / day</span>
            </h2>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pickup Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Return Date</label>
                <input
                  type="date"
                  required
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Error / Success Notifications Block */}
            {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">{error}</div>}
            {successMsg && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100">{successMsg}</div>}

            {/* Dynamically Generated Pricing Calculations Breakdown Drawer */}
            {totals.days > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 text-xs font-semibold text-slate-600 space-y-2.5 border border-slate-100 animate-fade-in">
                <div className="flex justify-between">
                  <span>Rental Fees ({totals.days} days)</span>
                  <span className="text-slate-900">{formatINR(totals.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Service Fee ({platformSettings.commission_rate}%)</span>
                  <span className="text-slate-900">{formatINR(totals.fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refundable Security Deposit</span>
                  <span className="text-slate-900">{formatINR(totals.deposit)}</span>
                </div>
                <hr className="border-slate-200/60 my-1" />
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>Total Due Today</span>
                  <span className="text-blue-600">{formatINR(totals.gross)}</span>
                </div>
              </div>
            )}

            {/* Context Actions Controls Mapping */}
            {isAuthenticated ? (
              user?.role === 'ADMIN' || user?.is_staff ? (
                <div className="text-center p-3 text-xs bg-red-50 text-red-700 font-bold rounded-xl border border-red-100">
                  Administrators cannot book items for rent.
                </div>
              ) : Number(item?.owner) === Number(user?.id) ? (
                <div className="space-y-3">
                  <div className="text-center p-3 text-xs bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-100">
                    You are the registered owner of this listing.
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteListing}
                    className="w-full text-center py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold rounded-xl border border-red-200 transition duration-200 cursor-pointer"
                  >
                    Delete Listed Item
                  </button>
                </div>
              ) : (
                <Button type="submit" loading={bookingLoading}>
                  Request Booking Lease
                </Button>
              )
            ) : (
              <Link to="/login" className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-xs">
                Log In to Reserve Item
              </Link>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
