import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { itemService } from '../../services/itemService';
import { formatINR } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/imageUrl';
import Loader from '../../components/common/Loader';
import { Trash2, PlusCircle, AlertCircle, MapPin, Star } from 'lucide-react';

export default function MyListedGear() {
  const { user } = useContext(AuthContext);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadMyGear();
  }, [user]);

  const loadMyGear = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await itemService.getActiveItems();
      const userGear = data.filter(item => Number(item.owner) === Number(user.id));
      setMyItems(userGear);
    } catch (err) {
      console.error("Failed gathering user listed gear:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    try {
      setActionLoading(itemId);
      await itemService.deleteItem(itemId);
      setMyItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete listing.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Listed Gear</h2>
          <p className="text-sm text-slate-500 mt-1">Manage, view, and list items you own for community rental.</p>
        </div>
        <Link
          to="/dashboard/add-item"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List New Gear</span>
        </Link>
      </div>

      {myItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">No items listed yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Start earning by listing your high-value equipment for your neighbors to rent.
            </p>
          </div>
          <Link
            to="/dashboard/add-item"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myItems.map((item) => {
            const displayImage = item.images && item.images.length > 0 
              ? getImageUrl(item.images[0].image) 
              : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80';

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-row sm:flex-col h-full w-full">
                
                {/* Visual Asset Capture Cover Panel */}
                <div className="relative w-28 xs:w-36 sm:w-full shrink-0 aspect-square sm:aspect-video bg-slate-100 overflow-hidden">
                  <img 
                    src={displayImage} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
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
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{parseFloat(item.rating).toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.location}</span>
                    </p>
                  </div>

                  {/* Pricing Info */}
                  <div className="pt-2 sm:pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rate</p>
                      <p className="text-sm xs:text-base sm:text-lg font-black text-slate-900">
                        {formatINR(item.price_per_day)}<span className="text-[10px] sm:text-xs font-normal text-slate-400">/day</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Deposit</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-700">{formatINR(item.deposit_amount)}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-2 pt-2">
                    <Link 
                      to={`/item/${item.id}`}
                      className="flex-1 text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition duration-200 cursor-pointer"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={actionLoading === item.id}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center"
                    >
                      {actionLoading === item.id ? (
                        <span className="text-[10px] font-semibold">Deleting...</span>
                      ) : (
                        <Trash2 className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
