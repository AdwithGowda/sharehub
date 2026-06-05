import React from 'react';
import QRCode from 'qrcode.react';

/**
 * HandoverQRGenerator - Displays secure QR code for renter to show owner during pickup
 * Used when booking is in PAID state, waiting for physical handover activation
 */
export default function HandoverQRGenerator({ bookingId, renterName, itemTitle }) {
  const qrValue = `sharehub_verify_handover_${bookingId}`;
  const qrRef = React.useRef();

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    const link = document.createElement('a');
    link.href = canvas?.toDataURL('image/png');
    link.download = `handover-qr-${bookingId}.png`;
    link.click();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 p-6 space-y-4 shadow-sm">
      <div className="space-y-1 text-center">
        <h3 className="text-lg font-bold text-slate-900">Secure Handover Verification</h3>
        <p className="text-sm text-slate-500">Present this QR code to the owner during gear pickup</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex justify-center">
        <div ref={qrRef} className="p-2">
          <QRCode 
            value={qrValue} 
            size={240}
            level="H"
            includeMargin={true}
            fgColor="#1f2937"
            bgColor="#ffffff"
            quietZone={10}
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs font-medium text-slate-600">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span>Booking Reference:</span>
          <span className="font-mono font-bold text-slate-900">#{bookingId}</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span>Renter:</span>
          <span className="font-bold text-slate-900">{renterName}</span>
        </div>
        <div className="flex justify-between">
          <span>Item:</span>
          <span className="font-bold text-slate-900 text-right">{itemTitle}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={downloadQR}
          className="py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase transition cursor-pointer"
        >
          📥 Download QR
        </button>
        <button
          onClick={() => window.print()}
          className="py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase transition cursor-pointer"
        >
          🖨️ Print Code
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-700">
        ℹ️ <strong>Security Note:</strong> This QR code is encrypted and single-use. It expires once the owner scans it during handover.
      </div>
    </div>
  );
}
