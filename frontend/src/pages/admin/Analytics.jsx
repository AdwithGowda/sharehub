import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatINR } from '../../utils/formatCurrency';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setStats(data);
    } catch (err) {
      console.error("Failed gathering admin analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Platform Analytics Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Review operational performance metrics and transaction indicators across the local network.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider opacity-75">Platform Revenue (10% Fee)</p>
          <h3 className="text-3xl font-black mt-2">{formatINR(stats?.revenue || 0)}</h3>
          <span className="absolute bottom-4 right-4 text-4xl opacity-15">💰</span>
        </div>

        {/* Active Rentals Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Rentals</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.active_rentals || 0}</h3>
          <span className="absolute bottom-4 right-4 text-4xl opacity-10">🔄</span>
        </div>

        {/* Pending Disputes Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Claims</p>
          <h3 className="text-3xl font-black text-red-600 mt-2">{stats?.pending_disputes || 0}</h3>
          <span className="absolute bottom-4 right-4 text-4xl opacity-10">⚠️</span>
        </div>

        {/* Total Users Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customers</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.total_users || 0}</h3>
          <span className="absolute bottom-4 right-4 text-4xl opacity-10">👤</span>
        </div>

        {/* Total Items Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Listed Gear Items</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.total_items || 0}</h3>
          <span className="absolute bottom-4 right-4 text-4xl opacity-10">📸</span>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reservations</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.total_bookings || 0}</h3>
          <span className="absolute bottom-4 right-4 text-4xl opacity-10">📅</span>
        </div>
      </div>
    </div>
  );
}
