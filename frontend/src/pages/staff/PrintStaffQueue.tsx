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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PRINTING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'READY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPLETED':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* ──────── HEADER ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Print Shop Queue
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage high-volume document printing jobs & paper specifications
          </p>
        </div>
        <button
          onClick={() => setShowPricingConfig(!showPricingConfig)}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors self-start sm:self-auto ${
            showPricingConfig
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          {showPricingConfig ? 'Hide Rates' : 'Configure Rates'}
        </button>
      </div>

      {/* ──────── PRICING CONFIGURATION PANEL ──────── */}
      {showPricingConfig && (
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Live Campus Pricing Table</h3>
              <p className="text-[11px] text-zinc-500">Changes apply immediately to all student print calculations</p>
            </div>
            {pricingSaved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 block">B&W Rate (₹/page)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={pricing.bwPerPage}
                onChange={(e) => setPricing({ ...pricing, bwPerPage: parseFloat(e.target.value) || 0 })}
                className="clay-input mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block">Color Rate (₹/page)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={pricing.colorPerPage}
                onChange={(e) => setPricing({ ...pricing, colorPerPage: parseFloat(e.target.value) || 0 })}
                className="clay-input mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block">A3 Size Multiplier</label>
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
              <label className="text-xs font-medium text-zinc-700 block">Duplex Discount (%)</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-zinc-700 block">Spiral / Hard Binding (₹/copy)</label>
              <input
                type="number"
                step="5"
                min="0"
                value={pricing.bindingCharge}
                onChange={(e) => setPricing({ ...pricing, bindingCharge: parseFloat(e.target.value) || 0 })}
                className="clay-input mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 block">Urgent Surcharge (%)</label>
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

          <button
            onClick={handleSavePricing}
            disabled={savingPricing}
            className="w-full clay-btn py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {savingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Pricing Configuration
          </button>
        </div>
      )}

      {/* ──────── PRINT QUEUE ──────── */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500">
          Loading print queue...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500 space-y-2">
          <Printer className="w-6 h-6 text-zinc-400 mx-auto" />
          <p className="font-semibold text-zinc-800 text-sm">No print jobs in queue</p>
          <p>Incoming student print requests will appear here automatically.</p>
        </div>
      ) : (
        <>
          {/* ─── MOBILE VIEW: CLEAN RESPONSIVE CARDS (strictly < md) ─── */}
          <div className="md:hidden space-y-3">
            {jobs.map((j) => (
              <div
                key={j.id}
                className={`bg-white border rounded-xl p-4 shadow-sm space-y-3 ${
                  j.isUrgent ? 'border-amber-300 bg-amber-50/20' : 'border-zinc-200'
                }`}
              >
                {/* Top Row: Student Name, Roll No, and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">{j.studentName}</h3>
                    <span className="text-xs font-mono text-zinc-500">{j.rollNumber}</span>
                  </div>
                  <div className="shrink-0">
                    <select
                      value={j.status}
                      onChange={(e) => handleStatusChange(j.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${getStatusBadge(
                        j.status
                      )}`}
                    >
                      <option value="QUEUED">Queued</option>
                      <option value="PRINTING">Printing</option>
                      <option value="READY">Ready</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* File Link & Urgent Badge */}
                <div className="flex items-center justify-between gap-2 bg-zinc-50 border border-zinc-200/80 rounded-lg p-2.5">
                  <a
                    href={j.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-zinc-900 hover:text-indigo-600 flex items-center gap-1.5 truncate"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{j.fileName}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                  </a>

                  {j.isUrgent && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold shrink-0">
                      <Zap className="w-2.5 h-2.5" /> URGENT
                    </span>
                  )}
                </div>

                {/* Specifications Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 font-medium">
                    {j.copies} {j.copies === 1 ? 'copy' : 'copies'}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 font-medium">
                    {j.totalPages} {j.totalPages === 1 ? 'page' : 'pages'}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 font-medium">
                    {j.isColor ? 'Color' : 'B&W'}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 font-medium">
                    {j.paperSize}
                  </span>
                  {j.isDoubleSided && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-medium">
                      Duplex
                    </span>
                  )}
                  {j.needsBinding && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium">
                      Binding
                    </span>
                  )}
                </div>

                {/* Bottom Row: Cost Breakdown & Total */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    Base: ₹{j.perPageRate?.toFixed(2)}/pg
                    {j.doubleSidedDiscount > 0 && ` • -₹${j.doubleSidedDiscount.toFixed(2)}`}
                    {j.bindingCharge > 0 && ` • +₹${j.bindingCharge.toFixed(2)}`}
                  </span>
                  <div className="text-sm font-bold text-zinc-900">
                    Total: ₹{j.totalCost?.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── DESKTOP VIEW: FULL TABLE (md and above) ─── */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-600 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">File Name</th>
                    <th className="p-3.5">Settings</th>
                    <th className="p-3.5">Cost Breakdown</th>
                    <th className="p-3.5">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {jobs.map((j) => (
                    <tr key={j.id} className={`hover:bg-zinc-50/70 transition-colors ${j.isUrgent ? 'bg-amber-50/20' : ''}`}>
                      <td className="p-3.5 font-semibold text-zinc-900">{j.studentName}</td>
                      <td className="p-3.5 font-mono text-zinc-600">{j.rollNumber}</td>
                      <td className="p-3.5">
                        <a
                          href={j.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-900 font-medium hover:text-indigo-600 inline-flex items-center gap-1"
                        >
                          {j.fileName} <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                        {j.isUrgent && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold">
                              <Zap className="w-2.5 h-2.5" /> URGENT
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-zinc-700">
                        <div>{j.copies} copies • {j.totalPages} pgs</div>
                        <div className="text-zinc-500 mt-0.5">{j.isColor ? 'Color' : 'B&W'} • {j.paperSize}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {j.isDoubleSided && 'Duplex '}
                          {j.needsBinding && '• Binding '}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-zinc-900">₹{j.totalCost?.toFixed(2)}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 space-y-0.5">
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
                      <td className="p-3.5">
                        <select
                          value={j.status}
                          onChange={(e) => handleStatusChange(j.id, e.target.value)}
                          className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none ${getStatusBadge(
                            j.status
                          )}`}
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
          </div>
        </>
      )}
    </div>
  );
};
