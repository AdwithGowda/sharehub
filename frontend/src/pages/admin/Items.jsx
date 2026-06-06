import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatINR } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/imageUrl';

export default function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const [itemData, categoryData] = await Promise.all([
        adminService.getItems(),
        adminService.getCategories()
      ]);
      setItems(itemData);
      setCategories(categoryData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed loading marketplace catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setCreatingCategory(true);
      const category = await adminService.createCategory(categoryName.trim(), categoryDescription.trim());
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName('');
      setCategoryDescription('');
      setSuccess(`Category "${category.name}" was added successfully.`);
    } catch (err) {
      const data = err.response?.data;
      const apiError = data?.name?.[0] || data?.description?.[0] || data?.error;
      setError(apiError || 'Error adding category.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleRemoveItem = async (id) => {
    if (!window.confirm("Are you sure you want to remove this listed item permanently from the marketplace?")) return;
    try {
      setRemovingId(id);
      await adminService.removeItem(id);
      loadItems();
    } catch (err) {
      alert("Error removing listed item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      setDeletingCategory(id);
      await adminService.deleteCategory(id);
      setCategories((current) => current.filter(c => c.id !== id));
      setSuccess("Category deleted successfully.");
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(apiError || "Error deleting category.");
    } finally {
      setDeletingCategory(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Gear Moderation</h2>
        <p className="text-sm text-slate-500 mt-1">Review active listings, manage item categories, and delete prohibited or fake items.</p>
      </div>

      {(error || success) && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-bold ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {error || success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleCreateCategory} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">Add Category</h3>
            <p className="text-xs text-slate-400 mt-1 font-semibold">New categories appear in the Add Item listing form.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Camera Gear"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
            <textarea
              rows="3"
              placeholder="Optional category note for admins."
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={creatingCategory}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-xs"
          >
            {creatingCategory ? 'Adding...' : 'Add Category'}
          </button>
        </form>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-base">Current Categories</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">{categories.length} categories available for listings.</p>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-10 font-semibold text-slate-400 text-xs">
              No categories created yet.
            </div>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 relative">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-900">{category.name}</p>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={deletingCategory === category.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                      title="Delete Category"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] font-medium text-slate-400">
                    {category.description || 'No description'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        {items.length === 0 ? (
          <div className="text-center py-12 font-semibold text-slate-400 text-xs">
            No equipment listed on the platform yet.
          </div>
        ) : (
          <>
            <div className="lg:hidden flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg w-fit mt-4 ml-6 animate-pulse select-none">
              <span>Scroll table horizontally ➔</span>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Owner Profile</th>
                <th className="px-6 py-4">Rental Cost</th>
                <th className="px-6 py-4">Deposit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-xs">
                        <img 
                          src={getImageUrl(item.images?.[0]?.image) || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'} 
                          alt={item.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">📍 {item.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-900">@{item.owner_username}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {formatINR(item.price_per_day)}/day
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatINR(item.deposit_amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={removingId === item.id}
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-3 py-1.5 border border-red-100 hover:bg-red-50 text-red-600 font-bold rounded-xl transition cursor-pointer text-[10px] uppercase disabled:opacity-50"
                    >
                      {removingId === item.id ? "Deleting..." : "Remove Listing"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
