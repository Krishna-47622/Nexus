import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

export const PlatformAdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1234');
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
        username,
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
      <div className="w-full max-w-md clay-card bg-gradient-to-br from-[#1e293b] to-[#0f172a] !border-0 !shadow-clay-lg p-6 md:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-clay-indigo to-clay-sky text-white flex items-center justify-center rounded-2xl mx-auto shadow-clay-btn">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Platform Root Console</h2>
          <p className="text-xs text-slate-400 font-medium">Multi-Tenant Platform Administrator Authentication</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-clay-badge">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePlatformLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Superadmin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 text-white text-sm rounded-2xl shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] border border-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-clay-indigo/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Master Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 text-white text-sm rounded-2xl shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] border border-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-clay-indigo/40 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clay-btn w-full disabled:opacity-50"
          >
            {loading ? 'Authenticating Platform Superadmin...' : 'Access Root Console'}
          </button>
        </form>

        <div className="pt-3 text-center text-xs text-slate-500 border-t border-white/10 font-medium">
          Seed credentials: <code className="bg-white/10 px-2 py-0.5 rounded-lg text-slate-300 font-mono shadow-clay-badge">admin</code> / <code className="bg-white/10 px-2 py-0.5 rounded-lg text-slate-300 font-mono shadow-clay-badge">1234</code>
        </div>
      </div>
    </div>
  );
};
