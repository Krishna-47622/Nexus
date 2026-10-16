import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Printer, Download, ExternalLink, Zap, BookOpen, Settings, Save, CheckCircle2, Loader2 } from 'lucide-react';

interface PrintJob {
  id: number;
  studentName: string;
  rollNumber: string;
  fileUrl: string;
  fileName: string;
  copies: number;
  isColor: boolean;
  isDoubleSided: boolean;
  paperSize: string;
  totalPages: number;
  totalCost: number;
  perPageRate: number;
  paperSizeMultiplier: number;
  doubleSidedDiscount: number;
  bindingCharge: number;
  urgentSurcharge: number;
  isUrgent: boolean;
  needsBinding: boolean;
  status: string;
  createdAt: string;
}

interface PrintPricing {
  bwPerPage: number;
  colorPerPage: number;
  a4Multiplier: number;
  a3Multiplier: number;
  letterMultiplier: number;
  doubleSidedDiscountPercent: number;
  bindingCharge: number;
  urgentSurchargePercent: number;
}

export const PrintStaffQueue: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Pricing config state
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  const [pricing, setPricing] = useState<PrintPricing>({
    bwPerPage: 2,
    colorPerPage: 10,
    a4Multiplier: 1,
    a3Multiplier: 2,
    letterMultiplier: 1,
    doubleSidedDiscountPercent: 10,
    bindingCharge: 30,
    urgentSurchargePercent: 25,
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingSaved, setPricingSaved] = useState(false);

  useEffect(() => {
    fetchQueue();
    fetchPricing();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = () => {
    api.get('/print/staff/queue')
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  };

  const fetchPricing = () => {
    api.get('/print/staff/pricing')
      .then((res) => setPricing(res.data))
      .catch(() => {});
  };

  const handleStatusChange = async (id: number, nextStatus: string) => {
    try {
      await api.patch(`/print/staff/jobs/${id}/status`, { status: nextStatus });
      fetchQueue();
    } catch (err) {
      alert('Failed to update print status.');
    }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    setPricingSaved(false);
    try {
      await api.put('/print/staff/pricing', pricing);
      setPricingSaved(true);
      setTimeout(() => setPricingSaved(false), 3000);
    } catch (err) {
      alert('Failed to update pricing.');
    } finally {
      setSavingPricing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-ink">Print Shop Queue</h2>
          <p className="text-xs text-ink-soft">Manage high-volume document printing jobs</p>
        </div>
        <button
          onClick={() => setShowPricingConfig(!showPricingConfig)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
            showPricingConfig
              ? 'bg-clay-indigo text-white shadow-clay-btn'
              : 'bg-clay-bg text-ink hover:bg-clay-indigo/10 hover:text-clay-indigo'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          {showPricingConfig ? 'Hide Pricing' : 'Configure Rates'}
        </button>
      </div>

      {/* ─── Pricing Configuration Panel ─── */}
      {showPricingConfig && (
        <div className="clay-card p-5 rounded-2xl space-y-4 border-2 border-clay-indigo/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Settings className="w-4 h-4 text-clay-indigo" />
              Print Shop Rate Configuration
            </h3>
            {pricingSaved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Base Rates */}
            <div className="space-y-3 p-3 bg-clay-bg/50 rounded-xl">
              <h4 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Base Per-Page Rates</h4>
              <div>
                <label className="text-xs font-semibold text-ink block">B&W Rate (₹/page)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={pricing.bwPerPage}
                  onChange={(e) => setPricing({ ...pricing, bwPerPage: parseFloat(e.target.value) || 0 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Color Rate (₹/page)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={pricing.colorPerPage}
                  onChange={(e) => setPricing({ ...pricing, colorPerPage: parseFloat(e.target.value) || 0 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
            </div>

            {/* Paper Size Multipliers */}
            <div className="space-y-3 p-3 bg-clay-bg/50 rounded-xl">
              <h4 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Paper Size Multipliers</h4>
              <div>
                <label className="text-xs font-semibold text-ink block">A4 Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={pricing.a4Multiplier}
                  onChange={(e) => setPricing({ ...pricing, a4Multiplier: parseFloat(e.target.value) || 1 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">A3 Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={pricing.a3Multiplier}
                  onChange={(e) => setPricing({ ...pricing, a3Multiplier: parseFloat(e.target.value) || 1 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink block">Letter Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={pricing.letterMultiplier}
                  onChange={(e) => setPricing({ ...pricing, letterMultiplier: parseFloat(e.target.value) || 1 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Discounts & Surcharges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-emerald-50/50 rounded-xl space-y-2">
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Duplex Discount</h4>
              <div>
                <label className="text-xs font-semibold text-ink block">Discount (%)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="50"
                  value={pricing.doubleSidedDiscountPercent}
                  onChange={(e) => setPricing({ ...pricing, doubleSidedDiscountPercent: parseFloat(e.target.value) || 0 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl space-y-2">
              <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Binding
              </h4>
              <div>
                <label className="text-xs font-semibold text-ink block">Charge (₹/copy)</label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={pricing.bindingCharge}
                  onChange={(e) => setPricing({ ...pricing, bindingCharge: parseFloat(e.target.value) || 0 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-xl space-y-2">
              <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3" /> Urgent
              </h4>
              <div>
                <label className="text-xs font-semibold text-ink block">Surcharge (%)</label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={pricing.urgentSurchargePercent}
                  onChange={(e) => setPricing({ ...pricing, urgentSurchargePercent: parseFloat(e.target.value) || 0 })}
                  className="clay-input mt-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Example calculation */}
          <div className="bg-clay-bg/80 rounded-xl p-3 text-xs text-ink-soft">
            <strong className="text-ink">Example:</strong> 10-page B&W A4 doc = ₹{(pricing.bwPerPage * pricing.a4Multiplier * 10).toFixed(2)}
            {' '}| Color A3 = ₹{(pricing.colorPerPage * pricing.a3Multiplier * 10).toFixed(2)}
            {' '}| With duplex = ₹{((pricing.bwPerPage * pricing.a4Multiplier * 10) * (1 - pricing.doubleSidedDiscountPercent / 100)).toFixed(2)}
          </div>

          <button
            onClick={handleSavePricing}
            disabled={savingPricing}
            className="w-full clay-btn py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {savingPricing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Pricing Configuration
          </button>
        </div>
      )}

      {/* ─── Print Queue Table ─── */}
      {loading ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft">Loading print queue...</div>
      ) : jobs.length === 0 ? (
        <div className="clay-card p-8 text-center text-xs text-ink-soft">No print jobs in queue.</div>
      ) : (
        <div className="clay-card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-clay-bg border-b border-white/60 font-bold uppercase text-ink">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">File Name</th>
                <th className="p-3">Settings</th>
                <th className="p-3">Cost Breakdown</th>
                <th className="p-3">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clay-bg">
              {jobs.map((j) => (
                <tr key={j.id} className={`hover:bg-clay-bg/60 ${j.isUrgent ? 'bg-amber-50/30' : ''}`}>
                  <td className="p-3 font-semibold text-ink">{j.studentName}</td>
                  <td className="p-3 font-mono">{j.rollNumber}</td>
                  <td className="p-3">
                    <a
                      href={j.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-clay-indigo font-bold hover:underline flex items-center gap-1"
                    >
                      {j.fileName} <ExternalLink className="w-3 h-3" />
                    </a>
                    {j.isUrgent && (
                      <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold">
                        <Zap className="w-2.5 h-2.5" /> URGENT
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-medium">
                    <div>{j.copies} copies • {j.totalPages} pgs</div>
                    <div>{j.isColor ? 'Color' : 'B&W'} • {j.paperSize}</div>
                    <div className="text-[10px] text-ink-soft">
                      {j.isDoubleSided && 'Duplex '}
                      {j.needsBinding && '• Binding '}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-ink">₹{j.totalCost.toFixed(2)}</div>
                    <div className="text-[10px] text-ink-soft space-y-0.5">
                      <div>Base: ₹{j.perPageRate?.toFixed(2)}/pg × {j.paperSizeMultiplier}×</div>
                      {j.doubleSidedDiscount > 0 && (
                        <div className="text-emerald-600">Duplex −₹{j.doubleSidedDiscount.toFixed(2)}</div>
                      )}
                      {j.urgentSurcharge > 0 && (
                        <div className="text-amber-600">Urgent +₹{j.urgentSurcharge.toFixed(2)}</div>
                      )}
                      {j.bindingCharge > 0 && (
                        <div className="text-blue-600">Binding +₹{j.bindingCharge.toFixed(2)}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={j.status}
                      onChange={(e) => handleStatusChange(j.id, e.target.value)}
                      className="px-2 py-1 border border-white/50 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-clay-indigo/30"
                    >
                      <option value="QUEUED">Queued</option>
                      <option value="PRINTING">Printing</option>
                      <option value="READY">Ready for Pickup</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
