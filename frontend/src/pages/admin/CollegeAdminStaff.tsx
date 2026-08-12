import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Users, UserPlus, Key, CheckCircle2 } from 'lucide-react';

interface StaffAccount {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export const CollegeAdminStaff: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState('Canteen Staff');
  const [createdResult, setCreatedResult] = useState<any>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    api.get('/admin/staff')
      .then((res) => setStaffList(res.data))
      .finally(() => setLoading(false));
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedResult(null);
    try {
      const res = await api.post('/admin/staff', {
        fullName,
        email,
        roleName,
      });
      setCreatedResult(res.data);
      setFullName('');
      setEmail('');
      fetchStaff();
    } catch (err) {
      alert('Failed to add staff account.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Staff Account Management</h2>
        <p className="text-xs text-slate-500">Provision department operator accounts and assign RBAC roles</p>
      </div>

      {/* Add Staff Form */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-primary" /> Provision New Staff Account
        </h3>

        {createdResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm space-y-1">
            <div className="font-bold">✓ Staff Account Created Successfully!</div>
            <div>Username: <code className="bg-emerald-100 px-1 font-mono font-bold">{createdResult.username}</code></div>
            <div>Temp Password: <code className="bg-emerald-100 px-1 font-mono font-bold">{createdResult.tempPassword}</code></div>
          </div>
        )}

        <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
            <input
              type="email"
              required
              placeholder="suresh@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block">Assign Department Role</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
            >
              <option value="Canteen Staff">Canteen Staff</option>
              <option value="Sports Room Staff">Sports Room Staff</option>
              <option value="Print Shop Staff">Print Shop Staff</option>
              <option value="Warden">Hostel Warden</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark transition"
            >
              + Create Staff Account
            </button>
          </div>
        </form>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-700">
            <tr>
              <th className="p-3">Full Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Assigned Role</th>
              <th className="p-3">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                <td className="p-3 font-mono">{s.username}</td>
                <td className="p-3 text-slate-600">{s.email}</td>
                <td className="p-3 font-semibold text-primary">{s.roleName}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-sm border border-emerald-300">
                    ACTIVE
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
