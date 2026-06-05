import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getNotificationHistory();
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed loading notification history.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const unread = notifications.filter((notification) => !notification.is_read).length;
    const recipients = new Set(notifications.map((notification) => notification.email)).size;
    return { unread, recipients };
  }, [notifications]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSending(true);
      const result = await adminService.broadcastNotification(title.trim(), message.trim());
      setSuccess(result.message || 'Broadcast sent successfully.');
      setTitle('');
      setMessage('');
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send notification broadcast.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h2>
        <p className="text-sm text-slate-500 mt-1">Send announcements, broadcast alerts, and review delivery history for customer accounts.</p>
      </div>

      {(error || success) && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-bold ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {error || success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Deliveries</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{notifications.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unread Copies</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{summary.unread}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipients</p>
          <p className="mt-2 text-2xl font-black text-blue-600">{summary.recipients}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Send Broadcast</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400">Creates one notification for every customer account.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Scheduled maintenance"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Message</label>
            <textarea
              required
              rows="6"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the announcement users should see."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <Button type="submit" loading={sending}>
            Send Notification
          </Button>
        </form>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xs">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-base font-black text-slate-900">Delivery History</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400">Most recent notification copies sent to users.</p>
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">No notifications sent yet.</div>
          ) : (
            <div className="max-h-[520px] divide-y divide-slate-50 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-5 transition hover:bg-slate-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{notification.message}</p>
                    </div>
                    <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${notification.is_read ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                      {notification.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-bold text-slate-400">
                    <span className="truncate">@{notification.username} - {notification.email}</span>
                    <span>{new Date(notification.created_at).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
