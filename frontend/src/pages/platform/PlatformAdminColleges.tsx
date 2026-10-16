import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Building, Plus, Users, Globe } from 'lucide-react';

interface College {
  id: number;
  name: string;
  domain: string;
  logoUrl: string;
  address: string;
  studentCount: number;
}

export const PlatformAdminColleges: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/platform-admin/colleges')
      .then((res) => setColleges(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Onboarded Colleges & Institutions</h2>
          <p className="text-xs text-ink-muted">Multi-tenant institutional registry</p>
        </div>
        <Link
          to="/platform-admin/colleges/new"
          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-2xl hover:bg-blue-700 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Onboard New College
        </Link>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 p-8 text-center text-xs text-ink-muted">Loading colleges...</div>
      ) : colleges.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 text-center text-xs text-ink-muted">No colleges onboarded yet.</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs text-ink-ghost">
            <thead className="bg-slate-950 border-b border-slate-800 font-bold uppercase text-ink-muted">
              <tr>
                <th className="p-3">College Name</th>
                <th className="p-3">Email Domain</th>
                <th className="p-3">Active Students</th>
                <th className="p-3">Tenant Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {colleges.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" /> {c.name}
                  </td>
                  <td className="p-3 font-mono text-ink-muted">{c.domain}</td>
                  <td className="p-3 font-bold text-slate-200">{c.studentCount} students</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-2xl">
                      ISOLATED TENANT ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
