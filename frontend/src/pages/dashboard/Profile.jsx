import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useContext(AuthContext);

  // Profile fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Password visibility triggers
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await API.put('accounts/profile/', { name, email, phone });
      await refreshProfile();
      setProfileSuccess('Profile details updated successfully!');
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (errors) {
        // Build a user-friendly error string
        const errMsg = Object.entries(errors)
          .map(([key, val]) => `${key.toUpperCase()}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join('\n');
        setProfileError(errMsg || 'Failed updating profile.');
      } else {
        setProfileError('An unexpected server error occurred.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password fields must match.');
      setPasswordLoading(false);
      return;
    }

    try {
      await API.post('accounts/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('Your password has been changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (errors) {
        const errMsg = Object.entries(errors)
          .map(([key, val]) => `${Array.isArray(val) ? val.join(' ') : val}`)
          .join(' ');
        setPasswordError(errMsg || 'Failed to change password.');
      } else {
        setPasswordError('An unexpected server error occurred.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Profile Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your secure credentials, email, and contact information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Profile Details */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Details</h3>
              <p className="text-xs text-slate-400">Update your primary profile parameters.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            {/* Profile Success & Error Alerts */}
            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 flex items-start gap-2.5 text-xs font-bold animate-in fade-in duration-200">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-600" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="bg-red-50 border border-red-100 text-red-850 rounded-xl p-3 flex items-start gap-2.5 text-xs font-bold whitespace-pre-line animate-in fade-in duration-200">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-650" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{profileLoading ? 'Updating Profile...' : 'Save Profile Details'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Change Password */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Security Credentials</h3>
              <p className="text-xs text-slate-400">Regularly update password rules to lock credentials.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            
            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showOld ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOld ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Password Success & Error Alerts */}
            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 flex items-start gap-2.5 text-xs font-bold animate-in fade-in duration-200">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="bg-red-50 border border-red-100 text-red-850 rounded-xl p-3 flex items-start gap-2.5 text-xs font-bold animate-in fade-in duration-200">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-650" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>{passwordLoading ? 'Changing Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
