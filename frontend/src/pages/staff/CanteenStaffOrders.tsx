import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Utensils, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface OrderItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  studentName: string;
  rollNumber: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export const CanteenStaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = () => {
    api.get('/canteen/staff/orders')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  const updateStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.patch(`/canteen/staff/orders/${orderId}/status`, { status: nextStatus });
      fetchQueue();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const newOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-ink">Canteen Kitchen Queue Kanban</h2>
          <p className="text-xs text-ink-soft">Real-time incoming student food orders</p>
        </div>
        <button onClick={fetchQueue} className="px-3 py-1.5 clay-card text-xs font-semibold text-ink hover:bg-clay-bg/60 rounded-2xl">
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="clay-card p-8 rounded-2xl text-center text-xs text-ink-soft">
          Loading orders queue...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: New Orders */}
          <div className="bg-clay-bg border border-white/60 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/50 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-800">New Orders</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs font-bold rounded-2xl">{newOrders.length}</span>
            </div>
            <div className="space-y-3">
              {newOrders.map((o) => (
                <div key={o.id} className="clay-card p-3 rounded-2xl space-y-2 shadow-clay-sm">
                  <div className="flex justify-between font-bold text-xs">
                    <span>#{o.orderNumber}</span>
                    <span>₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-ink-soft font-semibold">{o.studentName} ({o.rollNumber})</div>
                  <div className="bg-clay-bg/60 p-2 text-xs space-y-0.5 rounded-2xl">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.quantity}x {i.itemName}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, 'PREPARING')}
                    className="w-full py-1.5 bg-amber-600 text-white font-bold text-xs rounded-2xl hover:bg-amber-700 transition flex items-center justify-center gap-1"
                  >
                    Start Preparing <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Preparing */}
          <div className="bg-clay-bg border border-white/60 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/50 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-800">Preparing</span>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-900 text-xs font-bold rounded-2xl">{preparingOrders.length}</span>
            </div>
            <div className="space-y-3">
              {preparingOrders.map((o) => (
                <div key={o.id} className="bg-white border border-blue-300 p-3 rounded-2xl space-y-2 shadow-clay-sm">
                  <div className="flex justify-between font-bold text-xs">
                    <span>#{o.orderNumber}</span>
                    <span>₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-ink-soft font-semibold">{o.studentName} ({o.rollNumber})</div>
                  <div className="bg-clay-bg/60 p-2 text-xs space-y-0.5 rounded-2xl">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.quantity}x {i.itemName}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, 'READY')}
                    className="w-full py-1.5 bg-blue-600 text-white font-bold text-xs rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    Mark Ready for Pickup <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Ready for Pickup */}
          <div className="bg-clay-bg border border-white/60 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/50 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">Ready for Pickup</span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl">{readyOrders.length}</span>
            </div>
            <div className="space-y-3">
              {readyOrders.map((o) => (
                <div key={o.id} className="bg-white border border-emerald-400 p-3 rounded-2xl space-y-2 shadow-clay-sm">
                  <div className="flex justify-between font-bold text-xs">
                    <span>#{o.orderNumber}</span>
                    <span>₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-ink-soft font-semibold">{o.studentName} ({o.rollNumber})</div>
                  <button
                    onClick={() => updateStatus(o.id, 'PICKED_UP')}
                    className="w-full py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Picked Up
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
