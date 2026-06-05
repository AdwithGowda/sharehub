import React from 'react';

export default function Loader({ fullScreen }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-slate-50' : 'py-12'}`}>
      <div className="relative w-12 h-12">
        <div className="absolute w-full h-full border-4 border-slate-200 rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
