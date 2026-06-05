import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/walletService';
import { formatINR } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);

  // Withdrawal States
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  useEffect(() => {
    loadWalletState();
  }, []);

  const loadWalletState = async () => {
    try {
      setLoading(true);
      const data = await walletService.getWalletState();
      setWallet(data);
      const withdrawalData = await walletService.getWithdrawalHistory();
      setWithdrawals(withdrawalData);
    } catch (err) {
      console.error("Failed loading backend ledger records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    if (!topupAmount || parseFloat(topupAmount) <= 0) return;
    
    try {
      setTopupLoading(true);
      await walletService.simulateTestTopup(topupAmount);
      setTopupAmount('');
      loadWalletState(); // Refresh dashboard data live
    } catch (err) {
      alert("Error adding sandbox token funds.");
    } finally {
      setTopupLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return;
    if (!bankAccount.trim()) return;

    if (parseFloat(withdrawalAmount) > parseFloat(wallet?.balance || 0)) {
      alert("Insufficient balance for withdrawal request.");
      return;
    }

    try {
      setWithdrawalLoading(true);
      await walletService.requestWithdrawal(withdrawalAmount, bankAccount.trim());
      setWithdrawalAmount('');
      setBankAccount('');
      setShowWithdrawalModal(false);
      loadWalletState();
    } catch (err) {
      alert(err.response?.data?.error || "Error submitting withdrawal request.");
    } finally {
      setWithdrawalLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper Grid Layout Balance Block Display Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 bg-black rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden group border border-neutral-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          {/* Subtle clean radial contrast glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-white/5 via-transparent to-transparent rounded-full blur-3xl" />
          
          {/* Minimalist Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">ShareHub Digital Escrow</p>
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-3">Available Internal Balance</h3>
              <h2 className="text-4xl font-extrabold tracking-tight mt-1 text-white">
                {formatINR(wallet?.balance || 0)}
              </h2>
            </div>
            {/* Matte White/Silver Chip Graphic */}
            <div className="w-12 h-9 bg-neutral-900 rounded-lg border border-neutral-800 relative flex items-center justify-center shadow-inner">
              <div className="w-6 h-6 border-r border-b border-neutral-700/40 rounded" />
              <div className="w-4 h-4 border-l border-t border-neutral-700/40 rounded absolute" />
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-8 border-t border-neutral-900 pt-4 z-10">
            <div>
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Secure Wallet ID</p>
              <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">#W-{wallet?.id || 'N/A'}</p>
            </div>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs rounded-xl shadow-md transition-all duration-300 cursor-pointer select-none hover:scale-[1.03] active:scale-[0.98]"
            >
              Withdraw Payout
            </button>
          </div>
        </div>

        {/* Sandbox Test Payout / Credit Manual Topup Terminal Injection Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Sandbox Ledger Simulation</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Manually inject playground liquidity to test checkout operations.</p>
          </div>
          
          <form onSubmit={handleTopupSubmit} className="mt-4 space-y-2">
            <input
              type="number"
              placeholder="Enter value (e.g. 5000)"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
            />
            <Button type="submit" variant="secondary" loading={topupLoading}>
              Credit Test Funds
            </Button>
          </form>
        </div>
      </div>

      {/* Transaction Statement Table Element */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-50">
          <h3 className="font-bold text-slate-900 text-base">Account Activity History</h3>
          <p className="text-xs text-slate-400 mt-0.5">Historical verification rows for incoming earnings, claims, settlements, and deposits.</p>
        </div>

        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            No entries logged inside this active ledger timeline frame.
          </div>
        ) : (
          <>
            <div className="lg:hidden flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg w-fit mt-4 ml-6 animate-pulse select-none">
              <span>Scroll table horizontally ➔</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 pl-6">Reference ID</th>
                    <th className="p-4">Action Type</th>
                    <th className="p-4">Settlement Delta</th>
                    <th className="p-4">Execution Status</th>
                    <th className="p-4 pr-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700 text-xs">
                  {wallet.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 font-mono text-slate-400">#TX-{tx.id}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tx.transaction_type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className={`p-4 font-bold text-sm ${tx.transaction_type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.transaction_type === 'CREDIT' ? '+' : '-'}{formatINR(tx.amount)}
                      </td>
                      <td className="p-4 text-slate-400">{tx.status}</td>
                      <td className="p-4 pr-6 text-right text-slate-400 font-normal">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Withdrawal Requests Section */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-50">
          <h3 className="font-bold text-slate-900 text-base">Withdrawal Payout Requests</h3>
          <p className="text-xs text-slate-400 mt-0.5">Track the status of your bank transfer requests.</p>
        </div>

        {withdrawals.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            No withdrawal payout history found.
          </div>
        ) : (
          <>
            <div className="lg:hidden flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg w-fit mt-4 ml-6 animate-pulse select-none">
              <span>Scroll table horizontally ➔</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 pl-6">Request ID</th>
                    <th className="p-4">Bank Account</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700 text-xs">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 font-mono text-slate-400">#WD-{w.id}</td>
                      <td className="p-4 text-slate-600">{w.bank_account}</td>
                      <td className="p-4 font-bold text-slate-900">{formatINR(w.amount)}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                          w.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          w.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right text-slate-400 font-normal">
                        {new Date(w.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl max-w-sm w-full space-y-4">
            <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 tracking-tight text-base">Request Bank Payout</h4>
                <p className="text-[11px] text-slate-400 font-medium">Funds will be debited from your internal balance.</p>
              </div>
              <button 
                onClick={() => setShowWithdrawalModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={wallet?.balance || 0}
                  placeholder={`Max ₹${wallet?.balance || 0}`}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Account Info (IBAN/Account Number)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC123456789"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl py-2.5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" loading={withdrawalLoading}>
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
