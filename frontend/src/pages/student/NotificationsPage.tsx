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
        <h2 className="text-xl font-extrabold text-ink">Notifications</h2>
        <span className="text-xs text-ink-soft font-medium">
          {notifications.filter((n) => !n.isRead).length} Unread
        </span>
      </div>

      {loading ? (
        <div className="clay-card p-8 rounded-2xl text-center text-xs text-ink-soft">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="clay-card p-8 rounded-2xl text-center space-y-1">
          <Bell className="w-6 h-6 text-ink-muted mx-auto" />
          <p className="text-sm font-semibold text-ink">No notifications yet</p>
          <p className="text-xs text-ink-soft">You'll receive updates here when order or request status changes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`bg-white border p-3.5 rounded-2xl flex items-start gap-3 transition cursor-pointer ${
                !n.isRead ? 'border-clay-indigo bg-blue-50/20' : 'border-white/60'
              }`}
            >
              <div className="p-2 bg-clay-bg rounded-2xl shrink-0 mt-0.5">
                {getModuleIcon(n.module)}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-ink">{n.title}</span>
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="w-2 h-2 bg-clay-indigo rounded-full" title="Unread" />}
                    <span className="text-[10px] text-ink-muted font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
