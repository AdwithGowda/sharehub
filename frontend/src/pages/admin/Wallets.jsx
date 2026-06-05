import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatINR } from '../../utils/formatCurrency';

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [action, setAction] = useState('CREDIT');
  const [amount, setAmount] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getWallets();
      setWallets(data);
      if (!selectedWalletId && data.length > 0) {
        setSelectedWalletId(String(data[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed loading wallet records.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
    const totalTransactions = wallets.reduce((sum, wallet) => sum + (wallet.transactions?.length || 0), 0);
    return { totalBalance, totalTransactions };
  }, [wallets]);

  const selectedWallet = wallets.find((wallet) => String(wallet.id) === selectedWalletId);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedWalletId) {
      setError('Select a wallet before applying an adjustment.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Enter a positive adjustment amount.');
      return;
    }

    try {
      setAdjusting(true);
      const updatedWallet = await adminService.adjustWallet(selectedWalletId, action, amount);
      setWallets((current) => current.map((wallet) => (wallet.id === updatedWallet.id ? updatedWallet : wallet)));
      setAmount('');
      setSuccess(`${action === 'CREDIT' ? 'Credited' : 'Debited'} ${formatINR(amount)} for @${updatedWallet.username}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Wallet adjustment failed.');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wallet Management</h2>
        <p className="text-sm text-slate-500 mt-1">Review user balances, inspect recent wallet activity, and apply manual credit or debit adjustments.</p>
      </div>

      {(error || success) && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-bold ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {error || success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Wallet Balance</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(summary.totalBalance)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wallet Accounts</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{wallets.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction Records</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{summary.totalTransactions}</p>
        </div>
      </div>

      <form onSubmit={handleAdjustment} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_0.8fr_auto] lg:items-end">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Wallet</label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  @{wallet.username} - {wallet.email} - {formatINR(wallet.balance)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Amount</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
          <button
            type="submit"
            disabled={adjusting || wallets.length === 0}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adjusting ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {selectedWallet && (
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Selected balance: <span className="text-slate-900">{formatINR(selectedWallet.balance)}</span>
          </p>
        )}
      </form>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs font-semibold">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Balance</th>
              <th className="px-5 py-4">Latest Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600">
            {wallets.map((wallet) => {
              const latest = wallet.transactions?.[wallet.transactions.length - 1];
              return (
                <tr key={wallet.id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">@{wallet.username}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{wallet.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      {wallet.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-900">{formatINR(wallet.balance)}</td>
                  <td className="px-5 py-4">
                    {latest ? (
                      <div>
                        <p className={latest.transaction_type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}>
                          {latest.transaction_type} {formatINR(latest.amount)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{latest.status}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">No transactions yet</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
