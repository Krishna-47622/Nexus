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
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          Loading pending requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          No pending borrow requests.
        </div>
      ) : (
        <>
          {/* ─── MOBILE VIEW: CLEAN RESPONSIVE CARDS (strictly < md) ─── */}
          <div className="md:hidden space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">{r.studentName}</h3>
                    <span className="text-xs font-mono text-zinc-500">{r.rollNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[11px] font-semibold">
                    {r.equipmentName}
                  </span>
                </div>

                <div className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 space-y-1">
                  <div>
                    <span className="text-zinc-400 font-medium">Expected Return: </span>
                    <span className="font-semibold text-zinc-800">{new Date(r.expectedReturnAt).toLocaleString()}</span>
                  </div>
                  {r.category && (
                    <div>
                      <span className="text-zinc-400 font-medium">Category: </span>
                      <span className="text-zinc-700">{r.category}</span>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Optional remarks..."
                    value={remarksMap[r.id] || ''}
                    onChange={(e) => setRemarksMap({ ...remarksMap, [r.id]: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleProcess(r.id, 'APPROVE')}
                    className="flex-1 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleProcess(r.id, 'REJECT')}
                    className="flex-1 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ─── DESKTOP VIEW: CLEAN TABLE (md and above) ─── */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-600 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Expected Return</th>
                  <th className="p-3.5">Remarks / Note</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-3.5 font-semibold text-zinc-900">{r.studentName}</td>
                    <td className="p-3.5 font-mono text-zinc-600">{r.rollNumber}</td>
                    <td className="p-3.5 font-semibold text-zinc-900">{r.equipmentName}</td>
                    <td className="p-3.5 text-zinc-600">{new Date(r.expectedReturnAt).toLocaleString()}</td>
                    <td className="p-3.5">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={remarksMap[r.id] || ''}
                        onChange={(e) => setRemarksMap({ ...remarksMap, [r.id]: e.target.value })}
                        className="px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs w-full focus:outline-none focus:border-zinc-900"
                      />
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleProcess(r.id, 'APPROVE')}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 text-xs inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleProcess(r.id, 'REJECT')}
                        className="px-3 py-1.5 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 text-xs inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
