import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Building, Lock, User as UserIcon, ArrowRight, Key, RefreshCw, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const paidAmount = searchParams.get('amount');
  const orderNum = searchParams.get('order');
  const recipient = searchParams.get('recipient') || '9398979155-1@superyes';

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
      setError(err.response?.data?.message || 'Invalid roll number, username, or password.');
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

  const handleClearSession = () => {
    logout();
    setError('Saved session cleared. You can sign in now.');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center rounded-xl mx-auto shadow-sm">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Campus Identity Portal</h2>
          <p className="text-xs text-zinc-500">Sign in with your roll number, username, or college email</p>
        </div>

        {/* Payment Received Alert */}
        {paymentSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-emerald-900">Payment Confirmed & Received</div>
              <div className="text-[11px] text-emerald-700 leading-snug">
                Payment of ₹{paidAmount || '0.00'} verified on{' '}
                <span className="font-mono font-bold text-emerald-900">{recipient}</span>.
                Order {orderNum ? `#${orderNum}` : ''} confirmed.
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button
              onClick={handleClearSession}
              className="underline text-[11px] font-semibold text-rose-800 hover:text-rose-900 ml-2"
            >
              Clear Session
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              Roll Number / Email / Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. 2511cs020633 or admin@college.ac.in"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-lg placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 block">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-lg placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Campus Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
          <Link
            to="/platform-admin/login"
            className="hover:text-zinc-900 transition-colors font-medium"
          >
            Platform Console →
          </Link>
          <button
            type="button"
            onClick={handleClearSession}
            className="hover:text-zinc-900 inline-flex items-center gap-1 font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Session
          </button>
        </div>
      </div>

      {/* Temporary Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
              <Key className="w-4 h-4 text-zinc-700" />
              <span>Password Update Required</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              You are logging in with a temporary password. Please set a new permanent password to secure your account.
            </p>

            {resetError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {resetError}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">New Permanent Password</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-lg focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-lg focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold text-xs transition-colors"
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
