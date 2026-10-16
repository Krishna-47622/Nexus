import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Printer, FileText, CheckCircle2, Clock, Zap, BookOpen } from 'lucide-react';

interface PrintJob {
  id: number;
  fileName: string;
  fileUrl: string;
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

export const PrintJobStatus: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = () => {
    api.get('/print/jobs/my')
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  };

  const getStepIndex = (status: string) => {
    switch (status.toUpperCase()) {
      case 'QUEUED': return 1;
      case 'PRINTING': return 2;
      case 'READY': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
  };

  const activeJobs = jobs.filter((j) => ['QUEUED', 'PRINTING', 'READY'].includes(j.status.toUpperCase()));
  const historyJobs = jobs.filter((j) => j.status.toUpperCase() === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-ink">Print Jobs Status</h2>
        <Link to="/app/print/new" className="text-xs font-semibold text-clay-indigo hover:underline">
          + New Print Job
        </Link>
      </div>

      {/* Active Jobs Stepper */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Active Print Queue Stepper</h3>
        {loading ? (
          <div className="clay-card p-6 rounded-2xl text-center text-xs text-ink-soft">
            Loading active print jobs...
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="clay-card p-6 rounded-2xl text-center text-xs text-ink-soft">
            No active print jobs in queue.
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((j) => {
              const step = getStepIndex(j.status);
              return (
                <div key={j.id} className="clay-card !shadow-clay-lg border-2 !border-clay-indigo/20 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-clay-bg pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" /> {j.fileName}
                        {j.isUrgent && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold">
                            <Zap className="w-2.5 h-2.5" /> URGENT
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-ink-soft">
                        {j.copies} copies • {j.totalPages} pgs • {j.isColor ? 'Color' : 'B&W'} • {j.paperSize}
                        {j.isDoubleSided && ' • Duplex'}
                        {j.needsBinding && ' • Binding'}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-primary">₹{j.totalCost.toFixed(2)}</span>
                  </div>

                  {/* Price breakdown mini */}
                  {(j.doubleSidedDiscount > 0 || j.urgentSurcharge > 0 || j.bindingCharge > 0) && (
                    <div className="text-[10px] text-ink-soft flex flex-wrap gap-2">
                      {j.doubleSidedDiscount > 0 && (
                        <span className="text-emerald-600">Duplex −₹{j.doubleSidedDiscount.toFixed(2)}</span>
                      )}
                      {j.urgentSurcharge > 0 && (
                        <span className="text-amber-600">Urgent +₹{j.urgentSurcharge.toFixed(2)}</span>
                      )}
                      {j.bindingCharge > 0 && (
                        <span className="text-clay-indigo">Binding +₹{j.bindingCharge.toFixed(2)}</span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className={`space-y-1 ${step >= 1 ? 'text-clay-indigo font-bold' : 'text-ink-muted'}`}>
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-clay-indigo text-white' : 'bg-slate-200'}`}>1</div>
                      <div className="text-[10px]">Queued</div>
                    </div>
                    <div className={`space-y-1 ${step >= 2 ? 'text-clay-indigo font-bold' : 'text-ink-muted'}`}>
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-clay-indigo text-white' : 'bg-slate-200'}`}>2</div>
                      <div className="text-[10px]">Printing</div>
                    </div>
                    <div className={`space-y-1 ${step >= 3 ? 'text-clay-indigo font-bold' : 'text-ink-muted'}`}>
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-clay-indigo text-white' : 'bg-slate-200'}`}>3</div>
                      <div className="text-[10px]">Ready for Pickup</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">Completed Print History</h3>
        {historyJobs.length === 0 ? (
          <div className="clay-card p-6 rounded-2xl text-center text-xs text-ink-soft">
            No completed print job history.
          </div>
        ) : (
          <div className="space-y-2">
            {historyJobs.map((j) => (
              <div key={j.id} className="clay-card p-3 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink flex items-center gap-1">
                    {j.fileName}
                    {j.isUrgent && <Zap className="w-3 h-3 text-amber-500" />}
                    {j.needsBinding && <BookOpen className="w-3 h-3 text-clay-indigo" />}
                  </span>
                  <p className="text-ink-soft text-[11px]">
                    {new Date(j.createdAt).toLocaleDateString()} • {j.totalPages} pgs • {j.copies} copies • ₹{j.totalCost.toFixed(2)}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-clay-bg text-ink rounded-2xl font-bold text-[10px]">
                  COMPLETED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
