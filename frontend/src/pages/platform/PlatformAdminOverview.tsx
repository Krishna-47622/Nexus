import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Building, Users, Activity, ShieldCheck, Lock } from 'lucide-react';

interface PlatformOverview {
  totalColleges: number;
  totalStudentsPlatform: number;
  totalStaffPlatform: number;
  systemHealth: string;
  colleges: {
    id: number;
    name: string;
    domain: string;
    studentCount: number;
  }[];
}

export const PlatformAdminOverview: React.FC = () => {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/platform-admin/overview')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading global platform overview...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Global Multi-Tenant Platform Overview</h2>
        <p className="text-xs text-slate-400">High-level platform health & institutional tenant metrics</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Colleges</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data.totalColleges}</div>
          <span className="text-[11px] text-slate-400">Active tenants</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Active Students</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data.totalStudentsPlatform}</div>
          <span className="text-[11px] text-slate-400">Platform-wide</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Staff Accounts</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data.totalStaffPlatform}</div>
          <span className="text-[11px] text-slate-400">Operators & Wardens</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">System Health Status</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-emerald-400">{data.systemHealth}</div>
          <span className="text-[11px] text-slate-400">Render / Supabase JDBC</span>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-sm flex items-center gap-3">
        <Lock className="w-5 h-5 text-blue-400 shrink-0" />
        <p className="text-xs text-slate-400">
          <span className="font-bold text-white">Strict Tenant Privacy Enforced:</span> Individual student records, menu purchases, and leave applications are isolated per college. Platform admins only view high-level institutional aggregates.
        </p>
      </div>

      {/* Colleges Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-sm overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 font-bold uppercase text-slate-400">
            <tr>
              <th className="p-3">College Name</th>
              <th className="p-3">Domain</th>
              <th className="p-3">Student Enrolment</th>
              <th className="p-3">Tenant Isolation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.colleges.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/50">
                <td className="p-3 font-bold text-white">{c.name}</td>
                <td className="p-3 font-mono text-slate-400">{c.domain}</td>
                <td className="p-3 font-bold text-slate-200">{c.studentCount} students</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-sm">
                    ISOLATED DB SCHEMA
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
