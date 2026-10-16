import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Package, Utensils, Dumbbell, Printer, Plus, CheckCircle2, BookOpen, Zap } from 'lucide-react';

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

  // Print state — all pricing fields
  const [bwPerPage, setBwPerPage] = useState('2.00');
  const [colorPerPage, setColorPerPage] = useState('10.00');
  const [a4Multiplier, setA4Multiplier] = useState('1.00');
  const [a3Multiplier, setA3Multiplier] = useState('2.00');
  const [letterMultiplier, setLetterMultiplier] = useState('1.00');
  const [doubleSidedDiscountPercent, setDoubleSidedDiscountPercent] = useState('10.00');
  const [bindingCharge, setBindingCharge] = useState('30.00');
  const [urgentSurchargePercent, setUrgentSurchargePercent] = useState('25.00');
  const [printerShopName, setPrinterShopName] = useState('Campus Reprographics & Digital Print Center');
  const [printerContactPerson, setPrinterContactPerson] = useState('Ramesh Kumar (Print Operator)');
  const [printerPhone, setPrinterPhone] = useState('+91 98490 12345');
  const [printerWhatsapp, setPrinterWhatsapp] = useState('919849012345');
  const [printerShopLocation, setPrinterShopLocation] = useState('Engineering Block 2, Ground Floor (Adjacent to MR Food Court)');
  const [printerUpiId, setPrinterUpiId] = useState('printshop@mallareddyuniversity.ac.in');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/print/pricing').then((res) => {
      if (res.data) {
        setBwPerPage(String(res.data.bwPerPage ?? '2.00'));
        setColorPerPage(String(res.data.colorPerPage ?? '10.00'));
        setA4Multiplier(String(res.data.a4Multiplier ?? '1.00'));
        setA3Multiplier(String(res.data.a3Multiplier ?? '2.00'));
        setLetterMultiplier(String(res.data.letterMultiplier ?? '1.00'));
        setDoubleSidedDiscountPercent(String(res.data.doubleSidedDiscountPercent ?? '10.00'));
        setBindingCharge(String(res.data.bindingCharge ?? '30.00'));
        setUrgentSurchargePercent(String(res.data.urgentSurchargePercent ?? '25.00'));
        if (res.data.printerShopName) setPrinterShopName(res.data.printerShopName);
        if (res.data.printerContactPerson) setPrinterContactPerson(res.data.printerContactPerson);
        if (res.data.printerPhone) setPrinterPhone(res.data.printerPhone);
        if (res.data.printerWhatsapp) setPrinterWhatsapp(res.data.printerWhatsapp);
        if (res.data.printerShopLocation) setPrinterShopLocation(res.data.printerShopLocation);
        if (res.data.printerUpiId) setPrinterUpiId(res.data.printerUpiId);
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
        a4Multiplier: parseFloat(a4Multiplier),
        a3Multiplier: parseFloat(a3Multiplier),
        letterMultiplier: parseFloat(letterMultiplier),
        doubleSidedDiscountPercent: parseFloat(doubleSidedDiscountPercent),
        bindingCharge: parseFloat(bindingCharge),
        urgentSurchargePercent: parseFloat(urgentSurchargePercent),
        printerShopName,
        printerContactPerson,
        printerPhone,
        printerWhatsapp,
        printerShopLocation,
        printerUpiId,
      });
      setMsg('Print pricing and shop operator contact details updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Failed to update print pricing.');
    }
  };

  // Live example calculation
  const bw = parseFloat(bwPerPage) || 0;
  const color = parseFloat(colorPerPage) || 0;
  const a4m = parseFloat(a4Multiplier) || 1;
  const a3m = parseFloat(a3Multiplier) || 1;
  const dblDisc = parseFloat(doubleSidedDiscountPercent) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink">Catalog & Pricing Management</h2>
        <p className="text-xs text-ink-soft">Configure Canteen menu, Sports equipment stock, and Print per-page pricing</p>
      </div>

      {msg && (
        <div className="p-3 bg-clay-mint/10 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/60">
        <button
          onClick={() => setActiveTab('CANTEEN')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'CANTEEN' ? 'border-clay-indigo text-clay-indigo' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          <Utensils className="w-4 h-4" /> Canteen Menu
        </button>
        <button
          onClick={() => setActiveTab('SPORTS')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'SPORTS' ? 'border-clay-indigo text-clay-indigo' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          <Dumbbell className="w-4 h-4" /> Sports Equipment Inventory
        </button>
        <button
          onClick={() => setActiveTab('PRINT')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'PRINT' ? 'border-clay-indigo text-clay-indigo' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          <Printer className="w-4 h-4" /> Print Pricing Configuration
        </button>
      </div>

      {activeTab === 'CANTEEN' && (
        <form onSubmit={handleAddCanteenItem} className="clay-card p-4 rounded-2xl space-y-4 max-w-md">
          <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Add New Canteen Menu Item</h3>
          <div>
            <label className="text-xs font-semibold text-ink block">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Masala Dosa"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="clay-input mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink block">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="clay-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink block">Dietary Type</label>
              <select
                value={isVeg ? 'veg' : 'nonveg'}
                onChange={(e) => setIsVeg(e.target.value === 'veg')}
                className="clay-input mt-1"
              >
                <option value="veg">Vegetarian (Veg)</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-clay-indigo text-white font-bold text-xs rounded-2xl hover:bg-clay-indigo-deep">
            + Add Menu Item
          </button>
        </form>
      )}

      {activeTab === 'SPORTS' && (
        <form onSubmit={handleAddEquipment} className="clay-card p-4 rounded-2xl space-y-4 max-w-md">
          <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Add New Sports Equipment</h3>
          <div>
            <label className="text-xs font-semibold text-ink block">Equipment Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Football / Badminton Racket"
              value={eqName}
              onChange={(e) => setEqName(e.target.value)}
              className="clay-input mt-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink block">Category</label>
              <input
                type="text"
                required
                value={eqCategory}
                onChange={(e) => setEqCategory(e.target.value)}
                className="clay-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink block">Total Qty</label>
              <input
                type="number"
                required
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
                className="clay-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink block">Fine (₹/day)</label>
              <input
                type="number"
                required
                value={fineRate}
                onChange={(e) => setFineRate(e.target.value)}
                className="clay-input mt-1"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-clay-indigo text-white font-bold text-xs rounded-2xl hover:bg-clay-indigo-deep">
            + Add Equipment
          </button>
        </form>
      )}

      {activeTab === 'PRINT' && (
        <form onSubmit={handleUpdatePrintPricing} className="space-y-5 max-w-2xl">
          {/* Base Rates */}
          <div className="clay-card p-4 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Base Per-Page Rates</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink block">B&W Rate (₹/page)</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={bwPerPage}
                  onChange={(e) => setBwPerPage(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Color Rate (₹/page)</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={colorPerPage}
                  onChange={(e) => setColorPerPage(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
            </div>
          </div>

          {/* Paper Size Multipliers */}
          <div className="clay-card p-4 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Paper Size Multipliers</h3>
            <p className="text-[11px] text-ink-soft">Cost per page is multiplied by these factors for different paper sizes</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink block">A4 (×)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={a4Multiplier}
                  onChange={(e) => setA4Multiplier(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">A3 (×)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={a3Multiplier}
                  onChange={(e) => setA3Multiplier(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Letter (×)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={letterMultiplier}
                  onChange={(e) => setLetterMultiplier(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
            </div>
          </div>

          {/* Discounts & Surcharges */}
          <div className="clay-card p-4 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Discounts & Surcharges</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-emerald-700 block">Duplex Discount (%)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="50"
                  required
                  value={doubleSidedDiscountPercent}
                  onChange={(e) => setDoubleSidedDiscountPercent(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-blue-600" /> Binding (₹/copy)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  required
                  value={bindingCharge}
                  onChange={(e) => setBindingCharge(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Urgent Surcharge (%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  required
                  value={urgentSurchargePercent}
                  onChange={(e) => setUrgentSurchargePercent(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-clay-bg/80 rounded-xl p-4 text-xs text-ink-soft space-y-1">
            <strong className="text-ink text-sm">Live Example (10 pages):</strong>
            <div>B&W A4: ₹{(bw * a4m * 10).toFixed(2)} | Color A4: ₹{(color * a4m * 10).toFixed(2)}</div>
            <div>B&W A3: ₹{(bw * a3m * 10).toFixed(2)} | Color A3: ₹{(color * a3m * 10).toFixed(2)}</div>
            <div>B&W A4 Duplex: ₹{((bw * a4m * 10) * (1 - dblDisc / 100)).toFixed(2)} (−{dblDisc}%)</div>
          </div>

          {/* Operator & Shop Contact Settings */}
          <div className="clay-card p-4 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">
              Print Shop & Operator Contact Details (Shown to Students)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink block">Print Shop Name</label>
                <input
                  type="text"
                  required
                  value={printerShopName}
                  onChange={(e) => setPrinterShopName(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Operator Contact Person</label>
                <input
                  type="text"
                  required
                  value={printerContactPerson}
                  onChange={(e) => setPrinterContactPerson(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={printerPhone}
                  onChange={(e) => setPrinterPhone(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">WhatsApp Number (e.g. 919849012345)</label>
                <input
                  type="text"
                  required
                  value={printerWhatsapp}
                  onChange={(e) => setPrinterWhatsapp(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Physical Shop Location</label>
                <input
                  type="text"
                  required
                  value={printerShopLocation}
                  onChange={(e) => setPrinterShopLocation(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Printer UPI VPA ID</label>
                <input
                  type="text"
                  required
                  value={printerUpiId}
                  onChange={(e) => setPrinterUpiId(e.target.value)}
                  className="clay-input mt-1"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-clay-indigo text-white font-bold text-xs rounded-2xl hover:bg-clay-indigo-deep">
            Save Print Rates & Operator Contact Info
          </button>
        </form>
      )}
    </div>
  );
};
