import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { itemService } from '../../services/itemService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AddItem() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [description, setDescription] = useState('');
  const [itemImages, setItemImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (itemImages.length === 0) {
      setImagePreviews([]);
      return;
    }
    const urls = itemImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [itemImages]);

  const handleRemoveImage = (index) => {
    setItemImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await itemService.getCategories();
        setCategories(cats);
      } catch (err) {
        setError('Could not load item categories. Please refresh the page.');
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setItemImages([e.target.files[0]]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user?.is_verified) {
      setError('Complete KYC verification before listing an item for rent.');
      return;
    }

    if (!category) {
      setError('Please choose a valid item category.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('price_per_day', pricePerDay);
      formData.append('deposit_amount', depositAmount);
      formData.append('description', description);
      itemImages.forEach((image) => formData.append('uploaded_images', image));

      await itemService.uploadNewItem(formData);
      setSuccess('Your item listing has been published successfully.');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      const data = err.response?.data;
      const apiError = data?.error || data?.detail || Object.values(data || {}).flat().join(' ');
      setError(apiError || 'A problem occurred while publishing your listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">List Gear for Rent</h2>
        <p className="text-sm text-slate-500 mt-1">Add an item you own so renters can request it from the marketplace.</p>
      </div>

      {!user?.is_verified && (
        <div className="mb-5 p-4 bg-amber-50 text-amber-800 rounded-2xl text-xs font-semibold border border-amber-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>Your account must be KYC verified before you can publish rental listings.</span>
          <Link
            to="/dashboard/kyc"
            className="shrink-0 text-center bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl font-bold transition-colors"
          >
            Complete KYC
          </Link>
        </div>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-100">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-100">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Item Title"
            required
            placeholder="e.g., DJI Mavic 3 Pro Drone"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Price Per Day (INR)"
            type="number"
            required
            placeholder="1500"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
          />

          <Input
            label="Security Deposit (INR)"
            type="number"
            required
            placeholder="8000"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />

          <Input
            label="Pickup Location"
            required
            placeholder="e.g., Indiranagar, Bengaluru"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description and Rules</label>
          <textarea
            required
            rows="4"
            placeholder="Describe condition, included accessories, pickup rules, and any renter requirements."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Image</label>
          
          {imagePreviews.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700">Click to browse item cover photo</p>
                <p className="text-[11px] text-slate-400 font-semibold">Supports PNG, JPG, JPEG. (Max 1 file)</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-100 group shadow-xs">
              <img
                src={imagePreviews[0]}
                alt="Item Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setItemImages([])}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.97] cursor-pointer"
                >
                  Remove Cover Photo
                </button>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" loading={loading} disabled={!user?.is_verified}>
          Publish Marketplace Listing
        </Button>
      </form>
    </div>
  );
}
