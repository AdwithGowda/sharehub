import React from 'react';
import { getImageUrl } from '../../utils/imageUrl';

export default function CategoryScroller({ categories, onCategoryClick }) {
  if (!categories || categories.length === 0) return null;

  // Duplicate categories to create a seamless infinite loop
  const duplicatedCategories = [...categories, ...categories];

  return (
    <div className="w-full overflow-hidden bg-transparent py-4 relative group">
      {/* Optional fade edges for better aesthetics */}
      <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

      <div className="flex w-[max-content] animate-marquee hover:[animation-play-state:paused]">
        {duplicatedCategories.map((category, index) => (
          <div
            key={`${category.id}-${index}`}
            onClick={() => onCategoryClick && onCategoryClick(category.id)}
            className="flex items-center gap-3 bg-white border border-slate-100 shadow-xs rounded-2xl p-2.5 mx-3 shrink-0 cursor-pointer hover:shadow-sm transition-all hover:border-blue-200 hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {category.image ? (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
              )}
            </div>
            <span className="font-bold text-slate-700 text-sm whitespace-nowrap pr-2">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
