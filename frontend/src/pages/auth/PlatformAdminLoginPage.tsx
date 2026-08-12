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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-sm p-6 md:p-8 space-y-6 text-slate-100 shadow-xl">
        <div className="space-y-1 text-center">
          <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center font-bold text-xl rounded-sm mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Platform Root Console</h2>
          <p className="text-xs text-slate-400 font-medium">Multi-Tenant Platform Administrator Authentication</p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 px-4 py-3 rounded-sm text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlatformLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Superadmin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Master Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating Platform Superadmin...' : 'Access Root Console'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-800">
          Seed credentials: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">admin</code> / <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">1234</code>
        </div>
      </div>
    </div>
  );
};
