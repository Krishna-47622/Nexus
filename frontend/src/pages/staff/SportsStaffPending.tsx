import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Check, X } from 'lucide-react';

interface BorrowRequest {
  id: number;
  equipmentName: string;
  category: string;
  studentName: string;
  rollNumber: string;
  expectedReturnAt: string;
  createdAt: string;
}

export const SportsStaffPending: React.FC = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = () => {
    api.get('/sports/staff/pending')
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  };

  const handleProcess = async (id: number, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.patch(`/sports/staff/requests/${id}/process`, {
        action,
        remarks: remarksMap[id] || '',
      });
      fetchPending();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Processing failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-ink">Pending Sports Borrow Requests</h2>
        <p className="text-xs text-ink-soft">Approve or reject equipment checkout requests</p>
      </div>

      {loading ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft">Loading pending requests...</div>
      ) : requests.length === 0 ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft">No pending borrow requests.</div>
      ) : (
        <div className="clay-card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-clay-bg border-b border-white/60 font-bold uppercase text-ink">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Item</th>
                <th className="p-3">Expected Return</th>
                <th className="p-3">Remarks / Note</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clay-bg">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-clay-bg/60">
                  <td className="p-3 font-semibold text-ink">{r.studentName}</td>
                  <td className="p-3 font-mono">{r.rollNumber}</td>
                  <td className="p-3 font-semibold text-primary">{r.equipmentName}</td>
                  <td className="p-3">{new Date(r.expectedReturnAt).toLocaleString()}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Optional remarks..."
                      value={remarksMap[r.id] || ''}
                      onChange={(e) => setRemarksMap({ ...remarksMap, [r.id]: e.target.value })}
                      className="px-2 py-1 border border-white/50 rounded-2xl text-xs w-full"
                    />
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleProcess(r.id, 'APPROVE')}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 text-xs inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleProcess(r.id, 'REJECT')}
                      className="px-3 py-1 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 text-xs inline-flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
