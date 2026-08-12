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
        <h2 className="text-xl font-bold text-slate-900">Currently Borrowed Sports Equipment</h2>
        <p className="text-xs text-slate-500">Track active items out and record returns</p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">Loading current items...</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">No items currently out.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-700">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Item</th>
                <th className="p-3">Expected Return</th>
                <th className="p-3">Due Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{r.studentName}</td>
                  <td className="p-3 font-mono">{r.rollNumber}</td>
                  <td className="p-3 font-semibold text-primary">{r.equipmentName}</td>
                  <td className="p-3">{new Date(r.expectedReturnAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                        r.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {r.status} {r.fineAmount > 0 ? `(Fine ₹${r.fineAmount})` : ''}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleReturn(r.id)}
                      className="px-3 py-1 bg-primary text-white font-bold rounded-sm hover:bg-primary-dark text-xs inline-flex items-center gap-1"
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
