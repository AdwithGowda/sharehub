import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Front-end anchor state representation until email microservices integrate
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3.5">
            <Link
              to="/"
              className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase text-blue-600 bg-blue-50/80 rounded-md border border-blue-100/50 hover:bg-blue-100/60 active:scale-95 transition-all cursor-pointer inline-block"
            >
              ShareHub Portal
            </Link>
            <Link
              to="/"
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors uppercase tracking-wider"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-slate-500 mt-1.5 text-xs font-semibold leading-relaxed">
            We'll dispatch recovery coordinates straight away.
          </p>
        </div>


        {submitted ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm border border-emerald-100 font-medium">
              If an account matches <strong>{email}</strong>, a recovery link is on its way.
            </div>
            <Link to="/login" className="block text-sm font-semibold text-blue-600 hover:underline pt-2">
              Return to Login Screen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Registered Email"
              type="email"
              required
              placeholder="Enter your profile email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit">
              Send Password Link
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-700 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
