import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.is_staff) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password configuration.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal Login</h2>
          <p className="text-slate-500 mt-1.5 text-xs font-semibold leading-relaxed">
            Enter your credentials to manage rentals, bookings, and platform settings.
          </p>
        </div>


        {error && (
          <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" loading={loading}>
            Sign In to Platform
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          New to the marketplace?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
