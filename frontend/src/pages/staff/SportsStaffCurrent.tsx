import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface BorrowRequest {
  id: number;
  equipmentName: string;
  category: string;
  studentName: string;
  rollNumber: string;
  expectedReturnAt: string;
  status: string;
  fineAmount: number;
  finePaid: boolean;
}

export const SportsStaffCurrent: React.FC = () => {
  const [list, setList] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchCurrent = () => {
    api.get('/sports/staff/current')
      .then((res) => setList(res.data))
      .finally(() => setLoading(false));
  };

  const handleReturn = async (id: number) => {
    try {
      await api.patch(`/sports/staff/requests/${id}/return`);
      fetchCurrent();
    } catch (err) {
      alert('Return action failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-ink">Currently Borrowed Sports Equipment</h2>
        <p className="text-xs text-ink-soft">Track active items out and record returns</p>
      </div>

      {loading ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft">Loading current items...</div>
      ) : list.length === 0 ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft">No items currently out.</div>
      ) : (
        <div className="clay-card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-clay-bg border-b border-white/60 font-bold uppercase text-ink">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Item</th>
                <th className="p-3">Expected Return</th>
                <th className="p-3">Due Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clay-bg">
              {list.map((r) => (
                <tr key={r.id} className="hover:bg-clay-bg/60">
                  <td className="p-3 font-semibold text-ink">{r.studentName}</td>
                  <td className="p-3 font-mono">{r.rollNumber}</td>
                  <td className="p-3 font-semibold text-primary">{r.equipmentName}</td>
                  <td className="p-3">{new Date(r.expectedReturnAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xl border ${
                        r.status === 'OVERDUE'
                          ? 'bg-clay-coral/10 text-clay-coral border-clay-coral/20'
                          : 'bg-clay-mint/10 text-clay-mint border-clay-mint/20'
                      }`}
                    >
                      {r.status} {r.fineAmount > 0 ? `(Fine ₹${r.fineAmount})` : ''}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleReturn(r.id)}
                      className="px-3 py-1 bg-clay-indigo text-white font-bold rounded-2xl hover:bg-clay-indigo-deep text-xs inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
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
