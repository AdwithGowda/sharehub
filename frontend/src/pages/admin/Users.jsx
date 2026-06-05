import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed loading user directory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setTogglingId(id);
      await adminService.toggleUserActive(id);
      loadUsers();
    } catch (err) {
      alert("Error toggling user active status.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Directory & Compliance</h2>
        <p className="text-sm text-slate-500 mt-1">Monitor user account statuses, manage security access, and toggle suspension controls.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="px-6 py-4">User Profile</th>
              <th className="px-6 py-4">Role Classification</th>
              <th className="px-6 py-4">Trust Status (KYC)</th>
              <th className="px-6 py-4">Login Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-slate-900">@{u.username}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                    u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                    u.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {u.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    disabled={togglingId === u.id || u.role === 'ADMIN'}
                    value={u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if ((newStatus === 'ACTIVE' && u.is_active) || (newStatus === 'SUSPENDED' && !u.is_active)) return;
                      handleToggleStatus(u.id);
                    }}
                    className={`rounded-2xl border px-3 py-2 text-xs font-bold shadow-sm focus:outline-none cursor-pointer ${
                      u.is_active 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
