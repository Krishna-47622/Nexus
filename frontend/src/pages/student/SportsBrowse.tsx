import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Dumbbell, ShieldAlert, ArrowRight } from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  category: string;
  totalQty: number;
  availableQty: number;
  lateFineRatePerDay: number;
  isActive: boolean;
}

export const SportsBrowse: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/sports/equipment')
      .then((res) => setEquipment(res.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(equipment.map((e) => e.category)))];

  const filteredEquipment = equipment.filter((e) => {
    return selectedCategory === 'ALL' || e.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Sports Equipment</h2>
        <Link to="/app/sports/my-borrows" className="text-xs font-semibold text-primary hover:underline">
          My Active Borrows →
        </Link>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-sm whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment List */}
      {loading ? (
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
          Loading sports inventory...
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
          No equipment registered in this category.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{item.name}</span>
                  <span className="text-[10px] bg-slate-100 border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded-sm">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Late Fine: <span className="font-semibold text-slate-800">₹{item.lateFineRatePerDay}/day</span>
                </div>
                <div className="text-xs font-semibold">
                  Available:{' '}
                  <span className={item.availableQty > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                    {item.availableQty} / {item.totalQty} units
                  </span>
                </div>
              </div>

              <button
                disabled={item.availableQty <= 0}
                onClick={() => navigate(`/app/sports/borrow/${item.id}`)}
                className="px-3 py-2 bg-primary text-white font-semibold text-xs rounded-sm hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Borrow <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
