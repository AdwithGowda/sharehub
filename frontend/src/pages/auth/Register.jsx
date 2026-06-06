import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setLoading(true);

    try {
      await API.post('accounts/register/', formData);
      navigate('/login', { state: { message: 'Registration complete! Please authenticate.' } });
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setGlobalError('An unexpected server error occurred during creation.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center py-12 px-4">
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join Marketplace</h2>
          <p className="text-slate-500 mt-1.5 text-xs font-semibold leading-relaxed">
            Create an account to share assets safely with verified locals.
          </p>
        </div>


        {globalError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              required
              placeholder="Rahul"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name?.[0]}
            />
            <Input
              label="Last Name"
              name="last_name"
              required
              placeholder="Sharma"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name?.[0]}
            />
          </div>

          <Input
            label="Username"
            name="username"
            required
            placeholder="rahul123"
            value={formData.username}
            onChange={handleChange}
            error={errors.username?.[0]}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            placeholder="rahul@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email?.[0]}
          />

          <Input
            label="Phone Number"
            name="phone"
            type="text"
            required
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone?.[0]}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password?.[0]}
          />

          <Button type="submit" loading={loading}>
            Create Free Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already verified?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
