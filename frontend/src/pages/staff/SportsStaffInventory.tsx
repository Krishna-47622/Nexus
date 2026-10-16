import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Plus, 
  Search, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Dumbbell, 
  Package, 
  Boxes, 
  AlertCircle,
  X,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  category: string;
  totalQty: number;
  availableQty: number;
  lateFineRatePerDay: number;
  isActive: boolean;
}

export const SportsStaffInventory: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    totalQty: 5,
    availableQty: 5,
    lateFineRatePerDay: 5.0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = () => {
    setLoading(true);
    api.get('/sports/staff/equipment')
      .then((res) => {
        setEquipmentList(res.data || []);
      })
      .catch((err) => {
        showToast(err.response?.data?.message || 'Failed to load equipment list', 'error');
      })
      .finally(() => setLoading(false));
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Badminton',
      totalQty: 5,
      availableQty: 5,
      lateFineRatePerDay: 5.0,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Equipment) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category || 'General',
      totalQty: item.totalQty,
      availableQty: item.availableQty,
      lateFineRatePerDay: item.lateFineRatePerDay || 5.0,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Equipment name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // Update existing item
        await api.put(`/sports/staff/equipment/${editingItem.id}`, formData);
        showToast(`'${formData.name}' updated successfully!`);
      } else {
        // Create new item
        await api.post('/sports/staff/equipment', formData);
        showToast(`'${formData.name}' added to inventory!`);
      }
      setModalOpen(false);
      fetchEquipment();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save equipment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: Equipment) => {
    try {
      await api.patch(`/sports/staff/equipment/${item.id}/status`);
      showToast(`'${item.name}' status updated!`);
      fetchEquipment();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleQuickAdjust = async (item: Equipment, delta: number) => {
    const newAvailable = Math.max(0, Math.min(item.totalQty, item.availableQty + delta));
    if (newAvailable === item.availableQty) return;

    try {
      await api.put(`/sports/staff/equipment/${item.id}`, {
        availableQty: newAvailable,
      });
      // Update local state smoothly
      setEquipmentList(prev => prev.map(eq => eq.id === item.id ? { ...eq, availableQty: newAvailable } : eq));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to adjust quantity', 'error');
    }
  };

  // Derive categories for filter tabs
  const categories = ['ALL', ...Array.from(new Set(equipmentList.map(e => e.category || 'General').filter(Boolean)))];

  // Filtering
  const filteredList = equipmentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? item.isActive : !item.isActive);
    return matchesSearch && matchesCat && matchesStatus;
  });

  // KPI Metrics
  const totalItemsCount = equipmentList.reduce((acc, curr) => acc + curr.totalQty, 0);
  const availableCount = equipmentList.reduce((acc, curr) => acc + curr.availableQty, 0);
  const borrowedCount = Math.max(0, totalItemsCount - availableCount);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2 transition-all ${
          toastMsg.type === 'error' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-white'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-zinc-800" />
            Sports Equipment Inventory
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Manage sports inventory stock, add new gear, and modify item attributes</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gear Types</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{equipmentList.length}</p>
          <span className="text-[11px] text-zinc-500">Distinct equipment catalogued</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Units</span>
            <Boxes className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalItemsCount}</p>
          <span className="text-[11px] text-zinc-500">Across all categories</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available Now</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{availableCount}</p>
          <span className="text-[11px] text-zinc-500">Ready for student checkout</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Out on Borrow</span>
            <ArrowUpDown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{borrowedCount}</p>
          <span className="text-[11px] text-zinc-500">Currently in student possession</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gear by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table & List */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          Loading sports inventory...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          No equipment matches your search or filter criteria.
        </div>
      ) : (
        <>
          {/* ─── DESKTOP TABLE (md and above) ─── */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Equipment Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stock (Available / Total)</th>
                  <th className="px-4 py-3">Late Fine / Day</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredList.map((item) => {
                  const percentAvailable = item.totalQty > 0 ? (item.availableQty / item.totalQty) * 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-zinc-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-bold text-xs ${item.availableQty === 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
                            {item.availableQty} <span className="text-zinc-400 font-normal">/ {item.totalQty}</span>
                          </span>
                          <div className="w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                percentAvailable > 50 ? 'bg-emerald-500' : percentAvailable > 20 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${percentAvailable}%` }}
                            />
                          </div>

                          {/* Quick counter +/- */}
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleQuickAdjust(item, -1)}
                              disabled={item.availableQty <= 0}
                              className="w-5 h-5 rounded border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Decrease available stock by 1"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(item, 1)}
                              disabled={item.availableQty >= item.totalQty}
                              className="w-5 h-5 rounded border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Increase available stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-zinc-700">
                        ₹{Number(item.lateFineRatePerDay || 5).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                          }`}
                          title="Click to toggle active status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Modify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ─── MOBILE CARDS (< md) ─── */}
          <div className="md:hidden space-y-3">
            {filteredList.map((item) => (
              <div key={item.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 leading-tight">{item.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {item.category || 'General'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-medium">Available Units</span>
                    <span className="font-bold font-mono text-zinc-900 text-sm">
                      {item.availableQty} <span className="text-zinc-400 text-xs font-normal">/ {item.totalQty}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-medium">Late Fine / Day</span>
                    <span className="font-bold font-mono text-zinc-800 text-sm">₹{Number(item.lateFineRatePerDay || 5).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  {/* Quick counter +/- */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-medium">Quick Stock:</span>
                    <button
                      onClick={() => handleQuickAdjust(item, -1)}
                      disabled={item.availableQty <= 0}
                      className="w-7 h-7 rounded border border-zinc-200 bg-white flex items-center justify-center font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-xs">{item.availableQty}</span>
                    <button
                      onClick={() => handleQuickAdjust(item, 1)}
                      disabled={item.availableQty >= item.totalQty}
                      className="w-7 h-7 rounded border border-zinc-200 bg-white flex items-center justify-center font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Modify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Modify Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-zinc-700" />
                {editingItem ? 'Modify Sports Equipment' : 'Add New Sports Equipment'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yonex Badminton Racket, Cosco Football..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Sport / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Badminton, Cricket, Football, Basketball, TT..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-xs"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Badminton', 'Cricket', 'Football', 'Basketball', 'Table Tennis', 'Volleyball', 'General'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: s })}
                      className="px-2 py-0.5 text-[10px] bg-zinc-100 text-zinc-600 rounded hover:bg-zinc-200 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalQty}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 1;
                      setFormData({
                        ...formData,
                        totalQty: total,
                        availableQty: Math.min(formData.availableQty, total),
                      });
                    }}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Available Units *</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalQty}
                    required
                    value={formData.availableQty}
                    onChange={(e) => setFormData({ ...formData, availableQty: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Late Fine Rate Per Day (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.lateFineRatePerDay}
                  onChange={(e) => setFormData({ ...formData, lateFineRatePerDay: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-zinc-700 font-medium cursor-pointer">
                  Available for student borrow requests (Active in catalog)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SportsStaffInventory;
