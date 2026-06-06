import React from 'react';
import { Routes, Route, Link, NavLink, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Home from '../pages/marketplace/Home';
import ItemDetails from '../pages/marketplace/ItemDetails';
import MyBookings from '../pages/dashboard/MyBookings';
import MyListings from '../pages/dashboard/MyListings';
import Wallet from '../pages/dashboard/Wallet';
import DashboardOverview from '../pages/admin/DashboardOverview';
import KYC from '../pages/admin/KYC';
import Users from '../pages/admin/Users';
import Items from '../pages/admin/Items';
import Bookings from '../pages/admin/Bookings';
import Disputes from '../pages/admin/Disputes';
import Broadcast from '../pages/admin/Broadcast';
import Withdrawals from '../pages/admin/Withdrawals';
import Payments from '../pages/admin/Payments';
import Wallets from '../pages/admin/Wallets';
import Reviews from '../pages/admin/Reviews';
import ChatMonitoring from '../pages/admin/ChatMonitoring';
import Notifications from '../pages/admin/Notifications';
import Settings from '../pages/admin/Settings';
import BookingDetails from '../pages/dashboard/BookingDetails';
import AddItem from '../pages/dashboard/AddItem';
import KYCUpload from '../pages/dashboard/KYCUpload';
import MyListedGear from '../pages/dashboard/MyListedGear';
import Profile from '../pages/dashboard/Profile';
import Features from '../pages/marketplace/Features';


export default function AppRoutes() {
  const getLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 text-xs font-semibold px-4 py-3 rounded-2xl transition-all duration-200 border-l-4 ${
      isActive
        ? 'text-blue-600 bg-blue-50/70 border-blue-600 pl-3 font-bold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 border-transparent pl-4 font-semibold'
    }`;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/item/:id" element={<ItemDetails />} />

        <Route element={<ProtectedRoute adminOnly={false} />}>
          <Route path="/dashboard" element={
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fade-in">
              <div className="md:col-span-1 bg-white border border-slate-200/60 p-4 rounded-3xl h-fit space-y-1.5 shadow-sm">
                <div className="px-3 py-2 mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Account Menu</p>
                </div>
                
                <NavLink to="/dashboard" end className={getLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Rental Bookings</span>
                </NavLink>

                <NavLink to="/dashboard/listings" className={getLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>My Listing Requests</span>
                </NavLink>

                <NavLink to="/dashboard/my-gear" className={getLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>My Listed Gear</span>
                </NavLink>

                <NavLink to="/dashboard/wallet" className={getLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Escrow Wallet Ledger</span>
                </NavLink>

                <NavLink to="/dashboard/add-item" className={getLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>List New Gear</span>
                </NavLink>

                <NavLink to="/dashboard/kyc" className={getLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Trust Verification (KYC)</span>
                </NavLink>

                <NavLink to="/dashboard/profile" className={getLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Profile Settings</span>
                </NavLink>
              </div>
              <div className="md:col-span-3">
                <Outlet />
              </div>
            </div>
          }>
            <Route index element={<MyBookings />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="my-gear" element={<MyListedGear />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="booking/:id" element={<BookingDetails />} />
            <Route path="add-item" element={<AddItem />} />
            <Route path="kyc" element={<KYCUpload />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="users" element={<Users />} />
            <Route path="items" element={<Items />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="payments" element={<Payments />} />
            <Route path="wallets" element={<Wallets />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="disputes" element={<Disputes />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="chat" element={<ChatMonitoring />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="broadcast" element={<Broadcast />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <h1 className="text-6xl font-black text-slate-300">404</h1>
          <p className="text-slate-600 mt-2 font-medium">The specified marketplace route profile does not exist.</p>
          <Link to="/" className="mt-4 text-sm font-bold text-blue-600 hover:underline">Return to home screen</Link>
        </div>
      } />
    </Routes>
  );
}
