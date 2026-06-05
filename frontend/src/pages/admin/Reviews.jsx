import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [lowRatingsOnly, setLowRatingsOnly] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getReviews();
      setReviews(data);
    } catch (err) {
      console.error("Failed loading reviews:", err);
      setError(err.response?.data?.error || 'Failed loading platform review directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user feedback? This action is irreversible.")) return;
    try {
      setError('');
      setSuccess('');
      await adminService.deleteReview(id);
      setSuccess('Review removed successfully.');
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove the review.');
    }
  };

  // Metrics calculation
  const summary = useMemo(() => {
    const totalCount = reviews.length;
    if (totalCount === 0) {
      return { averageRating: 0.0, totalCount, positiveCount: 0, negativeCount: 0 };
    }
    const sumRatings = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    const averageRating = (sumRatings / totalCount).toFixed(1);
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const negativeCount = reviews.filter(r => r.rating <= 2).length;
    
    return {
      averageRating,
      totalCount,
      positiveCount,
      negativeCount
    };
  }, [reviews]);

  // Client-side search and filters
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch = 
        (r.comment || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.reviewer_username || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.reviewed_user_username || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.item_title || '').toLowerCase().includes(search.toLowerCase());

      const matchRating = 
        ratingFilter === 'ALL' || 
        Number(r.rating) === Number(ratingFilter);

      const matchLowOnly = 
        !lowRatingsOnly || 
        Number(r.rating) <= 2;

      return matchSearch && matchRating && matchLowOnly;
    });
  }, [reviews, search, ratingFilter, lowRatingsOnly]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-amber-400 font-bold" : "text-slate-200"}>
          ★
        </span>
      );
    }
    return <div className="flex items-center space-x-0.5 text-base">{stars}</div>;
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review & Feedback Moderation</h2>
        <p className="text-sm text-slate-500 mt-1">Audit customer-written reviews, track satisfaction metrics, and remove inappropriate feedback.</p>
      </div>

      {(error || success) && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-bold ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {error || success}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Platform Rating</p>
          <p className="mt-2 text-2xl font-black text-slate-900 flex items-baseline gap-1">
            {summary.averageRating} <span className="text-xs font-bold text-amber-500">★</span>
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Across all written reviews</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Feedback Records</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{summary.totalCount}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">User-submitted ratings</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Positive Feedback (4-5★)</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{summary.positiveCount}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">High satisfaction ratings</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Negative Feedback (1-2★)</p>
          <p className="mt-2 text-2xl font-black text-red-600">{summary.negativeCount}</p>
          <p className="text-[10px] text-red-500 font-bold mt-1">Low satisfaction ratings</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Search Feedback</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search comments, users, items..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Filter by Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex items-end pb-3.5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lowRatingsOnly}
                onChange={(e) => setLowRatingsOnly(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-red-600 focus:ring-red-500/10 cursor-pointer"
              />
              <span className={lowRatingsOnly ? "text-red-600 font-extrabold" : ""}>Show Low Ratings Only (1-2★)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xs">
        <div className="lg:hidden flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg w-fit mt-4 ml-6 animate-pulse select-none">
          <span>Scroll table horizontally ➔</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4">Reviewed User</th>
                <th className="px-6 py-4">Associated Gear</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    No reviews found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(r.rating)}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-800 font-medium leading-relaxed break-words">{r.comment}</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-medium">
                        Submitted: {new Date(r.created_at).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">@{r.reviewer_username}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">@{r.reviewed_user_username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 line-clamp-1">{r.item_title}</p>
                      <p className="text-[9px] text-slate-400">Booking: #{r.booking}</p>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="p-2 border border-red-100 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl transition cursor-pointer font-bold inline-flex items-center gap-1"
                        title="Remove inappropriate feedback"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
