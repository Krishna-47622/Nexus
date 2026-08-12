import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

export const OutpassNewRequest: React.FC = () => {
  const [type, setType] = useState<'LOCAL' | 'NON_LOCAL'>('LOCAL');
  const [outTime, setOutTime] = useState('');
  const [expectedReturnTime, setExpectedReturnTime] = useState('');
  const [destinationPurpose, setDestinationPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/requests/outpass', {
        type,
        outTime,
        expectedReturnTime,
        destinationPurpose,
      });
      navigate('/app/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit outpass request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/requests" className="p-1 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Request Hostel Outpass</h2>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-sm p-4 space-y-4">
        {/* Type Toggle */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">Outpass Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('LOCAL')}
              className={`py-2 px-3 text-xs font-bold rounded-sm border transition ${
                type === 'LOCAL'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Local Outpass (Same Day)
            </button>
            <button
              type="button"
              onClick={() => setType('NON_LOCAL')}
              className={`py-2 px-3 text-xs font-bold rounded-sm border transition ${
                type === 'NON_LOCAL'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Non-Local Outpass
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block">Expected Out Time</label>
            <input
              type="datetime-local"
              required
              value={outTime}
              onChange={(e) => setOutTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block">Expected Return Time</label>
            <input
              type="datetime-local"
              required
              value={expectedReturnTime}
              onChange={(e) => setExpectedReturnTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block">Destination & Purpose</label>
          <input
            type="text"
            required
            placeholder="e.g. City Market / Medical Emergency / Coaching"
            value={destinationPurpose}
            onChange={(e) => setDestinationPurpose(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Submit Outpass Request to Warden'}
        </button>
      </form>
    </div>
  );
};
