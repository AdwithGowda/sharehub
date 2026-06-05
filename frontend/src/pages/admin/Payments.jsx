import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatINR } from '../../utils/formatCurrency';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getPayments();
      setPayments(data);
    } catch (err) {
      console.error("Failed loading payment directory:", err);
      setError(err.response?.data?.error || 'Failed loading transaction history.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculation
  const summary = useMemo(() => {
    const successfulPayments = payments.filter(p => p.status?.toUpperCase() === 'SUCCESS');
    const totalVolume = successfulPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const successfulCount = successfulPayments.length;
    const failedCount = payments.filter(p => p.status?.toUpperCase() === 'FAILED').length;
    const pendingCount = payments.filter(p => p.status?.toUpperCase() === 'PENDING').length;
    
    return {
      totalVolume,
      successfulCount,
      failedCount,
      pendingCount,
      totalCount: payments.length
    };
  }, [payments]);

  // Client-side search and filters
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchSearch = 
        (payment.payment_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (payment.item_title || '').toLowerCase().includes(search.toLowerCase()) ||
        (payment.renter_username || '').toLowerCase().includes(search.toLowerCase()) ||
        (payment.renter_email || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = 
        statusFilter === 'ALL' || 
        (payment.status || '').toUpperCase() === statusFilter.toUpperCase();

      const matchMethod = 
        methodFilter === 'ALL' || 
        (payment.payment_method || '').toUpperCase() === methodFilter.toUpperCase();

      return matchSearch && matchStatus && matchMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  // Unique payment methods for filters
  const paymentMethods = useMemo(() => {
    const methods = new Set(payments.map(p => p.payment_method).filter(Boolean));
    return Array.from(methods);
  }, [payments]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment & Transaction Registry</h2>
        <p className="text-sm text-slate-500 mt-1">Review all escrow deposits, gateway confirmations, methods, and user rental collections.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Volume Secured</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(summary.totalVolume)}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">From successful trades</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Successful Escrows</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{summary.successfulCount}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Cleared gateway capture</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Payments</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{summary.pendingCount}</p>
          <p className="text-[10px] text-amber-600 font-bold mt-1">Awaiting confirmation</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failed / Rejected</p>
          <p className="mt-2 text-2xl font-black text-red-600">{summary.failedCount}</p>
          <p className="text-[10px] text-red-500 font-medium mt-1">Cancelled/incomplete</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Search Transactions</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Payment ID, Renter, Asset..."
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
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Filter by Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="ALL">All Methods</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Renter</th>
                <th className="px-6 py-4">Asset Details</th>
                <th className="px-6 py-4">Amount Secured</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const statusUpper = (payment.status || '').toUpperCase();
                  const isSuccess = statusUpper === 'SUCCESS';
                  const isPending = statusUpper === 'PENDING';

                  return (
                    <tr key={payment.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 tracking-tight">{payment.payment_id || `TXN-${payment.id}`}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">Booking Reference: #{payment.booking}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">@{payment.renter_username || 'Unknown'}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{payment.renter_email || 'No email'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{payment.item_title || `Item #${payment.booking}`}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{formatINR(payment.amount)}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                        {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
