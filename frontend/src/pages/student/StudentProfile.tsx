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
    return <div className="p-8 text-center text-xs text-slate-500">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary text-white rounded-sm flex items-center justify-center font-bold text-xl">
            {profile?.fullName?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile?.fullName}</h2>
            <p className="text-xs text-slate-500 font-medium">Roll No: {profile?.rollNumber}</p>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-300 font-semibold mt-1 inline-block">
              {profile?.collegeName}
            </span>
          </div>
        </div>

        {saveMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* Locked Profile Fields */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Department (Locked)</span>
            <span className="text-xs font-semibold text-slate-800">{profile?.department || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Year / Batch (Locked)</span>
            <span className="text-xs font-semibold text-slate-800">{profile?.year || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Hostel Block (Locked)</span>
            <span className="text-xs font-semibold text-slate-800">{profile?.hostelBlock || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Room Number (Locked)</span>
            <span className="text-xs font-semibold text-slate-800">{profile?.roomNumber || 'N/A'}</span>
          </div>
        </div>

        {/* Editable Fields Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs mt-1 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block">Emergency Contact Phone</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+91 9876543211"
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs mt-1 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary text-white font-semibold text-xs rounded-sm hover:bg-primary-dark transition flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save Contact Details
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-2 bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" /> Change Security Password
          </button>

          <button
            onClick={logout}
            className="w-full py-2 bg-red-50 border border-red-200 text-red-700 font-semibold text-xs rounded-sm hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded-sm p-6 max-w-sm w-full space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-slate-900">Change Password</h3>

            {passMsg && (
              <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 text-xs rounded-sm">
                {passMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-sm hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-primary text-white font-semibold text-xs rounded-sm hover:bg-primary-dark"
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
