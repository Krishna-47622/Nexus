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
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CURRENTLY_OUT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REJECTED':
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Leave & Outpass Status</h2>
        <div className="flex gap-2">
          <Link
            to="/app/leave/new"
            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-sm hover:bg-slate-50"
          >
            + Leave
          </Link>
          <Link
            to="/app/outpass/new"
            className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary-dark"
          >
            + Outpass
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'LEAVE' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Leave Letters ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTPASS')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'OUTPASS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Outpass Requests ({outpasses.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
          Loading applications...
        </div>
      ) : activeTab === 'LEAVE' ? (
        leaves.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
            No leave letters submitted yet.
          </div>
        ) : (
          <div className="space-y-2">
            {leaves.map((l) => {
              const isExpanded = expandedId === `leave-${l.id}`;
              return (
                <div key={l.id} className="bg-white border border-slate-200 rounded-sm p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{l.destination}</h4>
                      <p className="text-xs text-slate-500">{l.fromDate} to {l.toDate}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${getStatusBadge(l.status)}`}>
                      {l.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Reason:</span> {l.reason}
                  </div>

                  {l.wardenRemarks && (
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Warden Remarks:</span> {l.wardenRemarks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : outpasses.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
          No outpass applications submitted yet.
        </div>
      ) : (
        <div className="space-y-2">
          {outpasses.map((op) => (
            <div key={op.id} className="bg-white border border-slate-200 rounded-sm p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{op.destinationPurpose}</span>
                    <span className="text-[10px] bg-slate-100 border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded-sm font-semibold">
                      {op.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Return by: {new Date(op.expectedReturnTime).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${getStatusBadge(op.status)}`}>
                  {op.status.replace('_', ' ')}
                </span>
              </div>

              {op.wardenRemarks && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Warden Remarks:</span> {op.wardenRemarks}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
