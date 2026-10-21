import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { FileText, Plus, ChevronDown, ChevronUp, AlertCircle, Clock, QrCode, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface LeaveRequest {
  id: number;
  reason: string;
  fromDate: string;
  toDate: string;
  destination: string;
  attachmentUrl: string;
  status: string;
  wardenRemarks: string;
  createdAt: string;
}

interface OutpassRequest {
  id: number;
  type: string;
  outTime: string;
  expectedReturnTime: string;
  actualReturnTime: string;
  destinationPurpose: string;
  status: string;
  wardenRemarks: string;
  createdAt: string;
}

export const RequestsStatus: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'OUTPASS'>('LEAVE');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [outpasses, setOutpasses] = useState<OutpassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<{
    id: number;
    type: string;
    title: string;
    status: string;
    timeRange: string;
    remarks?: string;
  } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    Promise.all([api.get('/requests/my/leave'), api.get('/requests/my/outpass')])
      .then(([leaveRes, outpassRes]) => {
        setLeaves(leaveRes.data);
        setOutpasses(outpassRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'clay-badge-amber';
      case 'APPROVED':
        return 'clay-badge-mint';
      case 'CURRENTLY_OUT':
        return 'clay-badge-indigo';
      case 'REJECTED':
      case 'OVERDUE':
        return 'clay-badge-coral';
      default:
        return 'clay-badge bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Leave & Outpass Status
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track warden approval remarks and display digital campus gate passes
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/app/leave/new"
            className="clay-btn-secondary text-xs px-3 py-1.5 hover-lift"
          >
            + Leave Letter
          </Link>
          <Link
            to="/app/outpass/new"
            className="clay-btn text-xs px-3 py-1.5 hover-lift"
          >
            + Outpass
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'LEAVE'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Leave Letters ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTPASS')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'OUTPASS'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Outpass Requests ({outpasses.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="clay-card p-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Loading applications and permissions...
        </div>
      ) : activeTab === 'LEAVE' ? (
        leaves.length === 0 ? (
          <div className="clay-card p-10 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
            <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-1" />
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">No leave letters submitted</p>
            <p className="text-[11px]">Submit an official student leave letter with reason and destination to notify your hostel warden.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.map((l) => (
              <div key={l.id} className="clay-card p-4 sm:p-5 space-y-3 hover-lift">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{l.destination}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{l.fromDate} to {l.toDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`clay-badge font-semibold ${getStatusBadge(l.status)}`}>
                      {l.status}
                    </span>
                    {(l.status.toUpperCase() === 'APPROVED' || l.status.toUpperCase() === 'CURRENTLY_OUT') && (
                      <button
                        onClick={() =>
                          setSelectedPass({
                            id: l.id,
                            type: 'Leave Approval Gate Pass',
                            title: l.destination,
                            status: l.status,
                            timeRange: `${l.fromDate} - ${l.toDate}`,
                            remarks: l.wardenRemarks,
                          })
                        }
                        className="clay-btn-secondary text-[11px] px-2.5 py-1 hover-lift flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" /> Gate Pass
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Reason:</span> {l.reason}
                </div>

                {l.wardenRemarks && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-0.5">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      Warden Remarks
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">{l.wardenRemarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : outpasses.length === 0 ? (
        <div className="clay-card p-10 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
          <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-1" />
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">No outpass requests submitted</p>
          <p className="text-[11px]">Request an emergency or day outpass when leaving the campus premises.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {outpasses.map((op) => (
            <div key={op.id} className="clay-card p-4 sm:p-5 space-y-3 hover-lift">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{op.destinationPurpose}</h4>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded font-semibold border border-zinc-200 dark:border-zinc-700">
                      {op.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Return by: <span className="font-medium text-zinc-700 dark:text-zinc-300">{new Date(op.expectedReturnTime).toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`clay-badge font-semibold ${getStatusBadge(op.status)}`}>
                    {op.status.replace('_', ' ')}
                  </span>
                  {(op.status.toUpperCase() === 'APPROVED' || op.status.toUpperCase() === 'CURRENTLY_OUT') && (
                    <button
                      onClick={() =>
                        setSelectedPass({
                          id: op.id,
                          type: `${op.type} Gate Outpass`,
                          title: op.destinationPurpose,
                          status: op.status,
                          timeRange: `Expected Return: ${new Date(op.expectedReturnTime).toLocaleString()}`,
                          remarks: op.wardenRemarks,
                        })
                      }
                      className="clay-btn-secondary text-[11px] px-2.5 py-1 hover-lift flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3" /> Gate Pass
                    </button>
                  )}
                </div>
              </div>

              {op.wardenRemarks && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-0.5">
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    Warden Remarks
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">{op.wardenRemarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ──────── DIGITAL GATE PASS MODAL ──────── */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{selectedPass.type}</h3>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">ID #{selectedPass.id} • Digital Verified</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              {/* Simulated QR Code with security border */}
              <div className="w-44 h-44 mx-auto p-3 rounded-2xl bg-white border-2 border-emerald-500/80 shadow-md flex flex-col items-center justify-center space-y-2">
                <QrCode className="w-28 h-28 text-zinc-900" />
                <span className="text-[9px] font-mono text-zinc-500 tracking-wider">MRU-SEC-VERIFIED</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{selectedPass.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{selectedPass.timeRange}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Status: {selectedPass.status}
                </div>
              </div>

              {selectedPass.remarks && (
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-400">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Remarks:</span> {selectedPass.remarks}
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedPass(null)}
                className="clay-btn text-xs px-4 py-2 w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
