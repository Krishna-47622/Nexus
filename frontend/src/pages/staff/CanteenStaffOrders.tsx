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
          <h2 className="text-xl font-bold text-slate-900">Canteen Kitchen Queue Kanban</h2>
          <p className="text-xs text-slate-500">Real-time incoming student food orders</p>
        </div>
        <button onClick={fetchQueue} className="px-3 py-1.5 bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-sm">
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
          Loading orders queue...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: New Orders */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-800">New Orders</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs font-bold rounded-sm">{newOrders.length}</span>
            </div>
            <div className="space-y-3">
              {newOrders.map((o) => (
                <div key={o.id} className="bg-white border border-slate-300 p-3 rounded-sm space-y-2 shadow-sm">
                  <div className="flex justify-between font-bold text-xs">
                    <span>#{o.orderNumber}</span>
                    <span>₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">{o.studentName} ({o.rollNumber})</div>
                  <div className="bg-slate-50 p-2 text-xs space-y-0.5 rounded-sm">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.quantity}x {i.itemName}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, 'PREPARING')}
                    className="w-full py-1.5 bg-amber-600 text-white font-bold text-xs rounded-sm hover:bg-amber-700 transition flex items-center justify-center gap-1"
                  >
                    Start Preparing <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Preparing */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-800">Preparing</span>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-900 text-xs font-bold rounded-sm">{preparingOrders.length}</span>
            </div>
            <div className="space-y-3">
              {preparingOrders.map((o) => (
                <div key={o.id} className="bg-white border border-blue-300 p-3 rounded-sm space-y-2 shadow-sm">
                  <div className="flex justify-between font-bold text-xs">
                    <span>#{o.orderNumber}</span>
                    <span>₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">{o.studentName} ({o.rollNumber})</div>
                  <div className="bg-slate-50 p-2 text-xs space-y-0.5 rounded-sm">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.quantity}x {i.itemName}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, 'READY')}
                    className="w-full py-1.5 bg-blue-600 text-white font-bold text-xs rounded-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    Mark Ready for Pickup <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Ready for Pickup */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">Ready for Pickup</span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-xs font-bold rounded-sm">{readyOrders.length}</span>
            </div>
            <div className="space-y-3">
              {readyOrders.map((o) => (
                <div key={o.id} className="bg-white border border-emerald-400 p-3 rounded-sm space-y-2 shadow-sm">
                  <div className="flex justify-between font-bold text-xs">
                    <span>#{o.orderNumber}</span>
                    <span>₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">{o.studentName} ({o.rollNumber})</div>
                  <button
                    onClick={() => updateStatus(o.id, 'PICKED_UP')}
                    className="w-full py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-sm hover:bg-emerald-700 transition flex items-center justify-center gap-1"
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
