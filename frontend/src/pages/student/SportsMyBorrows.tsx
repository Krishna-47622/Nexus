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
        <h2 className="text-xl font-extrabold text-ink">My Borrows</h2>
        <Link to="/app/sports" className="text-xs font-semibold text-clay-indigo hover:underline">
          Browse Equipment →
        </Link>
      </div>

      {/* Active Borrow Requests */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Active Borrows</h3>
        {loading ? (
          <div className="clay-card p-6 rounded-2xl text-center text-xs text-ink-soft">
            Loading active borrows...
          </div>
        ) : activeBorrows.length === 0 ? (
          <div className="clay-card p-6 rounded-2xl text-center text-xs text-ink-soft">
            No active borrowed equipment.
          </div>
        ) : (
          <div className="space-y-3">
            {activeBorrows.map((b) => (
              <div
                key={b.id}
                className={`bg-white border rounded-2xl p-4 space-y-2 ${
                  b.status === 'OVERDUE' ? 'border-red-400 bg-red-50/20' : 'border-white/60'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-ink">{b.equipmentName}</h4>
                    <span className="text-[11px] text-ink-soft">{b.category}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xl border ${
                      b.status === 'OVERDUE'
                        ? 'bg-clay-coral/10 text-clay-coral border-clay-coral/20'
                        : b.status === 'APPROVED'
                        ? 'bg-clay-mint/10 text-clay-mint border-clay-mint/20'
                        : 'bg-clay-amber/10 text-clay-amber border-clay-amber/20'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-ink-soft space-y-0.5">
                  <div>Expected Return: <span className="font-semibold text-ink">{new Date(b.expectedReturnAt).toLocaleString()}</span></div>
                  {b.remarks && <div className="text-ink-soft italic">Staff Note: {b.remarks}</div>}
                </div>

                {/* Overdue Fine Notice & UPI Pay Action */}
                {b.fineAmount > 0 && !b.finePaid && (
                  <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                    <div className="text-xs text-clay-coral font-bold">
                      Accrued Overdue Fine: ₹{b.fineAmount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handlePayFine(b.id)}
                      disabled={payingId === b.id}
                      className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-2xl hover:bg-red-700 transition flex items-center gap-1"
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
        <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Past Borrows History</h3>
        {historyBorrows.length === 0 ? (
          <div className="clay-card p-6 rounded-2xl text-center text-xs text-ink-soft">
            No borrow history records.
          </div>
        ) : (
          <div className="space-y-2">
            {historyBorrows.map((b) => (
              <div key={b.id} className="clay-card p-3 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink">{b.equipmentName}</span>
                  <p className="text-ink-soft text-[11px]">Returned: {b.returnedAt ? new Date(b.returnedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-2xl font-bold text-[10px] uppercase ${b.status === 'RETURNED' ? 'bg-clay-bg text-ink' : 'bg-red-100 text-clay-coral'}`}>
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
