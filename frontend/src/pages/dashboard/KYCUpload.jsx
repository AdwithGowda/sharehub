import React, { useState, useEffect } from 'react';
import { kycService } from '../../services/kycService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function KYCUpload() {
  const [kycState, setKycState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Individual file state managers
  const [idProof, setIdProof] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [addressProof, setAddressProof] = useState(null);

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      setLoading(true);
      const data = await kycService.getKYCStatus();
      setKycState(data);
    } catch (err) {
      console.error("Error reading verification log structures.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!idProof || !selfie || !addressProof) {
      setError('Please upload all three required identity verification files.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('id_proof', idProof);
    formData.append('selfie', selfie);
    formData.append('address_proof', addressProof);

    try {
      await kycService.submitKYCDocuments(formData);
      setSuccess('Documents submitted successfully! Waiting for admin approval.');
      fetchCurrentStatus(); // Reload backend state dynamically
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process document validation upload.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  // Dynamic feedback rendering based on current verification phase
  if (kycState?.status === 'APPROVED') {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center max-w-md mx-auto space-y-3 animate-fade-in">
        <p className="text-4xl">✅</p>
        <h3 className="text-xl font-black text-emerald-900 tracking-tight">Identity Fully Verified</h3>
        <p className="text-xs text-emerald-700 leading-relaxed">
          Your account validation checks are completely clear. You are free to publish new gear listings onto the marketplace catalog engine!
        </p>
      </div>
    );
  }

  if (kycState?.status === 'PENDING') {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 text-center max-w-md mx-auto space-y-3 animate-fade-in">
        <p className="text-4xl">⏳</p>
        <h3 className="text-xl font-black text-amber-900 tracking-tight">Verification In Review</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          Your documentation has been received and is waiting for administrator compliance review. This standard security step takes less than 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Verification</h2>
        <p className="text-sm text-slate-500 mt-1">To ensure safety across our local sharing network, members must upload simple compliance proofs before listing rental equipment.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100">{success}</div>}

      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-slate-700">
        <div>
          <label className="block text-slate-500 uppercase tracking-wider text-[10px] mb-1">1. Government Photo ID (Aadhaar / Passport / Driving License)</label>
          <input type="file" accept="image/*" onChange={(e) => setIdProof(e.target.files[0])} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600" required />
        </div>

        <div>
          <label className="block text-slate-500 uppercase tracking-wider text-[10px] mb-1">2. Live Verification Portrait Selfie</label>
          <input type="file" accept="image/*" onChange={(e) => setSelfie(e.target.files[0])} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600" required />
        </div>

        <div>
          <label className="block text-slate-500 uppercase tracking-wider text-[10px] mb-1">3. Address Residence Proof (Utility Bill / Rental Agreement)</label>
          <input type="file" accept="image/*" onChange={(e) => setAddressProof(e.target.files[0])} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600" required />
        </div>

        <div className="pt-4">
          <Button type="submit" loading={submitting}>
            Submit Secure Documentation
          </Button>
        </div>
      </form>
    </div>
  );
}
