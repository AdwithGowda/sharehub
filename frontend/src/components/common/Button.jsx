import React from 'react';

export default function Button({ children, variant = 'primary', loading, ...props }) {
  const baseStyle = "w-full flex items-center justify-center font-semibold py-2.5 px-4 text-sm rounded-xl transition duration-200 shadow-xs cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/10",
  };

  return (
    <button {...props} className={`${baseStyle} ${variants[variant]}`} disabled={loading || props.disabled}>
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
