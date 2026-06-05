import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/imageUrl';

export default function ItemCard({ item }) {
  // Fallback to structural graphics placeholder asset if your inventory model holds no active image arrays
  const displayImage = item.images && item.images.length > 0 
    ? getImageUrl(item.images[0].image) 
    : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-row sm:flex-col h-full w-full">
      
      {/* Visual Asset Capture Cover Panel */}
      <div className="relative w-28 xs:w-36 sm:w-full shrink-0 aspect-square sm:aspect-video bg-slate-100 overflow-hidden">
        <img 
          src={displayImage} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-tight">
          {item.category_name}
        </div>
      </div>

      {/* Text Attributes Panel */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between space-y-2.5 sm:space-y-4 min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-slate-900 tracking-tight text-sm xs:text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center space-x-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded-sm shrink-0">
              <span>★</span>
              <span>{parseFloat(item.rating).toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 flex items-center space-x-1">
            <span className="text-slate-500">📍</span>
            <span className="truncate">{item.location}</span>
          </p>
          
          <p className="text-[11px] sm:text-sm text-slate-500 line-clamp-1 xs:line-clamp-2 mt-1.5 sm:mt-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Pricing Layout Pipeline Metric Grid */}
        <div className="pt-2 sm:pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rate</p>
            <p className="text-sm xs:text-base sm:text-lg font-black text-slate-900">
              {formatINR(item.price_per_day)}<span className="text-[10px] sm:text-xs font-normal text-slate-400">/day</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Deposit</p>
            <p className="text-xs xs:text-sm font-bold text-slate-700">{formatINR(item.deposit_amount)}</p>
          </div>
        </div>

        <Link 
          to={`/item/${item.id}`}
          className="block w-full text-center py-2 px-3 sm:py-2.5 sm:px-4 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition duration-200 active:scale-[0.99] cursor-pointer"
        >
          View Lease Terms
        </Link>
      </div>
    </div>
  );
}
