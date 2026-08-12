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
        <h2 className="text-xl font-bold text-slate-900">Warden Pending Approvals</h2>
        <p className="text-xs text-slate-500">Review hostel leave letters and outpass permissions</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'LEAVE' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Leave Letters ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTPASS')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'OUTPASS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Outpass Requests ({outpasses.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">Loading pending requests...</div>
      ) : activeTab === 'LEAVE' ? (
        leaves.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">No pending leave letters.</div>
        ) : (
          <div className="space-y-3">
            {leaves.map((l) => (
              <div key={l.id} className="bg-white border border-slate-200 p-4 rounded-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{l.studentName} ({l.rollNumber})</h4>
                    <p className="text-xs text-slate-500">Hostel: {l.hostelBlock} / Room {l.roomNumber}</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-sm">
                    {l.fromDate} to {l.toDate}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm text-xs text-slate-700 space-y-1">
                  <div><span className="font-bold">Destination:</span> {l.destination}</div>
                  <div><span className="font-bold">Reason:</span> {l.reason}</div>
                  {l.attachmentUrl && (
                    <a href={l.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                      View Attachment <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="text"
                    placeholder="Warden decision remarks..."
                    value={remarksMap[`leave-${l.id}`] || ''}
                    onChange={(e) => setRemarksMap({ ...remarksMap, [`leave-${l.id}`]: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-sm text-xs"
                  />
                  <button
                    onClick={() => handleReviewLeave(l.id, 'APPROVE')}
                    className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-sm hover:bg-emerald-700 text-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReviewLeave(l.id, 'REJECT')}
                    className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-sm hover:bg-red-700 text-xs flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : outpasses.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">No pending outpass requests.</div>
      ) : (
        <div className="space-y-3">
          {outpasses.map((op) => (
            <div key={op.id} className="bg-white border border-slate-200 p-4 rounded-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{op.studentName} ({op.rollNumber})</h4>
                  <p className="text-xs text-slate-500">Hostel: {op.hostelBlock} / Room {op.roomNumber} • Type: <span className="font-semibold text-slate-800">{op.type}</span></p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-sm">
                  Return by: {new Date(op.expectedReturnTime).toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-sm text-xs text-slate-700">
                <span className="font-bold">Purpose & Destination:</span> {op.destinationPurpose}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="text"
                  placeholder="Warden decision remarks..."
                  value={remarksMap[`outpass-${op.id}`] || ''}
                  onChange={(e) => setRemarksMap({ ...remarksMap, [`outpass-${op.id}`]: e.target.value })}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-sm text-xs"
                />
                <button
                  onClick={() => handleReviewOutpass(op.id, 'APPROVE')}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-sm hover:bg-emerald-700 text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleReviewOutpass(op.id, 'REJECT')}
                  className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-sm hover:bg-red-700 text-xs flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
