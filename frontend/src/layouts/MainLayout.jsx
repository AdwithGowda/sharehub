import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

export default function MainLayout() {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setNotifications([]);
      return;
    }

    loadNotifications();
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed loading notifications:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.is_read) return;

    try {
      await notificationService.markAsRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
    } catch (err) {
      console.error('Failed marking notification read:', err);
    }
  };

  const handleLogoutClick = () => {
    logout(() => {
      setNotifications([]);
      navigate('/');
    });
  };

  const isHomeActive = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Premium Glassmorphic Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand Anchor */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 active:scale-95 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800 transition-colors group-hover:text-blue-600">
              Share<span className="text-blue-600 font-black">Hub</span>
            </span>
          </Link>

          {/* Navigation & Actions Controls (Desktop) */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                isHomeActive 
                  ? 'text-blue-600 bg-blue-50/70' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              Browse Gear
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Alerts Popover Panel */}
                {!isAdmin && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      type="button"
                      onClick={() => setShowNotifications((value) => !value)}
                      className={`relative rounded-xl border border-slate-200/80 bg-white p-2 text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 ${
                        showNotifications ? 'bg-slate-50 border-slate-300 text-slate-800' : ''
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center">
                          <p className="text-xs font-black text-slate-800">Alerts</p>
                          {unreadCount > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">{unreadCount} unread</span>}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs font-semibold text-slate-400">No notifications yet.</div>
                        ) : (
                          <div className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
                            {notifications.map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => handleNotificationClick(notification)}
                                className={`block w-full p-4 text-left transition hover:bg-slate-50 ${notification.is_read ? 'bg-white' : 'bg-blue-50/30'}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-xs font-bold text-slate-900">{notification.title}</p>
                                  {!notification.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                                </div>
                                <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-500">{notification.message}</p>
                                <p className="mt-2 text-[10px] font-bold text-slate-400">{new Date(notification.created_at).toLocaleString('en-IN')}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Unified Interactive Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className={`flex items-center space-x-2 p-1 rounded-xl border border-slate-200/80 bg-white transition-all duration-200 cursor-pointer focus:outline-hidden hover:bg-slate-50 ${
                      showProfileMenu ? 'border-slate-300 bg-slate-50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-100 to-indigo-100 border border-blue-200/50 flex items-center justify-center overflow-hidden">
                      {user?.profile_image ? (
                        <img src={user.profile_image} alt="Profile avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-black text-blue-700 uppercase">{user?.username?.substring(0, 2)}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700 hidden sm:block pr-1">@{user?.username}</span>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Context Metadata */}
                      <div className="px-3 py-2.5 border-b border-slate-50">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name || user?.username}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-2 border ${
                          isAdmin 
                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {user?.role || 'Customer'}
                        </span>
                      </div>

                      {/* Navigation list */}
                      <div className="py-1.5 space-y-0.5">
                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Admin Console</span>
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>My Rental Bookings</span>
                            </Link>
                            <Link
                              to="/dashboard/listings"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span>My Listing Requests</span>
                            </Link>
                            <Link
                              to="/dashboard/wallet"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Escrow Wallet</span>
                            </Link>
                            <Link
                              to="/dashboard/kyc"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span>Trust Verification</span>
                            </Link>
                            <Link
                              to="/dashboard/add-item"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              <span>List New Gear</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1.5 mt-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogoutClick();
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 px-5 py-2 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-102 active:scale-98">
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Navigation Controls (Mobile Toggle Button + Alerts) */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && !isAdmin && (
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications((value) => !value)}
                  className={`relative rounded-xl border border-slate-200/80 bg-white p-2 text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 ${
                    showNotifications ? 'bg-slate-50 border-slate-300 text-slate-800' : ''
                  }`}
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-72 max-w-[320px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center">
                      <p className="text-xs font-black text-slate-800">Alerts</p>
                      {unreadCount > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">{unreadCount} unread</span>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs font-semibold text-slate-400">No notifications yet.</div>
                    ) : (
                      <div className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleNotificationClick(notification)}
                            className={`block w-full p-4 text-left transition hover:bg-slate-50 ${notification.is_read ? 'bg-white' : 'bg-blue-50/30'}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs font-bold text-slate-900">{notification.title}</p>
                              {!notification.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-500">{notification.message}</p>
                            <p className="mt-2 text-[10px] font-bold text-slate-400">{new Date(notification.created_at).toLocaleString('en-IN')}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 focus:outline-hidden"
            >
              <span className="sr-only">Toggle main menu</span>
              {showMobileMenu ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel Menu */}
        {showMobileMenu && (
          <div className="absolute left-0 right-0 top-16 md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to="/"
              className={`block text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isHomeActive 
                  ? 'text-blue-600 bg-blue-50/70 font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Browse Gear
            </Link>

            {isAuthenticated ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="px-4 py-2 flex items-center space-x-3 bg-slate-50/50 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-100 to-indigo-100 border border-blue-200/50 flex items-center justify-center overflow-hidden">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="Profile avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-blue-700 uppercase">{user?.username?.substring(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">@{user?.username}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="block px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl"
                    >
                      Admin Console
                    </Link>
                  ) : (
                    <>
                      <Link to="/dashboard" className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">My Rental Bookings</Link>
                      <Link to="/dashboard/listings" className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">My Listing Requests</Link>
                      <Link to="/dashboard/wallet" className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Escrow Wallet</Link>
                      <Link to="/dashboard/kyc" className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">Trust Verification</Link>
                      <Link to="/dashboard/add-item" className="block px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl">List New Gear</Link>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <Link to="/login" className="text-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2.5 border border-slate-200 rounded-xl">
                  Sign In
                </Link>
                <Link to="/register" className="text-center text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 px-5 py-2.5 rounded-xl shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Dynamic View Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} ShareHub peer-to-peer asset network. Built securely.
      </footer>
    </div>
  );
}

