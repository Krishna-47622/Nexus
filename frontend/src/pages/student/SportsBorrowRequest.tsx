import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  category: string;
  totalQty: number;
  availableQty: number;
  lateFineRatePerDay: number;
}

export const SportsBorrowRequest: React.FC = () => {
  const { equipmentId } = useParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/sports/equipment').then((res) => {
      const found = res.data.find((e: Equipment) => String(e.id) === equipmentId);
      if (found) setEquipment(found);
    });
  }, [equipmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/sports/borrow-request', {
        equipmentId: Number(equipmentId),
        expectedReturnAt: returnDate,
      });
      navigate('/app/sports/my-borrows');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit borrow request.');
    } finally {
      setLoading(false);
    }
  };

  if (!equipment) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading equipment details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/sports" className="p-1 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Request Equipment Borrow</h2>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">{equipment.name}</h3>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-300">
            Category: {equipment.category}
          </span>
        </div>

        {/* Fine Policy Warning */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Institutional Late Fine Policy
          </div>
          <p className="text-[11px] text-amber-700">
            Overdue returns incur a fine rate of <span className="font-bold">₹{equipment.lateFineRatePerDay.toFixed(2)} per day</span>.
            Fines must be cleared via UPI intent before borrowing subsequent items.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block">Expected Return Date & Time</label>
            <input
              type="datetime-local"
              required
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs mt-1 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading || equipment.availableQty <= 0}
            className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Submitting Request...' : 'Confirm Borrow Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
