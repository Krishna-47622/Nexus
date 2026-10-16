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
        <h2 className="text-xl font-extrabold text-ink">Staff Account Management</h2>
        <p className="text-xs text-ink-soft">Provision department operator accounts and assign RBAC roles</p>
      </div>

      {/* Add Staff Form */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-zinc-900" /> Provision New Staff Account
        </h3>

        {createdResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg space-y-1">
            <div className="font-bold">✓ Staff Account Created Successfully!</div>
            <div>Username: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">{createdResult.username}</code></div>
            <div>Temp Password: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">{createdResult.tempPassword}</code></div>
          </div>
        )}

        <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block">Email Address</label>
            <input
              type="email"
              required
              placeholder="suresh@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block">Assign Department Role</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900 bg-white"
            >
              <option value="Canteen Staff">Canteen Staff</option>
              <option value="Sports Room Staff">Sports Room Staff</option>
              <option value="Print Shop Staff">Print Shop Staff</option>
              <option value="Warden">Hostel Warden</option>
            </select>
          </div>

          <div className="flex items-end pt-1 md:pt-0">
            <button
              type="submit"
              className="w-full py-2 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 text-xs transition-colors shadow-sm"
            >
              + Create Staff Account
            </button>
          </div>
        </form>
      </div>

      {/* ─── MOBILE VIEW: CLEAN RESPONSIVE CARDS (strictly < md) ─── */}
      <div className="md:hidden space-y-3">
        {staffList.map((s) => (
          <div key={s.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">{s.fullName}</h3>
                <span className="text-xs font-mono text-zinc-500">{s.username}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex flex-col gap-1">
              <div>
                <span className="text-zinc-400 font-medium">Email: </span>
                <span className="text-zinc-800">{s.email}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Role: </span>
                <span className="font-semibold text-zinc-900">{s.roleName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── DESKTOP VIEW: CLEAN TABLE (md and above) ─── */}
      <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-600 uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Full Name</th>
              <th className="p-3.5">Username</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {staffList.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50/70 transition-colors">
                <td className="p-3.5 font-bold text-zinc-900">{s.fullName}</td>
                <td className="p-3.5 font-mono text-zinc-600">{s.username}</td>
                <td className="p-3.5 text-zinc-500">{s.email}</td>
                <td className="p-3.5 font-semibold text-zinc-900">{s.roleName}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
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
