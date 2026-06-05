import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const adminNav = [
  { 
    label: 'Overview', 
    path: '/admin',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  { 
    label: 'Users', 
    path: '/admin/users',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  { 
    label: 'KYC', 
    path: '/admin/kyc',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  { 
    label: 'Items', 
    path: '/admin/items',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  { 
    label: 'Bookings', 
    path: '/admin/bookings',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    label: 'Payments', 
    path: '/admin/payments',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  { 
    label: 'Wallets', 
    path: '/admin/wallets',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    label: 'Withdrawals', 
    path: '/admin/withdrawals',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7.5a.5.5 0 01.5-.5h7a.5.5 0 01.5.5v3.5a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-3.5zM4 10h16M4 14h16M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    label: 'Disputes', 
    path: '/admin/disputes',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  { 
    label: 'Reviews', 
    path: '/admin/reviews',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.97-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.772-.567-.372-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
      </svg>
    )
  },
  { 
    label: 'Chat', 
    path: '/admin/chat',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  { 
    label: 'Notifications', 
    path: '/admin/notifications',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  },
  { 
    label: 'Settings', 
    path: '/admin/settings',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout(() => {
      navigate('/');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Premium Admin Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold tracking-tight shadow-md shadow-blue-500/10">A</div>
              <div>
                <p className="text-xs font-black text-slate-900 tracking-tight">Admin Dashboard</p>
                <p className="text-[10px] text-slate-400 font-medium">Marketplace operations and system oversight</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="font-extrabold text-slate-700">@{user?.username || 'Admin'}</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-500">{user?.email || 'admin@platform.local'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 relative">
        {/* Mobile Sidebar Overlay Backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <aside className={classNames(
          'rounded-3xl border border-slate-200/60 bg-white shadow-md h-fit transition-all duration-300 ease-in-out',
          'fixed top-20 bottom-4 left-4 z-50 w-64 overflow-y-auto max-h-[calc(100vh-6rem)]', // mobile positioning
          'lg:sticky lg:top-20 lg:block lg:w-auto lg:max-h-[calc(100vh-6rem)] lg:z-0 lg:overflow-y-auto lg:shadow-xs', // desktop overrides
          mobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-80 opacity-0 pointer-events-none lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto'
        )}>
          <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/50">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Console Directory</p>
          </div>
          <div className="space-y-1 px-3 py-4">
            {adminNav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={classNames(
                    'flex items-center space-x-3 rounded-2xl px-4 py-3 text-xs font-semibold transition-all duration-200 border-l-4',
                    active 
                      ? 'bg-blue-50/70 text-blue-600 border-blue-600 pl-3 font-extrabold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent pl-4'
                  )}
                >
                  <span className={classNames(active ? 'text-blue-600' : 'text-slate-400')}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="space-y-6 min-w-0 w-full">
          <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Marketplace Admin Console</h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">Manage users, listings, bookings, payments, disputes, and platform settings in one place.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/admin/notifications"
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  Send Notification
                </Link>
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
