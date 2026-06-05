import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../../components/common/Button';

export default function Broadcast() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      await adminService.broadcastNotification(title, message);
      setSuccess('Announcements successfully broadcasted to all customer channels!');
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch notification broadcast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Platform Broadcast Engine</h2>
        <p className="text-sm text-slate-500 mt-1">Dispatch real-time announcements, trust guidelines, or alerts to all customer notification logs.</p>
      </div>

      {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Announcement Title</label>
          <input
            type="text"
            required
            placeholder="e.g., Scheduled Maintenance or Safety Policy Update"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 transition-all font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Broadcast Message Content</label>
          <textarea
            required
            rows="5"
            placeholder="Describe the announcements details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 transition-all font-semibold resize-none"
          />
        </div>

        <Button type="submit" loading={loading}>
          Broadcast Broadcast to All Users
        </Button>
      </form>
    </div>
  );
}
