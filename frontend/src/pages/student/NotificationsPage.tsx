import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Bell, Utensils, Dumbbell, Printer, FileText, Check } from 'lucide-react';

interface NotificationItem {
  id: number;
  module: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    api.get('/notifications')
      .then((res) => setNotifications(res.data))
      .finally(() => setLoading(false));
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {}
  };

  const getModuleIcon = (module: string) => {
    switch (module.toUpperCase()) {
      case 'CANTEEN':
        return <Utensils className="w-4 h-4 text-primary" />;
      case 'SPORTS':
        return <Dumbbell className="w-4 h-4 text-primary" />;
      case 'PRINT':
        return <Printer className="w-4 h-4 text-primary" />;
      case 'LEAVE':
      case 'OUTPASS':
        return <FileText className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        <span className="text-xs text-slate-500 font-medium">
          {notifications.filter((n) => !n.isRead).length} Unread
        </span>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-center space-y-1">
          <Bell className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
          <p className="text-xs text-slate-500">You'll receive updates here when order or request status changes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`bg-white border p-3.5 rounded-sm flex items-start gap-3 transition cursor-pointer ${
                !n.isRead ? 'border-primary bg-blue-50/20' : 'border-slate-200'
              }`}
            >
              <div className="p-2 bg-slate-100 rounded-sm shrink-0 mt-0.5">
                {getModuleIcon(n.module)}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{n.title}</span>
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full" title="Unread" />}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
