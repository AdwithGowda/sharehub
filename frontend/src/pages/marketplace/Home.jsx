import React, { useState, useEffect, useContext } from 'react';
import { itemService } from '../../services/itemService';
import ItemCard from '../../components/item/ItemCard';
import Loader from '../../components/common/Loader';
import { AuthContext } from '../../context/AuthContext';
import BannerCarousel from '../../components/common/BannerCarousel';
import { Search, Grid, Users, User, ShieldCheck, Lock, BadgeCheck, MapPin, ChevronDown } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loadMarketplaceBaseline = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await itemService.getCategories();
        setCategories(fetchedCategories);
        
        // Load initial unfiltered catalog list rows
        const fetchedItems = await itemService.getActiveItems();
        setItems(fetchedItems);
      } catch (err) {
        console.error("Failed loading inventory catalog from API data layers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMarketplaceBaseline();
  }, []);

  // Filter Trigger Handler
  const handleFilterSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const activeFilters = {};
      if (selectedCategory) activeFilters.category = selectedCategory;
      if (searchLocation) activeFilters.location = searchLocation;
      
      const filteredResult = await itemService.getActiveItems(activeFilters);
      setItems(filteredResult);
    } catch (err) {
      console.error("Error executing dynamic search parameter sync:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setSelectedCategory('');
    setSearchLocation('');
    try {
      setLoading(true);
      const fetchedItems = await itemService.getActiveItems();
      setItems(fetchedItems);
    } catch (err) {
      console.error("Failed resetting filters:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!isAuthenticated || activeTab === 'all') return true;
    if (activeTab === 'others') return Number(item.owner) !== Number(user?.id);
    if (activeTab === 'mine') return Number(item.owner) === Number(user?.id);
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Featured Promo Banner Carousel */}
      <BannerCarousel />
      
      {/* 🚀 Visual Interactive Filter Controller Header Board */}
      <div id="marketplace-catalog" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-md space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Rent Anything, <span className="text-blue-600">Locally.</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Borrow high-value equipment straight from verified neighbors, keeping your asset investments clean and community connected.
          </p>
        </div>

        {/* Search Form + Trust Badges Group Wrapper */}
        <div className="w-full md:w-auto flex flex-col gap-4 shrink-0">
          {/* Dynamic Search Parameters Inline Layout Pipeline Form */}
          <form onSubmit={handleFilterSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Custom Select Category Wrapper */}
            <div className="relative flex-1 sm:flex-initial min-w-[190px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-blue-200 rounded-xl text-sm font-semibold text-slate-700 appearance-none focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Category Gear</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="w-4 h-4 text-blue-600" />
              </div>
            </div>

            {/* Custom Location Search Input Wrapper */}
            <div className="relative flex-1 min-w-[220px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <input
                type="text"
                placeholder="Search city or area..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/10 transition-colors active:scale-[0.98] cursor-pointer inline-flex items-center justify-center shrink-0"
            >
              Apply Search
            </button>
          </form>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-6 gap-y-2 text-xs font-bold text-slate-700 px-1">
            <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
              <span>Verified Neighbors</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default">
              <Lock className="w-4.5 h-4.5 text-blue-600" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default">
              <BadgeCheck className="w-4.5 h-4.5 text-blue-600" />
              <span>Quality Assured</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-default">
              <MapPin className="w-4.5 h-4.5 text-blue-600" />
              <span>Easy & Local</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation for User Listings Filter */}
      {isAuthenticated && (
        <div className="w-full grid grid-cols-3 bg-slate-100 p-1 rounded-2xl border border-slate-200/40 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
            }}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-250 cursor-pointer active:scale-[0.99] ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/30'
                : 'text-slate-500 hover:bg-white/45 hover:text-slate-800 hover:shadow-2xs'
            }`}
          >
            <Grid className="w-4 h-4 shrink-0" />
            <span className="truncate">All Gear ({items.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('others');
            }}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-250 cursor-pointer active:scale-[0.99] ${
              activeTab === 'others'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/30'
                : 'text-slate-500 hover:bg-white/45 hover:text-slate-800 hover:shadow-2xs'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">Other's Gear ({items.filter(item => Number(item.owner) !== Number(user?.id)).length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('mine');
            }}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-250 cursor-pointer active:scale-[0.99] ${
              activeTab === 'mine'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/30'
                : 'text-slate-500 hover:bg-white/45 hover:text-slate-800 hover:shadow-2xs'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">My Listed Gear ({items.filter(item => Number(item.owner) === Number(user?.id)).length})</span>
          </button>
        </div>
      )}

      {/* 📦 Structural Grid Display Inventory Container Node */}
      {loading ? (
        <Loader />
      ) : filteredItems.length === 0 ? (
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 mx-auto text-center space-y-6 animate-fade-in">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">No Listings Found</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed px-4">
              We couldn't locate any active assets matching your filters. Try clearing your search parameters to explore other gear.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Clear Search Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
