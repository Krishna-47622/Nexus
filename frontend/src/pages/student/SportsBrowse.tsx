import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Dumbbell, Search, ArrowRight, CheckCircle2, AlertCircle, Filter } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/sports/equipment')
      .then((res) => setEquipment(res.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(equipment.map((e) => e.category)))];

  const filteredEquipment = equipment.filter((e) => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = !onlyAvailable || e.availableQty > 0;
    return matchesCategory && matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Sports Equipment Room
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Borrow indoor & outdoor campus sports gear with digital return tracking
          </p>
        </div>
        <Link
          to="/app/sports/my-borrows"
          className="clay-badge-mint text-xs px-3 py-1.5 self-start sm:self-auto hover-lift font-semibold"
        >
          My Active Borrows →
        </Link>
      </div>

      {/* Search & Availability Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sports gear (e.g. Badminton, Football, Table Tennis)..."
            className="clay-input pl-9 text-xs"
          />
        </div>
        <button
          onClick={() => setOnlyAvailable((prev) => !prev)}
          className={`clay-pill flex items-center justify-center gap-1.5 text-xs transition-colors ${
            onlyAvailable ? 'clay-pill-active' : 'clay-pill-inactive'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Available In Stock ({equipment.filter((e) => e.availableQty > 0).length})</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
        {categories.map((cat) => {
          const count = cat === 'ALL' ? equipment.length : equipment.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'clay-pill-active' : 'clay-pill-inactive'}
            >
              <span>{cat}</span>
              <span className="ml-1 opacity-70 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Equipment List */}
      {loading ? (
        <div className="clay-card p-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 animate-spin mx-auto mb-3" />
          Checking sports equipment inventory...
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="clay-card p-10 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
          <Dumbbell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-1" />
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">No equipment matches your filters</p>
          <p className="text-[11px]">Try clearing your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredEquipment.map((item, index) => {
            const isAvailable = item.availableQty > 0;
            return (
              <div
                key={item.id}
                className={`clay-card p-4 sm:p-5 flex flex-col justify-between gap-4 hover-lift ${
                  index < 4 ? `stagger-${index + 1}` : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 inline-block mt-1">
                        {item.category}
                      </span>
                    </div>
                    <span
                      className={`clay-badge text-[11px] font-semibold ${
                        isAvailable ? 'clay-badge-mint' : 'clay-badge-coral'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> {item.availableQty} / {item.totalQty} Available
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" /> All Checked Out
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                    <span>
                      Late Fine: <span className="font-bold text-zinc-800 dark:text-zinc-200">₹{item.lateFineRatePerDay}/day</span>
                    </span>
                    <span>•</span>
                    <span>Standard Borrow: 24h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] text-zinc-400">
                    {isAvailable ? 'Ready for immediate pickup' : 'Waiting for student returns'}
                  </span>
                  <button
                    disabled={!isAvailable}
                    onClick={() => navigate(`/app/sports/borrow/${item.id}`)}
                    className="clay-btn text-xs px-3.5 py-2 hover-lift active-press disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Borrow Gear <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
