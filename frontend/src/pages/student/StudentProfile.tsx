import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { User, Lock, Phone, AlertCircle, CheckCircle2, Save, LogOut } from 'lucide-react';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  rollNumber: string;
  department: string;
  year: string;
  hostelBlock: string;
  roomNumber: string;
  emergencyContact: string;
  collegeName: string;
}

export const StudentProfile: React.FC = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');

  // Password Change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    api.get('/student/profile')
      .then((res) => {
        setProfile(res.data);
        setPhone(res.data.phone || '');
        setEmergencyContact(res.data.emergencyContact || '');
      })
      .finally(() => setLoading(false));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg('');
    try {
      await api.patch('/student/profile', {
        phone,
        emergencyContact,
      });
      setSaveMsg('Profile contact info saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    try {
      await api.post('/auth/set-password', {
        oldPassword,
        newPassword,
      });
      setPassMsg('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: any) {
      setPassMsg(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-ink-soft">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="clay-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-clay-indigo text-white rounded-2xl flex items-center justify-center font-extrabold text-xl">
            {profile?.fullName?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">{profile?.fullName}</h2>
            <p className="text-xs text-ink-soft font-medium">Roll No: {profile?.rollNumber}</p>
            <span className="text-[11px] bg-clay-bg text-ink px-2 py-0.5 rounded-2xl border border-white/50 font-semibold mt-1 inline-block">
              {profile?.collegeName}
            </span>
          </div>
        </div>

        {saveMsg && (
          <div className="p-3 bg-clay-mint/10 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* Locked Profile Fields */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-clay-bg/60 border border-white/60 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-ink-soft uppercase block">Department (Locked)</span>
            <span className="text-xs font-semibold text-ink">{profile?.department || 'N/A'}</span>
          </div>
          <div className="bg-clay-bg/60 border border-white/60 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-ink-soft uppercase block">Year / Batch (Locked)</span>
            <span className="text-xs font-semibold text-ink">{profile?.year || 'N/A'}</span>
          </div>
          <div className="bg-clay-bg/60 border border-white/60 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-ink-soft uppercase block">Hostel Block (Locked)</span>
            <span className="text-xs font-semibold text-ink">{profile?.hostelBlock || 'N/A'}</span>
          </div>
          <div className="bg-clay-bg/60 border border-white/60 p-2.5 rounded-2xl">
            <span className="text-[10px] font-bold text-ink-soft uppercase block">Room Number (Locked)</span>
            <span className="text-xs font-semibold text-ink">{profile?.roomNumber || 'N/A'}</span>
          </div>
        </div>

        {/* Editable Fields Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-white/60">
          <div>
            <label className="text-xs font-bold text-ink block">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 border border-white/50 rounded-2xl text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-clay-indigo/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink block">Emergency Contact Phone</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+91 9876543211"
              className="w-full px-3 py-2 border border-white/50 rounded-2xl text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-clay-indigo/30"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 clay-btn text-xs flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save Contact Details
          </button>
        </form>

        <div className="pt-4 border-t border-white/60 flex flex-col gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-2 clay-card text-ink font-semibold text-xs rounded-2xl hover:bg-clay-bg/60 transition flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" /> Change Security Password
          </button>

          <button
            onClick={logout}
            className="w-full py-2 bg-clay-coral/10 border border-clay-coral/20 text-clay-coral font-semibold text-xs rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="clay-card rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-clay-lg">
            <h3 className="text-base font-bold text-ink">Change Password</h3>

            {passMsg && (
              <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 text-xs rounded-2xl">
                {passMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink block">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="clay-input mt-1 focus:outline-none focus:ring-2 focus:ring-clay-indigo/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="clay-input mt-1 focus:outline-none focus:ring-2 focus:ring-clay-indigo/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-1.5 bg-clay-bg text-ink font-semibold text-xs rounded-2xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-clay-indigo text-white font-semibold text-xs rounded-2xl hover:bg-clay-indigo-deep"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
