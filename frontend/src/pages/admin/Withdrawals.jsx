import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatINR } from '../../utils/formatCurrency';

export default function Withdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getWithdrawalRequests();
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed loading withdrawal requests.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    return requests.reduce(
      (totals, request) => {
        totals.count += 1;
        totals[request.status.toLowerCase()] += 1;
        if (request.status === 'PENDING') {
          totals.pendingAmount += Number(request.amount || 0);
        }
        return totals;
      },
      { count: 0, pending: 0, approved: 0, rejected: 0, pendingAmount: 0 }
    );
  }, [requests]);

  const handleAuditAction = async (id, action) => {
    const actionLabel = action === 'APPROVE' ? 'approve this payout' : 'reject this withdrawal request';
    if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) return;

    try {
      setProcessingId(id);
      setError('');
      setSuccess('');
      const updatedRequest = await adminService.updateWithdrawalStatus(id, action);
      setRequests((current) => current.map((request) => (request.id === updatedRequest.id ? updatedRequest : request)));
      setSuccess(`Withdrawal #WD-${updatedRequest.id} was ${updatedRequest.status.toLowerCase()}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing withdrawal request.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Withdrawal Requests Auditing</h2>
        <p className="text-sm text-slate-500 mt-1">Review user bank transfer applications and release funds from internal escrow balance.</p>
      </div>

      {(error || success) && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-bold ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {error || success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Payouts</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Amount</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(summary.pendingAmount)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{summary.approved}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejected</p>
          <p className="mt-2 text-2xl font-black text-red-600">{summary.rejected}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xs">
        {requests.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            No withdrawal payout logs found.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Request</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Bank Account</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Wallet Balance</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {requests.map((request) => {
                const isPending = request.status === 'PENDING';
                const canApprove = Number(request.wallet_balance || 0) >= Number(request.amount || 0);

                return (
                  <tr key={request.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-slate-900">#WD-{request.id}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(request.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">@{request.username}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{request.email}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">{request.bank_account}</td>
                    <td className="px-5 py-4 font-black text-slate-900">{formatINR(request.amount)}</td>
                    <td className={`px-5 py-4 font-bold ${canApprove ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatINR(request.wallet_balance)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        request.status === 'APPROVED' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
                        request.status === 'PENDING' ? 'border-amber-100 bg-amber-50 text-amber-700' :
                        'border-red-100 bg-red-50 text-red-700'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isPending ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={processingId === request.id || !canApprove}
                            onClick={() => handleAuditAction(request.id, 'APPROVE')}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={processingId === request.id}
                            onClick={() => handleAuditAction(request.id, 'REJECT')}
                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-slate-400">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
