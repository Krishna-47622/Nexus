import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Building, Lock, User as UserIcon, ArrowRight, Key, RefreshCw, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Temporary password reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [tempUserToken, setTempUserToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password,
      });

      const data = response.data;

      if (data.mustChangePassword) {
        setTempUserToken(data.token);
        setShowResetModal(true);
        setLoading(false);
        return;
      }

      login(data.token, {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        collegeId: data.collegeId,
        collegeName: data.collegeName,
        primaryRole: data.primaryRole,
        mustChangePassword: false,
        permissions: data.permissions || [],
      });

      redirectUserByRole(data.primaryRole);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    try {
      await api.post(
        '/auth/set-password',
        { oldPassword: password, newPassword },
        { headers: { Authorization: `Bearer ${tempUserToken}` } }
      );

      const response = await api.post('/auth/login', { username, password: newPassword });
      const data = response.data;

      login(data.token, data);
      setShowResetModal(false);
      redirectUserByRole(data.primaryRole);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Failed to set new password');
    }
  };

  const redirectUserByRole = (role: string) => {
    const r = role ? role.toLowerCase() : '';
    if (r.includes('platform')) {
      navigate('/platform-admin/overview', { replace: true });
    } else if (r.includes('student')) {
      navigate('/app/home', { replace: true });
    } else if (r.includes('admin')) {
      navigate('/admin/college/analytics', { replace: true });
    } else if (r.includes('sports')) {
      navigate('/staff/sports/pending', { replace: true });
    } else if (r.includes('print')) {
      navigate('/staff/print/queue', { replace: true });
    } else if (r.includes('warden')) {
      navigate('/staff/warden/approvals', { replace: true });
    } else {
      navigate('/staff/canteen/orders', { replace: true });
    }
  };

  const fillQuickCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleClearSession = () => {
    logout();
    setError('Saved session cleared. You can sign in now.');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-sm p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-sm mx-auto font-black text-xl">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Campus Identity Portal</h2>
          <p className="text-xs text-slate-500">Sign in with your roll number, username, or college email</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={handleClearSession} className="underline text-[11px] font-bold text-red-900 hover:text-red-700">
              Clear Session
            </button>
          </div>
        )}

        {/* Quick Credentials Buttons */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Quick Demo Logins</div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin@mallareddyuniversity.ac.in', '1234')}
              className="px-2 py-1 bg-white border border-slate-300 rounded-sm text-left hover:border-primary text-slate-800 font-medium truncate"
            >
              🔑 College Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin', '1234')}
              className="px-2 py-1 bg-white border border-slate-300 rounded-sm text-left hover:border-primary text-slate-800 font-medium truncate"
            >
              🛡️ Platform Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('2511cs020633@mallareddyuniversity.ac.in', '123456')}
              className="px-2 py-1 bg-white border border-slate-300 rounded-sm text-left hover:border-primary text-slate-800 font-medium truncate col-span-2"
            >
              🎓 Student (Veeram Reddy)
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block">Roll Number / Email / Username</label>
            <div className="relative mt-1">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. 22101 or student@mallareddyuniversity.ac.in"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Campus'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleClearSession}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Local Browser Session
          </button>
        </div>
      </div>

      {/* Temporary Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-sm p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Key className="w-5 h-5" />
              <span>Temporary Password Update Required</span>
            </div>
            <p className="text-xs text-slate-600">
              You are logging in with a temporary system password. Please set a new permanent password to secure your account.
            </p>

            {resetError && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {resetError}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block">New Permanent Password</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark transition"
              >
                Set Permanent Password & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
