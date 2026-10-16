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
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          Loading current items...
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          No items currently out.
        </div>
      ) : (
        <>
          {/* ─── MOBILE VIEW: CLEAN RESPONSIVE CARDS (strictly < md) ─── */}
          <div className="md:hidden space-y-3">
            {list.map((r) => (
              <div key={r.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">{r.studentName}</h3>
                    <span className="text-xs font-mono text-zinc-500">{r.rollNumber}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      r.status === 'OVERDUE'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {r.status} {r.fineAmount > 0 ? `(Fine ₹${r.fineAmount})` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                  <span className="font-semibold text-zinc-900">{r.equipmentName}</span>
                  <span className="text-[11px] text-zinc-500">
                    Due: {new Date(r.expectedReturnAt).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleReturn(r.id)}
                  className="w-full py-2 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
                </button>
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
                  <th className="p-3.5">Due Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {list.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-3.5 font-semibold text-zinc-900">{r.studentName}</td>
                    <td className="p-3.5 font-mono text-zinc-600">{r.rollNumber}</td>
                    <td className="p-3.5 font-semibold text-zinc-900">{r.equipmentName}</td>
                    <td className="p-3.5 text-zinc-600">{new Date(r.expectedReturnAt).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          r.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {r.status} {r.fineAmount > 0 ? `(Fine ₹${r.fineAmount})` : ''}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleReturn(r.id)}
                        className="px-3 py-1.5 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 text-xs inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
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
