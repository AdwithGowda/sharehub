import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import { adminService } from '../../services/adminService';
import { formatINR } from '../../utils/formatCurrency';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const payload = await adminService.getAnalytics();
        setStats(payload);
      } catch (error) {
        console.error('Unable to load dashboard overview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total Users</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{stats?.total_users ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending KYC Requests</p>
          <p className={`mt-4 text-4xl font-black ${stats?.pending_kyc_requests > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {stats?.pending_kyc_requests ?? 0}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total Items</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{stats?.total_items ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Active Listings</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{stats?.active_listings ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Active Rentals</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{stats?.active_rentals ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Completed Rentals</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{stats?.completed_rentals ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pending Disputes</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{stats?.pending_disputes ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Platform Earnings</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{formatINR(stats?.platform_earnings ?? 0)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Revenue Statistics</h2>
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Live</span>
          </div>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Gross Revenue</span>
              <strong>{formatINR(stats?.gross_revenue ?? 0)}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Platform Earnings</span>
              <strong>{formatINR(stats?.platform_earnings ?? 0)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Owner Payouts</span>
              <strong>{formatINR(stats?.owner_payouts ?? 0)}</strong>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col max-h-[260px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest</span>
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-600 overflow-y-auto pr-1 flex-1">
            {stats?.recent_activities?.length ? (
              stats.recent_activities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{activity.title}</p>
                  <p className="mt-1 text-slate-500">{activity.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{activity.time}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No recent activity found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
