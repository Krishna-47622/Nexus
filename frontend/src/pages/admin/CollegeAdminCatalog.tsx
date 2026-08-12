import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Package, Utensils, Dumbbell, Printer, Plus, CheckCircle2 } from 'lucide-react';

export const CollegeAdminCatalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CANTEEN' | 'SPORTS' | 'PRINT'>('CANTEEN');

  // Canteen state
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('50');
  const [isVeg, setIsVeg] = useState(true);

  // Sports state
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState('Indoor');
  const [totalQty, setTotalQty] = useState('10');
  const [fineRate, setFineRate] = useState('20');

  // Print state
  const [bwPerPage, setBwPerPage] = useState('2.00');
  const [colorPerPage, setColorPerPage] = useState('10.00');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/print/pricing').then((res) => {
      if (res.data) {
        setBwPerPage(String(res.data.bwPerPage));
        setColorPerPage(String(res.data.colorPerPage));
      }
    });
  }, []);

  const handleAddCanteenItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/catalog/canteen/item', {
        categoryId: 1,
        name: itemName,
        description: 'Freshly prepared item',
        price: parseFloat(itemPrice),
        isVeg,
        isAvailable: true,
      });
      setItemName('');
      setMsg('Canteen item added to menu successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Failed to add canteen item.');
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/catalog/sports/equipment', {
        name: eqName,
        category: eqCategory,
        totalQty: parseInt(totalQty),
        lateFineRatePerDay: parseFloat(fineRate),
      });
      setEqName('');
      setMsg('Sports equipment added to catalog successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Failed to add equipment.');
    }
  };

  const handleUpdatePrintPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/catalog/print/pricing', {
        bwPerPage: parseFloat(bwPerPage),
        colorPerPage: parseFloat(colorPerPage),
      });
      setMsg('Print pricing updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Failed to update print pricing.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Catalog & Pricing Management</h2>
        <p className="text-xs text-slate-500">Configure Canteen menu, Sports equipment stock, and Print per-page pricing</p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CANTEEN')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'CANTEEN' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" /> Canteen Menu
        </button>
        <button
          onClick={() => setActiveTab('SPORTS')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'SPORTS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" /> Sports Equipment Inventory
        </button>
        <button
          onClick={() => setActiveTab('PRINT')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'PRINT' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" /> Print Pricing Configuration
        </button>
      </div>

      {activeTab === 'CANTEEN' && (
        <form onSubmit={handleAddCanteenItem} className="bg-white border border-slate-200 p-4 rounded-sm space-y-4 max-w-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add New Canteen Menu Item</h3>
          <div>
            <label className="text-xs font-semibold text-slate-700 block">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Masala Dosa"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block">Dietary Type</label>
              <select
                value={isVeg ? 'veg' : 'nonveg'}
                onChange={(e) => setIsVeg(e.target.value === 'veg')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              >
                <option value="veg">Vegetarian (Veg)</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark">
            + Add Menu Item
          </button>
        </form>
      )}

      {activeTab === 'SPORTS' && (
        <form onSubmit={handleAddEquipment} className="bg-white border border-slate-200 p-4 rounded-sm space-y-4 max-w-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add New Sports Equipment</h3>
          <div>
            <label className="text-xs font-semibold text-slate-700 block">Equipment Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Football / Badminton Racket"
              value={eqName}
              onChange={(e) => setEqName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block">Category</label>
              <input
                type="text"
                required
                value={eqCategory}
                onChange={(e) => setEqCategory(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block">Total Qty</label>
              <input
                type="number"
                required
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block">Fine (₹/day)</label>
              <input
                type="number"
                required
                value={fineRate}
                onChange={(e) => setFineRate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark">
            + Add Equipment
          </button>
        </form>
      )}

      {activeTab === 'PRINT' && (
        <form onSubmit={handleUpdatePrintPricing} className="bg-white border border-slate-200 p-4 rounded-sm space-y-4 max-w-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Configure Per-Page Print Rates</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block">B&W Rate (₹/page)</label>
              <input
                type="number"
                step="0.50"
                required
                value={bwPerPage}
                onChange={(e) => setBwPerPage(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block">Color Rate (₹/page)</label>
              <input
                type="number"
                step="0.50"
                required
                value={colorPerPage}
                onChange={(e) => setColorPerPage(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark">
            Update Print Rates
          </button>
        </form>
      )}
    </div>
  );
};
