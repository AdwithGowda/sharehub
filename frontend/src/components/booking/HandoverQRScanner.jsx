import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../api/axios';

/**
 * HandoverQRScanner - Scans and validates renter's QR code during physical handover
 * Used when booking is in PAID state, waiting for owner to scan and activate lease
 */
export default function HandoverQRScanner({ bookingId, itemTitle, renterName, onSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const qrScannerRef = useRef(null);

  const startScanning = () => {
    setScanning(true);
    setError(null);

    if (!qrScannerRef.current) {
      qrScannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          useBarCodeDetectorIfAvailable: true
        },
        false
      );
    }

    qrScannerRef.current.render(
      async (decodedText) => {
        // Validate QR format
        const expectedQR = `sharehub_verify_handover_${bookingId}`;
        if (decodedText === expectedQR) {
          setScanned(true);
          handleQRMatch(expectedQR);
        } else {
          setError('Invalid QR code. Ensure you\'re scanning the correct booking.');
        }
      },
      (errorMessage) => {
        // Silent - scanner is always searching
      }
    );
  };

  const handleQRMatch = async (qrData) => {
    try {
      setProcessing(true);
      
      // Call backend to activate the lease
      const response = await API.post(`bookings/${bookingId}/activate-lease/`, {
        qr_data: qrData,
        scanned_at: new Date().toISOString()
      });

      setScanned(true);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate lease. Please try again.');
      setScanned(false);
    } finally {
      setProcessing(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear();
      qrScannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear();
      }
    };
  }, []);

  if (scanned && !processing) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-200 p-6 space-y-4 shadow-sm text-center">
        <div className="space-y-2">
          <div className="text-4xl">✅</div>
          <h3 className="text-lg font-bold text-emerald-900">Handover Verified!</h3>
          <p className="text-sm text-emerald-700">Lease successfully activated. Rental period is now active.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-2 text-xs font-medium text-slate-600 border border-emerald-100">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Booking Ref:</span>
            <span className="font-mono font-bold text-slate-900">#{bookingId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Renter:</span>
            <span className="font-bold text-slate-900">{renterName}</span>
          </div>
          <div className="flex justify-between">
            <span>Item:</span>
            <span className="font-bold text-slate-900 text-right">{itemTitle}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setScanned(false);
            setError(null);
          }}
          className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase transition cursor-pointer"
        >
          Scan Another Handover
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-indigo-200 p-6 space-y-4 shadow-sm">
      <div className="space-y-1 text-center">
        <h3 className="text-lg font-bold text-slate-900">Ready for Handover</h3>
        <p className="text-sm text-slate-500">Scan the renter's QR code to activate the lease</p>
      </div>

      {!scanning ? (
        <button
          onClick={startScanning}
          disabled={processing}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase transition cursor-pointer disabled:opacity-50 shadow-xs"
        >
          📱 Start Camera Scanner
        </button>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="rounded-2xl overflow-hidden border-2 border-slate-300"></div>
          <button
            onClick={stopScanning}
            disabled={processing}
            className="w-full py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase transition cursor-pointer disabled:opacity-50"
          >
            ❌ Stop Scanning
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-medium">
          ⚠️ {error}
        </div>
      )}

      {processing && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 font-medium">
          ⏳ Verifying QR code and activating lease...
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-700">
        ℹ️ <strong>How it works:</strong> Hold your phone's camera near the renter's QR code. The system will automatically detect and validate it.
      </div>
    </div>
  );
}
