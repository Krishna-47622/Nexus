import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Utensils, Dumbbell, Printer, FileText, Clock, RefreshCw } from 'lucide-react';

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
        return 'clay-badge-amber';
      case 'PREPARING':
      case 'PRINTING':
      case 'CURRENTLY_OUT':
        return 'clay-badge-indigo';
      case 'READY':
      case 'APPROVED':
        return 'clay-badge-mint';
      case 'OVERDUE':
      case 'REJECTED':
        return 'clay-badge-coral';
      default:
        return 'clay-badge bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const quickActions = [
    { label: 'Order Food', sub: 'MR Food Court - 1', path: '/app/canteen', icon: Utensils },
    { label: 'Sports Gear', sub: 'Borrow Equipment', path: '/app/sports', icon: Dumbbell },
    { label: 'Print Docs', sub: 'Upload & Digital Print', path: '/app/print/new', icon: Printer },
    { label: 'Leave & Outpass', sub: 'Warden Requests', path: '/app/requests', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* ──────── WELCOME BANNER ──────── */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Roll No: <span className="font-semibold text-zinc-800">{user?.username}</span> • {user?.collegeName}
          </p>
        </div>
        <div className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          Active Student Portal
        </div>
      </div>

      {/* ──────── SERVICES DASHBOARD: 4 COLUMNS ON LAPTOP ──────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
          Campus Services
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="bg-white border border-zinc-200/90 rounded-xl p-4 flex flex-col justify-between h-32 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-colors">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 group-hover:text-zinc-950 transition-colors">
                    {action.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{action.sub}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ──────── ACTIVE IN-PROGRESS FEED ──────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Active Requests & Orders
          </h3>
          <button
            onClick={fetchActiveFeed}
            className="text-xs text-zinc-600 hover:text-zinc-900 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-xs text-zinc-500">
            Checking status...
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center space-y-2">
            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-800">No active in-progress items</p>
            <p className="text-xs text-zinc-500">
              Your canteen orders, sports equipment borrows, and leave applications will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-zinc-200/90 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-zinc-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900">{item.title}</span>
                    <span className={getStatusBadgeClass(item.status)}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{item.subtitle}</p>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
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
