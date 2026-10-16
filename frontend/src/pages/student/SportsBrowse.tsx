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
        <h2 className="text-xl font-extrabold text-ink">Sports Equipment</h2>
        <Link to="/app/sports/my-borrows" className="clay-badge-mint text-[10px] hover:shadow-clay-card transition-shadow">
          My Active Borrows →
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'clay-pill-active' : 'clay-pill-inactive'}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment List */}
      {loading ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft animate-clay-pulse">
          Loading sports inventory...
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft">
          No equipment registered in this category.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="clay-card p-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-ink">{item.name}</span>
                  <span className="clay-badge bg-clay-bg text-ink-soft text-[10px]">{item.category}</span>
                </div>
                <div className="text-xs text-ink-soft">
                  Late Fine: <span className="font-bold text-ink">₹{item.lateFineRatePerDay}/day</span>
                </div>
                <div className="text-xs font-semibold">
                  Available:{' '}
                  <span className={item.availableQty > 0 ? 'text-clay-mint font-extrabold' : 'text-clay-coral font-extrabold'}>
                    {item.availableQty} / {item.totalQty} units
                  </span>
                </div>
              </div>

              <button
                disabled={item.availableQty <= 0}
                onClick={() => navigate(`/app/sports/borrow/${item.id}`)}
                className="clay-btn text-xs px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
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
