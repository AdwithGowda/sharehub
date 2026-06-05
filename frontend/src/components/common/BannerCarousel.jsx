import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'PREMIUM CAMERA GEAR',
    highlight: 'capture every moment!',
    description: 'Rent professional DSLRs, telephoto lenses, and stabilizer rigs from verified neighbors.',
    priceText: 'Starting at just ₹299/day',
    buttonText: 'Rent now',
    image: '/camera_banner.png',
    bgGradient: 'from-rose-100/60 to-orange-100/60'
  },
  {
    id: 2,
    title: 'OUTDOOR CAMPING KITS',
    highlight: 'embrace the wild!',
    description: 'Get premium waterproof tents, thermal sleeping bags, and outdoor stove setups easily.',
    priceText: 'Starting at just ₹149/day',
    buttonText: 'Rent now',
    image: '/camping_banner.png',
    bgGradient: 'from-emerald-100/60 to-teal-100/60'
  },
  {
    id: 3,
    title: 'POWER WORKSHOP TOOLS',
    highlight: 'build your dreams!',
    description: 'Borrow high-powered drills, saws, sanders, and safety equipment for your weekend DIY.',
    priceText: 'Starting at just ₹99/day',
    buttonText: 'Rent now',
    image: '/tools_banner.png',
    bgGradient: 'from-blue-100/60 to-indigo-100/60'
  }
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className="relative overflow-hidden rounded-3xl border border-slate-100 shadow-xs group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className={`w-full shrink-0 grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-6 sm:p-10 bg-gradient-to-br ${slide.bgGradient} min-h-[300px] sm:min-h-[360px]`}
          >
            {/* Slide Text Content */}
            <div className="md:col-span-7 space-y-4 text-left select-none">
              <span className="px-3 py-1 text-[10px] font-black tracking-wider uppercase bg-white/70 text-blue-600 border border-blue-200/35 rounded-md">
                Featured Category
              </span>
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-4.5xl font-black text-blue-700 leading-tight uppercase tracking-tight">
                  {slide.title}
                </h2>
                <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-xs capitalize italic">
                  {slide.highlight}
                </h3>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed">
                {slide.description}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-xs sm:text-sm font-bold text-slate-800 bg-white/40 px-3 py-1.5 rounded-lg border border-slate-200/10">
                  {slide.priceText}
                </p>
                <button 
                  onClick={() => {
                    const el = document.getElementById('marketplace-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-fit px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition duration-200 shadow-md shadow-blue-600/20 hover:scale-102 active:scale-98 cursor-pointer"
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>

            {/* Slide Image Content */}
            <div className="md:col-span-5 flex justify-center md:justify-end relative">
              <div className="relative w-44 sm:w-64 h-36 sm:h-52 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-xs border border-white/30 shadow-lg transform hover:scale-102 transition duration-300">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/50 shadow-xs flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/50 shadow-xs flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 bg-white/40 backdrop-blur-xs py-1 px-2.5 rounded-full border border-white/20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              current === index ? 'bg-blue-600 w-4' : 'bg-slate-400 hover:bg-slate-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
