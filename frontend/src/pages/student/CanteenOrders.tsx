import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Utensils, RefreshCw, CheckCircle2, Clock, PackageCheck, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  upiTxnRef: string;
  items: OrderItem[];
  createdAt: string;
}

export const CanteenOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Live status update polling
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = () => {
    api.get('/canteen/orders/my')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  const getStepperIndex = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PLACED': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'PICKED_UP': return 4;
      default: return 0;
    }
  };

  const activeOrders = orders.filter((o) => ['PLACED', 'PREPARING', 'READY'].includes(o.status.toUpperCase()));
  const pastOrders = orders.filter((o) => ['PICKED_UP', 'CANCELLED'].includes(o.status.toUpperCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Canteen Orders</h2>
        <Link to="/app/canteen" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          <ShoppingBag className="w-3.5 h-3.5" /> Menu
        </Link>
      </div>

      {/* Active Orders Stepper UI */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Order Stepper</h3>
          {activeOrders.map((o) => {
            const step = getStepperIndex(o.status);
            return (
              <div key={o.id} className="bg-white border-2 border-primary p-4 rounded-sm space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">Order #{o.orderNumber}</span>
                    <p className="text-[11px] text-slate-500">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="font-extrabold text-sm text-primary">₹{o.totalAmount.toFixed(2)}</span>
                </div>

                {/* 4-Step Visual Stepper */}
                <div className="grid grid-cols-4 gap-1 text-center py-2 relative">
                  <div className={`space-y-1 ${step >= 1 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}>1</div>
                    <div className="text-[10px]">Placed</div>
                  </div>
                  <div className={`space-y-1 ${step >= 2 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>2</div>
                    <div className="text-[10px]">Preparing</div>
                  </div>
                  <div className={`space-y-1 ${step >= 3 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200'}`}>3</div>
                    <div className="text-[10px]">Ready</div>
                  </div>
                  <div className={`space-y-1 ${step >= 4 ? 'text-primary font-bold' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs ${step >= 4 ? 'bg-primary text-white' : 'bg-slate-200'}`}>4</div>
                    <div className="text-[10px]">Picked Up</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm text-xs space-y-1">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span>{i.quantity}x {i.itemName}</span>
                      <span className="font-semibold">₹{(i.quantity * i.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Order History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Order History</h3>
        {loading ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            Loading past orders...
          </div>
        ) : pastOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 p-6 rounded-sm text-center text-xs text-slate-500">
            No completed past orders.
          </div>
        ) : (
          <div className="space-y-2">
            {pastOrders.map((o) => (
              <div key={o.id} className="bg-white border border-slate-200 p-3 rounded-sm space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">#{o.orderNumber}</span>
                    <span className="text-slate-400 ml-2">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-bold text-slate-800">₹{o.totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-slate-600">
                  {o.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
