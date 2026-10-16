import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Building, Lock, User as UserIcon, ArrowRight, Key, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
      <div className="w-full max-w-md clay-card p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-gradient-to-br from-clay-indigo to-clay-violet text-white flex items-center justify-center rounded-2xl mx-auto shadow-clay-btn">
            <Building className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-ink">Campus Identity Portal</h2>
          <p className="text-xs text-ink-soft font-medium">Sign in with your roll number, username, or college email</p>
        </div>

        {/* Payment Received & Auto-Logout Alert */}
        {paymentSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-clay-card animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-extrabold text-emerald-900">
                Payment Confirmed & Received!
              </div>
              <div className="text-[11px] text-emerald-800 leading-snug">
                Payment of ₹{paidAmount || '0.00'} verified on{' '}
                <span className="font-mono font-bold text-emerald-950">{recipient}</span>.
                Order {orderNum ? `#${orderNum}` : ''} confirmed and your session has been safely closed.
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-clay-coral/10 border border-clay-coral/20 text-clay-coral text-xs rounded-2xl flex items-center justify-between shadow-clay-badge">
            <span className="font-medium">{error}</span>
            <button onClick={handleClearSession} className="underline text-[11px] font-bold text-clay-coral hover:text-clay-coral/80">
              Clear Session
            </button>
          </div>
        )}

        {/* Quick Demo Logins */}
        <div className="p-4 bg-clay-bg/60 rounded-2xl shadow-clay-inset space-y-3">
          <div className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Quick Demo Logins</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { label: '🔑 College Admin', u: 'admin@mallareddyuniversity.ac.in', p: '1234' },
              { label: '🛡️ Platform Admin', u: 'admin', p: '1234' },
              { label: '🎓 Student (Veeram Reddy)', u: '2511cs020633@mallareddyuniversity.ac.in', p: '123456', span: true },
              { label: 'Canteen Staff', u: 'canteen_staff', p: '1234' },
              { label: 'Sports Staff', u: 'sports_staff', p: '1234' },
              { label: 'Print Staff', u: 'print_staff', p: '1234' },
              { label: 'Warden', u: 'warden', p: '1234' },
            ].map((cred) => (
              <button
                key={cred.u}
                type="button"
                onClick={() => fillQuickCredentials(cred.u, cred.p)}
                className={`px-3 py-2 bg-white rounded-xl text-left hover:shadow-clay-card hover:-translate-y-0.5 text-ink font-semibold truncate transition-all shadow-clay-sm active:scale-[0.97] ${cred.span ? 'col-span-2' : ''}`}
              >
                {cred.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-ink-soft block mb-1.5">Roll Number / Email / Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-ink-muted absolute left-4 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. 22101 or student@college.ac.in"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="clay-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-soft block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-4 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="clay-input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clay-btn w-full disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Campus'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleClearSession}
            className="text-[11px] text-ink-muted hover:text-ink-soft inline-flex items-center gap-1 font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Local Browser Session
          </button>
        </div>
      </div>

      {/* Temporary Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="clay-card p-6 max-w-sm w-full space-y-4 !shadow-clay-lg">
            <div className="flex items-center gap-2 text-clay-amber font-bold text-sm">
              <Key className="w-5 h-5" />
              <span>Temporary Password Update Required</span>
            </div>
            <p className="text-xs text-ink-soft">
              You are logging in with a temporary system password. Please set a new permanent password to secure your account.
            </p>

            {resetError && (
              <div className="p-2 bg-clay-coral/10 border border-clay-coral/20 text-clay-coral text-xs rounded-2xl shadow-clay-badge">
                {resetError}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-ink-soft block mb-1">New Permanent Password</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-soft block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="clay-input"
                />
              </div>

              <button type="submit" className="clay-btn w-full">
                Set Permanent Password & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
