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
    const interval = setInterval(fetchOrders, 5000);
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
  const stepLabels = ['Placed', 'Preparing', 'Ready', 'Picked Up'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-ink">Canteen Orders</h2>
        <Link to="/app/canteen" className="clay-badge-indigo text-[10px] hover:shadow-clay-card transition-shadow">
          <ShoppingBag className="w-3 h-3" /> Menu
        </Link>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest px-1">Active Order Stepper</h3>
          {activeOrders.map((o) => {
            const step = getStepperIndex(o.status);
            return (
              <div key={o.id} className="clay-card !shadow-clay-lg border-2 !border-clay-indigo/20 p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-clay-bg pb-3">
                  <div>
                    <span className="font-bold text-sm text-ink">Order #{o.orderNumber}</span>
                    <p className="text-[11px] text-ink-soft">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="font-extrabold text-sm text-clay-indigo">₹{o.totalAmount.toFixed(2)}</span>
                </div>

                {/* Clay Stepper */}
                <div className="grid grid-cols-4 gap-1 text-center py-2">
                  {stepLabels.map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = step >= stepNum;
                    return (
                      <div key={label} className={`space-y-1.5 ${isActive ? 'text-clay-indigo font-bold' : 'text-ink-muted'}`}>
                        <div className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center text-xs font-extrabold transition-all ${
                          isActive ? 'bg-clay-indigo text-white shadow-clay-btn' : 'bg-clay-bg shadow-clay-inset'
                        }`}>
                          {stepNum}
                        </div>
                        <div className="text-[9px]">{label}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-clay-bg/60 p-3 rounded-2xl shadow-clay-inset text-xs space-y-1">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span className="text-ink-soft">{i.quantity}x {i.itemName}</span>
                      <span className="font-bold text-ink">₹{(i.quantity * i.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Orders */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest px-1">Order History</h3>
        {loading ? (
          <div className="clay-card p-6 text-center text-xs text-ink-soft animate-clay-pulse">
            Loading past orders...
          </div>
        ) : pastOrders.length === 0 ? (
          <div className="clay-card p-6 text-center text-xs text-ink-soft">
            No completed past orders.
          </div>
        ) : (
          <div className="space-y-2.5">
            {pastOrders.map((o) => (
              <div key={o.id} className="clay-card p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-ink">#{o.orderNumber}</span>
                    <span className="text-ink-muted ml-2">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-extrabold text-ink">₹{o.totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-ink-soft">
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
