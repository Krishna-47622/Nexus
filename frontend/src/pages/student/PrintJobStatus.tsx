import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Printer, FileText, CheckCircle2, Clock } from 'lucide-react';

interface PrintJob {
  id: number;
  fileName: string;
  fileUrl: string;
  copies: number;
  isColor: boolean;
  paperSize: string;
  totalPages: number;
  totalCost: number;
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
        <h2 className="text-xl font-bold text-slate-900">Print Jobs Status</h2>
        <Link to="/app/print/new" className="text-xs font-semibold text-primary hover:underline">
          + New Print Job
        </Link>
      </div>

      {/* Active Jobs Stepper */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Print Queue Stepper</h3>
        {loading ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            Loading active print jobs...
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            No active print jobs in queue.
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((j) => {
              const step = getStepIndex(j.status);
              return (
                <div key={j.id} className="bg-white border-2 border-primary p-4 rounded-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" /> {j.fileName}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {j.copies} copies • {j.totalPages} pgs • {j.isColor ? 'Color' : 'B&W'} • {j.paperSize}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-primary">₹{j.totalCost.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className={`space-y-1 ${step >= 1 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}>1</div>
                      <div className="text-[10px]">Queued</div>
                    </div>
                    <div className={`space-y-1 ${step >= 2 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>2</div>
                      <div className="text-[10px]">Printing</div>
                    </div>
                    <div className={`space-y-1 ${step >= 3 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                      <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200'}`}>3</div>
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
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Completed Print History</h3>
        {historyJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            No completed print job history.
          </div>
        ) : (
          <div className="space-y-2">
            {historyJobs.map((j) => (
              <div key={j.id} className="bg-white border border-slate-200 p-3 rounded-sm flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{j.fileName}</span>
                  <p className="text-slate-500 text-[11px]">{new Date(j.createdAt).toLocaleDateString()} • ₹{j.totalCost.toFixed(2)}</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm font-bold text-[10px]">
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
