import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Utensils, Dumbbell, Printer, FileText, Clock, ChevronRight, AlertCircle } from 'lucide-react';

interface ActiveFeedItem {
  id: string;
  module: string;
  title: string;
  subtitle: string;
  status: string;
  timestamp: string;
}

export const StudentHome: React.FC = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState<ActiveFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFeed();
  }, []);

  const fetchActiveFeed = () => {
    api.get('/student/active-feed')
      .then((res) => setFeed(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PLACED':
      case 'QUEUED':
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PREPARING':
      case 'PRINTING':
      case 'CURRENTLY_OUT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'READY':
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'OVERDUE':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Greeting */}
      <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Welcome back, {user?.fullName?.split(' ')[0]}</h2>
        <p className="text-xs text-slate-500 font-medium">
          Roll No: <span className="text-slate-800 font-semibold">{user?.username}</span> • {user?.collegeName}
        </p>
      </div>

      {/* Quick Action Tiles */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Services Dashboard</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/app/canteen"
            className="bg-white border border-slate-200 p-4 rounded-sm hover:border-primary transition flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-primary">Order Food</div>
              <div className="text-[11px] text-slate-500">Canteen Menu</div>
            </div>
          </Link>

          <Link
            to="/app/sports"
            className="bg-white border border-slate-200 p-4 rounded-sm hover:border-primary transition flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-primary">Sports Gear</div>
              <div className="text-[11px] text-slate-500">Borrow Equipment</div>
            </div>
          </Link>

          <Link
            to="/app/print/new"
            className="bg-white border border-slate-200 p-4 rounded-sm hover:border-primary transition flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-primary">Print Docs</div>
              <div className="text-[11px] text-slate-500">Upload & Print</div>
            </div>
          </Link>

          <Link
            to="/app/requests"
            className="bg-white border border-slate-200 p-4 rounded-sm hover:border-primary transition flex flex-col justify-between h-28 group"
          >
            <div className="w-8 h-8 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-primary">Leave & Outpass</div>
              <div className="text-[11px] text-slate-500">Warden Approval</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Combined Active Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active In-Progress Activity</h3>
          <button onClick={fetchActiveFeed} className="text-xs text-primary font-semibold hover:underline">
            Refresh Feed
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            Loading active requests...
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center space-y-1">
            <Clock className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No active in-progress items</p>
            <p className="text-xs text-slate-500">Your active orders, equipment borrows, and leave applications will show here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 p-3 rounded-sm flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${getStatusBadgeClass(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
