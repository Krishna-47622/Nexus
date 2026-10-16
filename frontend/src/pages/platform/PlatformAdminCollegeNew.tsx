import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Building, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export const PlatformAdminCollegeNew: React.FC = () => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/platform-admin/colleges', {
        name,
        domain,
        logoUrl,
        address,
        adminName,
        adminEmail,
      });

      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create college tenant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/platform-admin/colleges" className="p-1 text-ink-muted hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-extrabold text-white">Onboard New Institutional Tenant</h2>
          <p className="text-xs text-ink-muted">Configure isolated database tenant and provision first College Admin</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs rounded-2xl">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-2xl space-y-2">
          <div className="font-bold text-sm">✓ Institutional Tenant Onboarded Successfully!</div>
          <div>College: <span className="font-bold text-white">{result.collegeName}</span></div>
          <div>Admin Username: <code className="bg-emerald-900 px-1 font-mono font-bold">{result.adminUsername}</code></div>
          <div>Temporary Password: <code className="bg-emerald-900 px-1 font-mono font-bold">{result.adminTempPassword}</code></div>
        </div>
      )}

      <form onSubmit={handleCreateCollege} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-ink-ghost uppercase tracking-wider">Institution Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-ghost block">College Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Institute of Technology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-2xl text-xs mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-ghost block">Email Domain (Unique)</label>
            <input
              type="text"
              required
              placeholder="apex.edu"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-2xl text-xs mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-ghost block">Campus Address</label>
          <input
            type="text"
            required
            placeholder="Kavuri Hills, Hyderabad"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-2xl text-xs mt-1"
          />
        </div>

        <h3 className="text-xs font-bold text-ink-ghost uppercase tracking-wider pt-2 border-t border-slate-800">
          Provision First College Admin Account
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-ghost block">Admin Full Name</label>
            <input
              type="text"
              required
              placeholder="Dr. Rajesh Rao"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-2xl text-xs mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-ghost block">Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@apex.edu"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-2xl text-xs mt-1"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading ? 'Provisioning Tenant...' : 'Onboard College & Provision Admin'}
        </button>
      </form>
    </div>
  );
};
