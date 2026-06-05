import React from 'react';

export default function Input({ label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 placeholder-slate-400 ${
          error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200'
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
