import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Check, X, FileText, ExternalLink } from 'lucide-react';

interface LeaveRequest {
  id: number;
  studentName: string;
  rollNumber: string;
  hostelBlock: string;
  roomNumber: string;
  reason: string;
  fromDate: string;
  toDate: string;
  destination: string;
  attachmentUrl: string;
  status: string;
}

interface OutpassRequest {
  id: number;
  studentName: string;
  rollNumber: string;
  hostelBlock: string;
  roomNumber: string;
  type: string;
  outTime: string;
  expectedReturnTime: string;
  destinationPurpose: string;
  status: string;
}

export const WardenApprovals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'OUTPASS'>('LEAVE');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [outpasses, setOutpasses] = useState<OutpassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = () => {
    Promise.all([
      api.get('/requests/warden/leave/pending'),
      api.get('/requests/warden/outpass/pending'),
    ])
      .then(([leaveRes, outpassRes]) => {
        setLeaves(leaveRes.data);
        setOutpasses(outpassRes.data);
      })
      .finally(() => setLoading(false));
  };

  const handleReviewLeave = async (id: number, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.patch(`/requests/warden/leave/${id}/review`, {
        action,
        remarks: remarksMap[`leave-${id}`] || '',
      });
      fetchPending();
    } catch (err) {
      alert('Review action failed.');
    }
  };

  const handleReviewOutpass = async (id: number, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.patch(`/requests/warden/outpass/${id}/review`, {
        action,
        remarks: remarksMap[`outpass-${id}`] || '',
      });
      fetchPending();
    } catch (err) {
      alert('Review action failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Warden Pending Approvals</h2>
        <p className="text-xs text-zinc-500">Review hostel leave letters and outpass permissions</p>
      </div>

      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'LEAVE' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Leave Letters ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTPASS')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'OUTPASS' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Outpass Requests ({outpasses.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          Loading pending requests...
        </div>
      ) : activeTab === 'LEAVE' ? (
        leaves.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
            No pending leave letters.
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.map((l) => (
              <div key={l.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900">{l.studentName} ({l.rollNumber})</h4>
                    <p className="text-xs text-zinc-500">Hostel: {l.hostelBlock} / Room {l.roomNumber}</p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                    {l.fromDate} to {l.toDate}
                  </span>
                </div>

                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs text-zinc-700 space-y-1.5">
                  <div><span className="font-semibold text-zinc-900">Destination:</span> {l.destination}</div>
                  <div><span className="font-semibold text-zinc-900">Reason:</span> {l.reason}</div>
                  {l.attachmentUrl && (
                    <a href={l.attachmentUrl} target="_blank" rel="noreferrer" className="text-zinc-900 font-semibold hover:underline inline-flex items-center gap-1 pt-1">
                      View Attachment <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Warden decision remarks..."
                    value={remarksMap[`leave-${l.id}`] || ''}
                    onChange={(e) => setRemarksMap({ ...remarksMap, [`leave-${l.id}`]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewLeave(l.id, 'APPROVE')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReviewLeave(l.id, 'REJECT')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : outpasses.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          No pending outpass requests.
        </div>
      ) : (
        <div className="space-y-3">
          {outpasses.map((op) => (
            <div key={op.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">{op.studentName} ({op.rollNumber})</h4>
                  <p className="text-xs text-zinc-500">Hostel: {op.hostelBlock} / Room {op.roomNumber} • Type: <span className="font-semibold text-zinc-800">{op.type}</span></p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                  Return by: {new Date(op.expectedReturnTime).toLocaleString()}
                </span>
              </div>

              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs text-zinc-700">
                <span className="font-semibold text-zinc-900">Purpose & Destination:</span> {op.destinationPurpose}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Warden decision remarks..."
                  value={remarksMap[`outpass-${op.id}`] || ''}
                  onChange={(e) => setRemarksMap({ ...remarksMap, [`outpass-${op.id}`]: e.target.value })}
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReviewOutpass(op.id, 'APPROVE')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReviewOutpass(op.id, 'REJECT')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
