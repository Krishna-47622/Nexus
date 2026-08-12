import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Dumbbell, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';

interface BorrowRequest {
  id: number;
  equipmentId: number;
  equipmentName: string;
  category: string;
  expectedReturnAt: string;
  status: string;
  approvedAt: string | null;
  returnedAt: string | null;
  fineAmount: number;
  finePaid: boolean;
  upiIntentUrl: string | null;
  remarks: string | null;
  createdAt: string;
}

export const SportsMyBorrows: React.FC = () => {
  const [borrows, setBorrows] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBorrows();
  }, []);

  const fetchBorrows = () => {
    api.get('/sports/my-borrows')
      .then((res) => setBorrows(res.data))
      .finally(() => setLoading(false));
  };

  const handlePayFine = async (borrowId: number) => {
    setPayingId(borrowId);
    try {
      const res = await api.post(`/sports/my-borrows/${borrowId}/pay-fine`);
      if (res.data.upiIntentUrl) {
        window.location.href = res.data.upiIntentUrl;
      }
      fetchBorrows();
    } catch (err) {
      alert('Fine payment failed.');
    } finally {
      setPayingId(null);
    }
  };

  const activeBorrows = borrows.filter((b) => ['PENDING', 'APPROVED', 'OVERDUE'].includes(b.status.toUpperCase()));
  const historyBorrows = borrows.filter((b) => ['RETURNED', 'REJECTED'].includes(b.status.toUpperCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">My Borrows</h2>
        <Link to="/app/sports" className="text-xs font-semibold text-primary hover:underline">
          Browse Equipment →
        </Link>
      </div>

      {/* Active Borrow Requests */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Borrows</h3>
        {loading ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            Loading active borrows...
          </div>
        ) : activeBorrows.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            No active borrowed equipment.
          </div>
        ) : (
          <div className="space-y-3">
            {activeBorrows.map((b) => (
              <div
                key={b.id}
                className={`bg-white border rounded-sm p-4 space-y-2 ${
                  b.status === 'OVERDUE' ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{b.equipmentName}</h4>
                    <span className="text-[11px] text-slate-500">{b.category}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                      b.status === 'OVERDUE'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : b.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>Expected Return: <span className="font-semibold text-slate-900">{new Date(b.expectedReturnAt).toLocaleString()}</span></div>
                  {b.remarks && <div className="text-slate-500 italic">Staff Note: {b.remarks}</div>}
                </div>

                {/* Overdue Fine Notice & UPI Pay Action */}
                {b.fineAmount > 0 && !b.finePaid && (
                  <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                    <div className="text-xs text-red-700 font-bold">
                      Accrued Overdue Fine: ₹{b.fineAmount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handlePayFine(b.id)}
                      disabled={payingId === b.id}
                      className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-sm hover:bg-red-700 transition flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Pay Fine via UPI
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Borrow History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Past Borrows History</h3>
        {historyBorrows.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            No borrow history records.
          </div>
        ) : (
          <div className="space-y-2">
            {historyBorrows.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 p-3 rounded-sm flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{b.equipmentName}</span>
                  <p className="text-slate-500 text-[11px]">Returned: {b.returnedAt ? new Date(b.returnedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase ${b.status === 'RETURNED' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
