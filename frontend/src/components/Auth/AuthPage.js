// components/Auth/AuthPage.js — Combined Login & Register
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function InputField({ label, type, value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-cream/60 text-sm tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border font-body text-cream
                    placeholder:text-cream/30 focus:outline-none focus:border-sand/60
                    transition-all duration-200 ${error ? 'border-red-500/60' : 'border-white/10'}`}
      />
      {error && <span className="text-red-400 font-body text-xs">{error}</span>}
    </div>
  );
}

export function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your trips"
      form={
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <InputField
            label="Email" type="email" value={form.email} placeholder="you@example.com"
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          />
          <InputField
            label="Password" type="password" value={form.password} placeholder="••••••••"
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          />
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 font-body text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-sand text-ink font-body font-bold text-base
                       hover:bg-sand-dark disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 hover:shadow-lg hover:shadow-sand/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
          <p className="text-center font-body text-cream/50 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-sand hover:text-sand-dark transition-colors">
              Create one free
            </Link>
          </p>
        </form>
      }
    />
  );
}

export function RegisterPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/plan');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Registration failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start planning your dream trips today"
      form={
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <InputField label="Full Name" type="text" value={form.name} placeholder="Jane Smith"
            onChange={f('name')} error={errors.name} />
          <InputField label="Email" type="email" value={form.email} placeholder="you@example.com"
            onChange={f('email')} error={errors.email} />
          <InputField label="Password" type="password" value={form.password} placeholder="Min. 8 characters"
            onChange={f('password')} error={errors.password} />
          {errors.general && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 font-body text-sm">{errors.general}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-sand text-ink font-body font-bold text-base
                       hover:bg-sand-dark disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 hover:shadow-lg hover:shadow-sand/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
          <p className="text-center font-body text-cream/50 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-sand hover:text-sand-dark transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      }
    />
  );
}

function AuthLayout({ title, subtitle, form }) {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 pt-20">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-sand/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-sky/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-8 h-8 rounded-lg bg-sand flex items-center justify-center">
            <span className="text-ink font-display font-bold text-sm">W</span>
          </div>
          <span className="font-display text-xl text-cream">WanderLux</span>
        </Link>

        <div className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-cream mb-2">{title}</h1>
            <p className="font-body text-cream/50 text-sm">{subtitle}</p>
          </div>
          {form}
        </div>
      </div>
    </div>
  );
}
