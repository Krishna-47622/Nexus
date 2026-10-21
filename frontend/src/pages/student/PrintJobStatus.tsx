import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Zap, 
  BookOpen, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

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

const STEPS = [
  { id: 'QUEUED', label: 'Queued', desc: 'In print buffer' },
  { id: 'PRINTING', label: 'Printing', desc: 'Spooling onto paper' },
  { id: 'READY', label: 'Ready', desc: 'Awaiting pickup' },
  { id: 'COMPLETED', label: 'Collected', desc: 'Job archived' },
];

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
      .then((res) => setJobs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getStepIndex = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'QUEUED': return 1;
      case 'PRINTING': return 2;
      case 'READY': return 3;
      case 'COMPLETED': return 4;
      default: return 1;
    }
  };

  const activeJobs = jobs.filter((j) => ['QUEUED', 'PRINTING', 'READY'].includes(j.status?.toUpperCase()));
  const historyJobs = jobs.filter((j) => j.status?.toUpperCase() === 'COMPLETED');

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Print Job Status & Queue
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time telemetry from Campus Reprographics & Digital Print Center
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/app/print/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <span>+ Submit New Document</span>
          </Link>
        </div>
      </div>

      {/* ─── Active Jobs Timeline ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Live Print Processing ({activeJobs.length})
          </h3>
          {activeJobs.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Operator Synced
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl text-center text-xs text-zinc-500 dark:text-zinc-400">
            Checking reprographics print queue...
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 rounded-2xl text-center space-y-2">
            <Printer className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No active print jobs</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              You have no files currently printing. Need notes or assignments printed? Submit a document to skip physical queues.
            </p>
            <div className="pt-2">
              <Link
                to="/app/print/new"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Upload document now →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((j) => {
              const currentStep = getStepIndex(j.status);
              return (
                <div
                  key={j.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {j.fileName}
                        </h4>
                        {j.isUrgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-[10px] font-bold shrink-0">
                            <Zap className="w-2.5 h-2.5" /> URGENT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap gap-x-2">
                        <span>{j.copies} {j.copies === 1 ? 'copy' : 'copies'}</span>
                        <span>•</span>
                        <span>{j.totalPages} pages</span>
                        <span>•</span>
                        <span>{j.isColor ? 'Color' : 'B&W'}</span>
                        <span>•</span>
                        <span>{j.paperSize}</span>
                        {j.isDoubleSided && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400">Duplex</span>
                          </>
                        )}
                        {j.needsBinding && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400">Spiral Bound</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs text-zinc-400">Total Charged</div>
                        <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                          ₹{j.totalCost?.toFixed(2)}
                        </div>
                      </div>
                      <a
                        href={j.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Download / View Source"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Stepper */}
                  <div className="pt-2">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {STEPS.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isDone = currentStep > stepNum;
                        const isCurrent = currentStep === stepNum;
                        const isFuture = currentStep < stepNum;

                        return (
                          <div key={step.id} className="flex flex-col items-center text-center space-y-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : isCurrent
                                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60 shadow-xs animate-pulse'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                            </div>
                            <div>
                              <div
                                className={`text-xs font-bold ${
                                  isCurrent
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : isDone
                                    ? 'text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-400 dark:text-zinc-600'
                                }`}
                              >
                                {step.label}
                              </div>
                              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:block">
                                {step.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Banner */}
                  {j.status === 'READY' && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Ready for pickup at <strong>Ground Floor Reprographics (Block 2)</strong></span>
                      </div>
                      <span className="font-bold text-[11px] underline cursor-pointer">
                        Show Gate Token
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Completed Print History ─── */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Completed & Collected Archive ({historyJobs.length})
        </h3>

        {historyJobs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl text-center text-xs text-zinc-500 dark:text-zinc-400">
            No completed print job history yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-xs">
            {historyJobs.map((j) => (
              <div
                key={j.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{j.fileName}</span>
                    {j.isUrgent && <Zap className="w-3 h-3 text-amber-500" />}
                    {j.needsBinding && <BookOpen className="w-3 h-3 text-indigo-500" />}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {new Date(j.createdAt).toLocaleDateString()} • {j.totalPages} pages • {j.copies} copies • {j.isColor ? 'Color' : 'B&W'} • {j.paperSize}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    ₹{j.totalCost?.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md text-[10px] font-semibold">
                    Collected
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

