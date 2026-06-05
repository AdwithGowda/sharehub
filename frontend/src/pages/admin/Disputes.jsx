import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatINR } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function Disputes() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  
  // Arbitration Form State maps keyed by claim.id to prevent shared input states
  const [adminNotes, setAdminNotes] = useState({});
  const [customCost, setCustomCost] = useState({});

  useEffect(() => {
    loadClaimsQueue();
  }, []);

  const loadClaimsQueue = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDamageClaims();
      setClaims(data);
    } catch (err) {
      console.error("Failed gathering arbitration data:", err);
    } finally {
      setLoading(false);
    }
  };

  const executeArbitration = async (id, action, standardCost) => {
    try {
      setSubmittingId(id);
      // Use the administrative overriding input value if filled, otherwise fallback to the owner's default claim estimate cost
      const claimCustomCost = customCost[id];
      const claimAdminNotes = adminNotes[id] || '';
      const finalRepairCost = claimCustomCost ? parseFloat(claimCustomCost) : parseFloat(standardCost);
      
      await adminService.resolveDamageDispute(id, action, claimAdminNotes, finalRepairCost);
      
      // Clear specific claim's inputs
      setAdminNotes(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setCustomCost(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      
      loadClaimsQueue();
    } catch (err) {
      alert("Error writing decision to wallet ledgers.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleAdminNotesChange = (claimId, value) => {
    setAdminNotes(prev => ({ ...prev, [claimId]: value }));
  };

  const handleCustomCostChange = (claimId, value) => {
    setCustomCost(prev => ({ ...prev, [claimId]: value }));
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Deposit Split Arbitration</h2>
        <p className="text-sm text-slate-500 mt-1">Review active asset damage disputes and calculate escrow payouts.</p>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 font-medium text-slate-400 text-xs">
          All dispute cases closed. Financial integrity optimal.
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Proof Gallery Details Block */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Dispute Target Asset Reference: #C-{claim.id}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Raised by Owner: @{claim.owner_username}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status:</span>
                    {claim.status !== 'PENDING' ? (
                      <span className={`px-3 py-1.5 rounded-2xl text-xs font-bold tracking-wide uppercase border text-center ${
                        claim.status === 'RESOLVED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                        claim.status === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-700' :
                        'border-orange-200 bg-orange-50 text-orange-700'
                      }`}>
                        {claim.status}
                      </span>
                    ) : (
                      <select
                        disabled={submittingId !== null}
                        value={claim.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === claim.status) return;
                          const actionMap = { RESOLVED: 'RESOLVE', REJECTED: 'REJECT', PENDING: null };
                          const action = actionMap[newStatus];
                          if (action) executeArbitration(claim.id, action, claim.repair_cost);
                        }}
                        className="rounded-2xl border border-orange-200 bg-orange-50 text-orange-700 px-3 py-2 text-xs font-bold shadow-sm focus:outline-none cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-xs font-medium text-slate-600 border border-slate-100">
                  <h5 className="font-bold text-slate-800 mb-1">Owner Damage Argument Statement:</h5>
                  <p className="italic leading-relaxed">"{claim.description}"</p>
                </div>

                {/* Damage Evidence Photo Strip Row */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Visual Damage Proofs</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {claim.evidences?.map((img) => (
                      <div key={img.id} className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                        <img src={img.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Calculations Adjustment Form Panel Box */}
              <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100 space-y-4 text-xs font-semibold text-slate-600">
                <div className="border-b border-slate-200/50 pb-2">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {claim.status === 'PENDING' ? "Escrow Allocation Base" : "Arbitration Decision"}
                  </h4>
                </div>
                
                <div className="flex justify-between">
                  <span>Owner Claim Estimate</span>
                  <span className="text-red-600 font-bold">{formatINR(claim.repair_cost)}</span>
                </div>

                {claim.status === 'PENDING' ? (
                  <>
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Override Repair Payout (Optional)</label>
                        <input
                          type="number"
                          placeholder="Leave blank to use estimate"
                          value={customCost[claim.id] || ''}
                          onChange={(e) => handleCustomCostChange(claim.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Administrative Ruling Memo</label>
                        <textarea
                          rows="3"
                          placeholder="Write resolution notes context..."
                          value={adminNotes[claim.id] || ''}
                          onChange={(e) => handleAdminNotesChange(claim.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-normal resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => executeArbitration(claim.id, 'REJECT', claim.repair_cost)}
                        disabled={submittingId !== null}
                        className="py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                      >
                        Dismiss Claim
                      </button>
                      <button
                        onClick={() => executeArbitration(claim.id, 'RESOLVE', claim.repair_cost)}
                        disabled={submittingId !== null}
                        className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {submittingId === claim.id ? "Settling..." : "Authorize Payout Split"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 pt-2">
                    {claim.admin_notes && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Administrative Ruling Memo</span>
                        <div className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 text-xs font-normal leading-relaxed italic">
                          "{claim.admin_notes}"
                        </div>
                      </div>
                    )}
                    <div className="text-center py-2 bg-slate-100 rounded-xl text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      {claim.status === 'RESOLVED' ? '✓ Payout Authorized' : '✗ Dispute Dismissed'}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
