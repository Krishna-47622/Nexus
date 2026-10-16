import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { FileText, Plus, ChevronDown, ChevronUp, AlertCircle, Clock } from 'lucide-react';

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    Promise.all([api.get('/requests/my/leave'), api.get('/requests/my/outpass')])
      .then(([leaveRes, outpassRes]) => {
        setLeaves(leaveRes.data);
        setOutpasses(outpassRes.data);
      })
      .finally(() => setLoading(false));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-clay-amber/10 text-clay-amber border-clay-amber/20';
      case 'APPROVED':
        return 'bg-clay-mint/10 text-clay-mint border-clay-mint/20';
      case 'CURRENTLY_OUT':
        return 'bg-clay-indigo/10 text-clay-indigo border-clay-indigo/20';
      case 'REJECTED':
      case 'OVERDUE':
        return 'bg-clay-coral/10 text-clay-coral border-clay-coral/20';
      default:
        return 'bg-clay-bg text-ink border-white/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-ink">Leave & Outpass Status</h2>
        <div className="flex gap-2">
          <Link
            to="/app/leave/new"
            className="px-2.5 py-1 clay-card text-ink text-xs font-semibold rounded-2xl hover:bg-clay-bg/60"
          >
            + Leave
          </Link>
          <Link
            to="/app/outpass/new"
            className="px-2.5 py-1 bg-clay-indigo text-white text-xs font-semibold rounded-2xl hover:bg-clay-indigo-deep"
          >
            + Outpass
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/60">
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'LEAVE' ? 'border-clay-indigo text-clay-indigo' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Leave Letters ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTPASS')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'OUTPASS' ? 'border-clay-indigo text-clay-indigo' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Outpass Requests ({outpasses.length})
        </button>
      </div>

      {loading ? (
        <div className="clay-card p-8 rounded-2xl text-center text-xs text-ink-soft">
          Loading applications...
        </div>
      ) : activeTab === 'LEAVE' ? (
        leaves.length === 0 ? (
          <div className="clay-card p-8 rounded-2xl text-center text-xs text-ink-soft">
            No leave letters submitted yet.
          </div>
        ) : (
          <div className="space-y-2">
            {leaves.map((l) => {
              const isExpanded = expandedId === `leave-${l.id}`;
              return (
                <div key={l.id} className="clay-card p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-ink">{l.destination}</h4>
                      <p className="text-xs text-ink-soft">{l.fromDate} to {l.toDate}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xl border ${getStatusBadge(l.status)}`}>
                      {l.status}
                    </span>
                  </div>

                  <div className="text-xs text-ink-soft">
                    <span className="font-semibold">Reason:</span> {l.reason}
                  </div>

                  {l.wardenRemarks && (
                    <div className="p-2 bg-clay-bg/60 border border-white/60 rounded-2xl text-xs text-ink">
                      <span className="font-bold text-ink">Warden Remarks:</span> {l.wardenRemarks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : outpasses.length === 0 ? (
        <div className="clay-card p-8 rounded-2xl text-center text-xs text-ink-soft">
          No outpass applications submitted yet.
        </div>
      ) : (
        <div className="space-y-2">
          {outpasses.map((op) => (
            <div key={op.id} className="clay-card p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">{op.destinationPurpose}</span>
                    <span className="text-[10px] bg-clay-bg border border-white/50 text-ink px-1.5 py-0.5 rounded-2xl font-semibold">
                      {op.type}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">Return by: {new Date(op.expectedReturnTime).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xl border ${getStatusBadge(op.status)}`}>
                  {op.status.replace('_', ' ')}
                </span>
              </div>

              {op.wardenRemarks && (
                <div className="p-2 bg-clay-bg/60 border border-white/60 rounded-2xl text-xs text-ink">
                  <span className="font-bold text-ink">Warden Remarks:</span> {op.wardenRemarks}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
