import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';

export default function KYC() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadKYCQueue();
  }, []);

  const loadKYCQueue = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingKYCs();
      setQueue(data);
    } catch (err) {
      console.error("Failed gathering compliance queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditAction = async (id, action) => {
    try {
      setProcessingId(id);
      await adminService.updateKYCStatus(id, action);
      loadKYCQueue(); // Reload queue live
    } catch (err) {
      alert("Error processing verification status change.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Compliance Queue</h2>
        <p className="text-sm text-slate-500 mt-1">Review government proofs and verify background profiles before granting listing privileges.</p>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 font-medium text-slate-400 text-xs">
          All compliance filings cleared! Excellent work.
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map((app) => (
            <div key={app.id} className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h4 className="font-bold text-slate-900">Application File: @{app.username}</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">RECORD REF ID: #KYC-{app.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex flex-col gap-1 text-sm text-slate-600">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status:</span>
                    <select
                      disabled={processingId !== null}
                      value={app.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus === app.status) return;
                        const actionMap = { APPROVED: 'APPROVE', REJECTED: 'REJECT' };
                        const action = actionMap[newStatus];
                        if (action) handleAuditAction(app.id, action);
                      }}
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none cursor-pointer ${
                        app.status === 'APPROVED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                        app.status === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-700' :
                        'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Document Image Verification Grid layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Government ID Proof</span>
                  <div className="aspect-video bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-zoom-in">
                    <img src={app.id_proof} alt="ID proof file" className="w-full h-full object-cover hover:scale-105 transition duration-200" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Member Selfie</span>
                  <div className="aspect-video bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-zoom-in">
                    <img src={app.selfie} alt="Selfie match file" className="w-full h-full object-cover hover:scale-105 transition duration-200" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address Location Proof</span>
                  <div className="aspect-video bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-zoom-in">
                    <img src={app.address_proof} alt="Address proof file" className="w-full h-full object-cover hover:scale-105 transition duration-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
