import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

export const PlatformAdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePlatformLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/platform-login', {
        username: username.trim(),
        password,
      });

      login(res.data.token, res.data);
      navigate('/platform-admin/overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Platform admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-scale-in transition-colors">
        {/* Back Link */}
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Campus Portal Login
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center rounded-xl mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Platform Root Console</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Multi-tenant root administration & institutional IAM</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePlatformLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Superadmin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="root username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-850 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Master Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-850 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 hover-lift active-press"
          >
            {loading ? 'Authenticating Platform Superadmin...' : 'Access Root Console'}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
          Strictly restricted to authorized university system administrators.
        </div>
      </div>
    </div>
  );
};
