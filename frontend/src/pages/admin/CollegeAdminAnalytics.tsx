import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Users, Utensils, Clock, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  totalStudents: number;
  activeOrdersToday: number;
  pendingApprovals: number;
  totalRevenueMonth: number;
  topMenuItems: { name: string; count: number }[];
  topEquipmentBorrows: { name: string; count: number }[];
}

export const CollegeAdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading institutional analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">College Operational Analytics</h2>
        <p className="text-xs text-slate-500">Real-time stats and metrics computed exclusively for your institution</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{data.totalStudents}</div>
          <span className="text-[11px] text-slate-500">Onboarded & active</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Orders Today</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{data.activeOrdersToday}</div>
          <span className="text-[11px] text-slate-500">Kitchen queue</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{data.pendingApprovals}</div>
          <span className="text-[11px] text-slate-500">Sports & Leave/Outpass</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue Month</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">₹{data.totalRevenueMonth.toFixed(2)}</div>
          <span className="text-[11px] text-slate-500">Sum of UPI transactions</span>
        </div>
      </div>

      {/* Analytics Charts & Categorical Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primary" /> Most Ordered Canteen Items
          </h3>
          <div className="space-y-2">
            {data.topMenuItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{item.name}</span>
                  <span className="text-slate-500">{item.count} orders</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-sm"
                    style={{ width: `${Math.min(100, (item.count / 150) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" /> Most Borrowed Sports Equipment
          </h3>
          <div className="space-y-2">
            {data.topEquipmentBorrows.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{item.name}</span>
                  <span className="text-slate-500">{item.count} checkouts</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-sm"
                    style={{ width: `${Math.min(100, (item.count / 100) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
