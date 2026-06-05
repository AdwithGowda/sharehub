import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/common/Loader';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (localStorage.getItem('access_token')) {
        try {
          const res = await API.get('accounts/profile/');
          setUser(res.data);
        } catch (err) {
          console.error("Session profile token parse error or mismatch expired status");
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    fetchCurrentProfile();
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const refreshProfile = async () => {
    if (localStorage.getItem('access_token')) {
      try {
        const res = await API.get('accounts/profile/');
        setUser(res.data);
        return res.data;
      } catch (err) {
        console.error("Session profile token parse error or mismatch expired status");
        localStorage.clear();
        setUser(null);
      }
    }
  };

  const login = async (email, password) => {
    const res = await API.post('accounts/login/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    
    const profileRes = await API.get('accounts/profile/');
    setUser(profileRes.data);
    return profileRes.data;
  };

  const logout = (onComplete) => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.clear();
      setUser(null);
      setIsLoggingOut(false);
      if (onComplete) {
        onComplete();
      }
    }, 1200);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile, isAuthenticated: !!user, isAdmin: user?.is_staff, isLoggingOut }}>
      <div className="relative min-h-screen">
        {isLoggingOut && (
          <div className="fixed inset-0 bg-slate-50 z-[9999] flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <Loader />
            <div className="text-center space-y-1">
              <p className="text-slate-800 font-black text-lg tracking-tight">Logging Out</p>
              <p className="text-slate-500 font-semibold text-xs">Clearing secure session credentials...</p>
            </div>
          </div>
        )}
        {!loading ? children : <Loader fullScreen />}
      </div>
    </AuthContext.Provider>
  );
};
