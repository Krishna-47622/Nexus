import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Users, Search, Edit2, Key, Trash2, CheckCircle2, Shield, UserX, UserCheck, Plus, AlertCircle } from 'lucide-react';

interface UserAccount {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = [
  'ALL',
  'Student',
  'Canteen Staff',
  'Sports Room Staff',
  'Print Shop Staff',
  'Warden',
  'College Admin',
];

export const CollegeAdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [studentRoll, setStudentRoll] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentDept, setStudentDept] = useState('CSE');
  const [studentYear, setStudentYear] = useState('1');
  const [isHostelResident, setIsHostelResident] = useState(false);
  const [studentHostel, setStudentHostel] = useState('Block-A');
  const [studentRoom, setStudentRoom] = useState('101');
  const [studentPassword, setStudentPassword] = useState('');
  const [createError, setCreateError] = useState('');

  // Edit User Details & Username Modal
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editError, setEditError] = useState('');

  // Password Reset Modal
  const [passwordUser, setPasswordUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [selectedCategory]);

  const fetchUsers = () => {
    setLoading(true);
    const url = selectedCategory === 'ALL' ? '/admin/users' : `/admin/users?category=${encodeURIComponent(selectedCategory)}`;
    api.get(url)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      const res = await api.post('/admin/students', {
        rollNumber: studentRoll,
        fullName: studentName,
        email: studentEmail,
        department: studentDept,
        year: studentYear,
        hostelBlock: isHostelResident ? studentHostel : 'Day Scholar',
        roomNumber: isHostelResident ? studentRoom : 'N/A',
        password: studentPassword,
      });

      showFeedback(`Student account created for ${studentName} (${studentRoll})! Initial password: ${res.data.password}`);
      setShowCreateStudentModal(false);
      setStudentRoll('');
      setStudentName('');
      setStudentEmail('');
      setStudentPassword('');
      setIsHostelResident(false);
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create student account.');
    }
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setEditUsername(u.username);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditRole(u.roleName);
    setEditError('');
  };

  const handleUpdateUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');
    try {
      await api.put(`/admin/users/${editingUser.id}/details`, {
        username: editUsername,
        fullName: editFullName,
        email: editEmail,
        roleName: editRole,
      });
      showFeedback(`Account details for ${editFullName} updated successfully!`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update user details.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser || !newPassword) return;
    try {
      await api.put(`/admin/users/${passwordUser.id}/password`, { newPassword });
      showFeedback(`Password successfully updated for ${passwordUser.username}`);
      setPasswordUser(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleToggleStatus = async (user: UserAccount) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`);
      showFeedback(`Account status updated for ${user.fullName}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (!window.confirm(`Are you sure you want to delete credentials for ${user.fullName} (${user.username})?`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      showFeedback(`Credentials and account deleted for ${user.fullName}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete credentials.');
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 5000);
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink">User & Credentials Management</h2>
          <p className="text-xs text-ink-soft">Filter users by category, modify usernames/roles, or create student credentials</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowCreateStudentModal(true); setCreateError(''); }}
            className="px-3.5 py-1.5 clay-btn text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Student Account
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, roll no, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-white/50 rounded-2xl text-xs w-56 focus:outline-none focus:ring-2 focus:ring-clay-indigo/30"
            />
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-clay-mint/10 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/60 pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-bold rounded-2xl transition ${
              selectedCategory === cat
                ? 'bg-clay-indigo text-white'
                : 'bg-clay-bg text-ink-soft hover:bg-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All Users' : cat}
          </button>
        ))}
      </div>

      {/* User Table / Cards */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          Loading user database...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          No user accounts found under category "{selectedCategory}".
        </div>
      ) : (
        <>
          {/* ─── MOBILE VIEW: CLEAN RESPONSIVE CARDS (strictly < md) ─── */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">{u.fullName}</h3>
                    <div className="text-xs font-mono text-zinc-500">{u.username}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{u.email}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${
                      u.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md text-[11px] font-semibold flex items-center gap-1 border border-zinc-200">
                    <Shield className="w-3 h-3 text-zinc-500" /> {u.roleName}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(u)}
                      title="Edit User & Username"
                      className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => { setPasswordUser(u); setNewPassword(''); }}
                      title="Change / Reset Password"
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Key className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      title={u.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        u.isActive ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u)}
                      title="Delete Credentials"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                  <th className="p-3.5">User Details</th>
                  <th className="p-3.5">Username / Roll No</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 text-right">Credential Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-zinc-900">{u.fullName}</div>
                      <div className="text-[11px] text-zinc-500">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-zinc-800">{u.username}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-bold rounded-md inline-flex items-center gap-1">
                        <Shield className="w-3 h-3 text-zinc-500" /> {u.roleName}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(u)}
                        title="Edit User & Username"
                        className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => { setPasswordUser(u); setNewPassword(''); }}
                        title="Change / Reset Password"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        title={u.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.isActive ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="Delete Credentials"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Create Student Account Modal */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateStudent} className="clay-card p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-ink">Create New Student Account</h3>
            <p className="text-xs text-ink-soft">Provision single student credentials for your institution</p>

            {createError && (
              <div className="p-3 bg-clay-coral/10 border border-clay-coral/20 text-clay-coral text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink block">Roll Number (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="2511cs020633"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="clay-input mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Veeram Reddy Sri Krishna"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block">Email Address</label>
              <input
                type="email"
                required
                placeholder="2511cs020633@mallareddyuniversity.ac.in"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="clay-input mt-1 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink block">Department</label>
                <input
                  type="text"
                  required
                  value={studentDept}
                  onChange={(e) => setStudentDept(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block">Year of Study</label>
                <select
                  value={studentYear}
                  onChange={(e) => setStudentYear(e.target.value)}
                  className="clay-input mt-1"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Checkbox for Hostel Resident */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={isHostelResident}
                  onChange={(e) => setIsHostelResident(e.target.checked)}
                  className="rounded-2xl text-clay-indigo focus:ring-primary w-4 h-4"
                />
                <span>Is Hostel Resident?</span>
              </label>
            </div>

            {/* Optional Hostel Fields */}
            {isHostelResident && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-clay-bg/60 border border-white/60 rounded-2xl">
                <div>
                  <label className="text-xs font-semibold text-ink block">Hostel Block</label>
                  <input
                    type="text"
                    placeholder="Block-A"
                    value={studentHostel}
                    onChange={(e) => setStudentHostel(e.target.value)}
                    className="clay-input mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink block">Room Number</label>
                  <input
                    type="text"
                    placeholder="126"
                    value={studentRoom}
                    onChange={(e) => setStudentRoom(e.target.value)}
                    className="clay-input mt-1"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-ink block">Initial Password (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank to auto-generate temporary password"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                className="clay-input mt-1 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-clay-bg">
              <button
                type="button"
                onClick={() => setShowCreateStudentModal(false)}
                className="px-3 py-1.5 border border-white/50 text-xs font-bold rounded-2xl text-ink-soft hover:bg-clay-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-clay-indigo text-white text-xs font-bold rounded-2xl hover:bg-clay-indigo-deep"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User & Username Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateUserDetails} className="clay-card p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-ink">Edit Account Details & Username</h3>
            <p className="text-xs text-ink-soft">Modify credentials for <span className="font-bold text-ink">{editingUser.fullName}</span></p>

            {editError && (
              <div className="p-3 bg-clay-coral/10 border border-clay-coral/20 text-clay-coral text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-ink block">Username / Roll Number</label>
              <input
                type="text"
                required
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="clay-input mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block">Full Name</label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="clay-input mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block">Email Address</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="clay-input mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block">Assigned Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="clay-input mt-1"
              >
                <option value="Student">Student</option>
                <option value="Canteen Staff">Canteen Staff</option>
                <option value="Sports Room Staff">Sports Room Staff</option>
                <option value="Print Shop Staff">Print Shop Staff</option>
                <option value="Warden">Warden</option>
                <option value="College Admin">College Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-clay-bg">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 border border-white/50 text-xs font-bold rounded-2xl text-ink-soft hover:bg-clay-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-clay-indigo text-white text-xs font-bold rounded-2xl hover:bg-clay-indigo-deep"
              >
                Save Details & Username
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordUser && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleChangePassword} className="clay-card p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-ink">Change User Password</h3>
            <p className="text-xs text-ink-soft">Set new password for <span className="font-bold text-ink">{passwordUser.username}</span></p>

            <div>
              <label className="text-xs font-semibold text-ink block">New Password</label>
              <input
                type="password"
                required
                minLength={4}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="clay-input mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasswordUser(null)}
                className="px-3 py-1.5 border border-white/50 text-xs font-bold rounded-2xl text-ink-soft hover:bg-clay-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-clay-indigo text-white text-xs font-bold rounded-2xl hover:bg-clay-indigo-deep"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
