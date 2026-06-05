import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';

const initialSettings = {
  commission_rate: '10.00',
  min_deposit_percent: '0.00',
  max_booking_days: 30,
  auto_approve_bookings: false,
  notifications_enabled: true,
  payment_gateway_mode: 'SANDBOX',
  maintenance_mode: false,
  support_email: 'support@sharehub.local'
};

export default function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getPlatformSettings();
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed loading platform settings.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const updated = await adminService.updatePlatformSettings({
        commission_rate: settings.commission_rate,
        min_deposit_percent: settings.min_deposit_percent,
        max_booking_days: settings.max_booking_days,
        auto_approve_bookings: settings.auto_approve_bookings,
        notifications_enabled: settings.notifications_enabled,
        payment_gateway_mode: settings.payment_gateway_mode,
        maintenance_mode: settings.maintenance_mode,
        support_email: settings.support_email
      });
      setSettings(updated);
      setSuccess('Platform settings saved successfully.');
    } catch (err) {
      const data = err.response?.data;
      const apiError = data && typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : null;
      setError(apiError || 'Failed saving platform settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure commission rates, booking policies, notification preferences, and payment gateway options.</p>
      </div>

      {(error || success) && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-bold ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {error || success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900">Marketplace Rules</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.commission_rate}
                  onChange={(e) => updateField('commission_rate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Minimum Deposit (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.min_deposit_percent}
                  onChange={(e) => updateField('min_deposit_percent', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Max Booking Days</label>
                <input
                  type="number"
                  min="1"
                  value={settings.max_booking_days}
                  onChange={(e) => updateField('max_booking_days', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Payment Gateway</label>
                <select
                  value={settings.payment_gateway_mode}
                  onChange={(e) => updateField('payment_gateway_mode', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="SANDBOX">Sandbox</option>
                  <option value="LIVE">Live</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900">Operational Guardrails</h3>
            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span>
                  <span className="block text-sm font-bold text-slate-900">Auto Approve Bookings</span>
                  <span className="text-xs font-semibold text-slate-400">New booking requests skip owner approval.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.auto_approve_bookings}
                  onChange={(e) => updateField('auto_approve_bookings', e.target.checked)}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span>
                  <span className="block text-sm font-bold text-slate-900">Notifications Enabled</span>
                  <span className="text-xs font-semibold text-slate-400">Allows platform broadcast alerts to customers.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => updateField('notifications_enabled', e.target.checked)}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span>
                  <span className="block text-sm font-bold text-slate-900">Maintenance Mode</span>
                  <span className="text-xs font-semibold text-slate-400">Flag the platform as under maintenance.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => updateField('maintenance_mode', e.target.checked)}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
          <h3 className="text-base font-black text-slate-900">Support Channel</h3>
          <div className="mt-5 max-w-md">
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Support Email</label>
            <input
              type="email"
              required
              value={settings.support_email}
              onChange={(e) => updateField('support_email', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            />
            <p className="mt-3 text-[11px] font-semibold text-slate-400">
              Last updated: {settings.updated_at ? new Date(settings.updated_at).toLocaleString('en-IN') : 'Not saved yet'}
            </p>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
