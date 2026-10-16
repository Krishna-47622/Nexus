import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { FileText, ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';

interface Profile {
  rollNumber: string;
  department: string;
  hostelBlock: string;
  roomNumber: string;
}

export const LeaveNewRequest: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [destination, setDestination] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/student/profile').then((res) => setProfile(res.data));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachmentUrl(`https://storage.supabase.co/campus-utility/leave-attachments/${Date.now()}_${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/requests/leave', {
        reason,
        fromDate,
        toDate,
        destination,
        attachmentUrl,
      });
      navigate('/app/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave letter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/requests" className="p-1 text-ink-soft hover:text-ink">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-extrabold text-ink">Submit Hostel Leave Letter</h2>
      </div>

      {error && (
        <div className="p-3 bg-clay-coral/10 border border-clay-coral/20 text-clay-coral text-xs rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="clay-card p-4 space-y-4">
        {/* Pre-filled Autofill Banner */}
        <div className="bg-clay-bg/60 border border-white/60 p-3 rounded-2xl text-xs space-y-1">
          <span className="font-bold text-ink uppercase tracking-wider block">Autofilled Student Identity</span>
          <div className="text-ink-soft">
            Roll: <span className="font-semibold text-ink">{profile?.rollNumber}</span> • Hostel:{' '}
            <span className="font-semibold text-ink">{profile?.hostelBlock} / Room {profile?.roomNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-ink block">Leave From Date</label>
            <input
              type="date"
              required
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="clay-input mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink block">Leave To Date</label>
            <input
              type="date"
              required
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="clay-input mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-ink block">Destination Address / Home Location</label>
          <input
            type="text"
            required
            placeholder="e.g. H.No 12-4, MG Road, Hyderabad"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="clay-input mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-ink block">Detailed Leave Reason</label>
          <textarea
            rows={3}
            required
            placeholder="Specify reason for leave..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="clay-input mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-ink block">Supporting Document / Letter (Optional)</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="clay-input mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 clay-btn text-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Submit Leave Letter to Warden'}
        </button>
      </form>
    </div>
  );
};
