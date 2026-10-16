import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Plus, 
  Search, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Utensils, 
  Store, 
  Layers, 
  AlertCircle,
  X,
  Tag,
  DollarSign,
  Coffee,
  Check
} from 'lucide-react';

interface MenuItem {
  id: number;
  categoryId?: number;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  sellingPrice?: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  vendorName?: string;
}

interface Category {
  id: number;
  name: string;
}

export const CanteenStaffMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter state
  const [selectedFranchise, setSelectedFranchise] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 50.0,
    categoryName: 'Main Menu',
    vendorName: 'Burger Haven',
    isVeg: true,
    isAvailable: true,
    imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const standardFranchises = [
    'Burger Haven',
    'DL Kitchen',
    'SHIVAN FOODS',
    'Brown Bear',
    'MR Food Court'
  ];

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = () => {
    setLoading(true);
    api.get('/canteen/staff/menu')
      .then((res) => setMenuItems(res.data || []))
      .catch((err) => showToast(err.response?.data?.message || 'Failed to load menu items', 'error'))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    api.get('/canteen/categories')
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error('Failed to load categories', err));
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 50.0,
      categoryName: categories.length > 0 ? categories[0].name : 'Main Menu',
      vendorName: selectedFranchise !== 'ALL' ? selectedFranchise : 'Burger Haven',
      isVeg: true,
      isAvailable: true,
      imageUrl: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryName: item.categoryName || 'Main Menu',
      vendorName: item.vendorName || 'MR Food Court',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Item name is required', 'error');
      return;
    }
    if (formData.price <= 0) {
      showToast('Price must be greater than zero', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/canteen/staff/menu/${editingItem.id}`, formData);
        showToast(`'${formData.name}' updated successfully!`);
      } else {
        await api.post('/canteen/staff/menu', formData);
        showToast(`'${formData.name}' added to menu!`);
      }
      setModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save menu item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await api.patch(`/canteen/staff/menu/${item.id}/availability`);
      showToast(`'${item.name}' marked ${!item.isAvailable ? 'In Stock' : 'Out of Stock'}`);
      // Optimistic update
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: !m.isAvailable } : m));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to toggle availability', 'error');
    }
  };

  // Derive unique franchises for filter
  const allFranchises = ['ALL', ...Array.from(new Set(menuItems.map(m => m.vendorName || 'MR Food Court').filter(Boolean)))];

  // Filtering
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.vendorName && item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFranchise = selectedFranchise === 'ALL' || (item.vendorName && item.vendorName.toLowerCase() === selectedFranchise.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || (item.categoryName && item.categoryName.toLowerCase() === selectedCategory.toLowerCase());
    const matchesAvailability = availabilityFilter === 'ALL' || 
                                (availabilityFilter === 'IN_STOCK' ? item.isAvailable : !item.isAvailable);
    return matchesSearch && matchesFranchise && matchesCategory && matchesAvailability;
  });

  // Metrics
  const totalItems = menuItems.length;
  const inStockCount = menuItems.filter(m => m.isAvailable).length;
  const outOfStockCount = totalItems - inStockCount;
  const vegCount = menuItems.filter(m => m.isVeg).length;

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

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-zinc-800" />
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">Canteen Menu Management</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Modify dish pricing, manage food item availability, and configure franchise counters
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Menu Items</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalItems}</p>
          <span className="text-[11px] text-zinc-500">Across all Food Court outlets</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Stock (Live)</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{inStockCount}</p>
          <span className="text-[11px] text-zinc-500">Orderable on student app</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{outOfStockCount}</p>
          <span className="text-[11px] text-zinc-500">Disabled until restocked</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Franchises</span>
            <Store className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{allFranchises.length - 1}</p>
          <span className="text-[11px] text-zinc-500">Live vendor food counters</span>
        </div>
      </div>

      {/* Filter and Franchise Switcher Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3.5 sm:p-4 space-y-3.5 shadow-xs">
        {/* Franchise Filter Tabs */}
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Filter by Franchise / Food Outlet
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {allFranchises.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFranchise(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedFranchise === f
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                <Store className="w-3 h-3 opacity-70" />
                <span>{f === 'ALL' ? 'All Franchises' : f}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Stock Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1 border-t border-zinc-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes by name, description, or franchise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="ALL">All Availability</option>
              <option value="IN_STOCK">In Stock Only</option>
              <option value="OUT_OF_STOCK">Out of Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Table & List */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500 shadow-xs">
          Loading canteen menu...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500 shadow-xs">
          No menu items found for the selected franchise and filters.
        </div>
      ) : (
        <>
          {/* ─── DESKTOP TABLE (md and above) ─── */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Dish / Item</th>
                  <th className="px-4 py-3">Franchise Outlet</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Diet</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                            <Utensils className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-zinc-900 leading-tight">{item.name}</p>
                          {item.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-xs mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Store className="w-3 h-3" />
                        {item.vendorName || 'MR Food Court'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-zinc-600 font-medium text-xs">
                        {item.categoryName || 'Main Menu'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.isVeg 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {item.isVeg ? 'VEG' : 'NON-VEG'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                      ₹{Number(item.price).toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
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
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── MOBILE CARDS (< md) ─── */}
          <div className="md:hidden space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 leading-tight">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.vendorName || 'MR Food Court'}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          item.isVeg ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                        }`}>
                          {item.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-zinc-900 text-sm">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                    <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                  </button>

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
          <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-zinc-700" />
                {editingItem ? 'Modify Menu Item' : 'Add New Menu Item'}
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
                <label className="block text-zinc-700 font-semibold mb-1">Item / Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa, Chicken Dum Biryani, Cold Coffee..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-xs"
                />
              </div>

              {/* Franchise / Vendor Name */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Franchise / Food Outlet *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Burger Haven, DL Kitchen, SHIVAN FOODS, Brown Bear..."
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {standardFranchises.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormData({ ...formData, vendorName: f })}
                      className="px-2 py-0.5 text-[10px] bg-zinc-100 text-zinc-600 rounded hover:bg-zinc-200 cursor-pointer font-medium"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Menu, Breakfast, Beverages..."
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the item or ingredients..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVegCheckbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isVegCheckbox" className="text-zinc-700 font-semibold cursor-pointer">
                    Pure Vegetarian Dish
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAvailableCheckbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isAvailableCheckbox" className="text-zinc-700 font-semibold cursor-pointer">
                    Available in Kitchen (In Stock)
                  </label>
                </div>
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
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CanteenStaffMenu;
