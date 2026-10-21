import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { OrderTrackerStepper } from '../../components/common/OrderTrackerStepper';
import { Utensils, RefreshCw, ShoppingBag, ArrowRight, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

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
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = () => {
    api.get('/canteen/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const activeOrders = orders.filter((o) => ['PLACED', 'PREPARING', 'READY'].includes(o.status.toUpperCase()));
  const pastOrders = orders.filter((o) => ['PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.status.toUpperCase()));

  const handleReorder = (order: Order) => {
    try {
      const existingCartStr = localStorage.getItem('canteen_cart');
      const existingCart = existingCartStr ? JSON.parse(existingCartStr) : [];
      
      const newItems = order.items.map((i) => ({
        item: {
          id: i.id,
          name: i.itemName,
          price: i.unitPrice,
          sellingPrice: i.unitPrice,
          category: 'Dining',
          isAvailable: true,
        },
        quantity: i.quantity,
      }));

      // Combine or replace
      localStorage.setItem('canteen_cart', JSON.stringify([...existingCart, ...newItems]));
      toast.success(`Added ${order.items.length} items from Order #${order.orderNumber} to your cart!`);
      navigate('/app/canteen/cart');
    } catch {
      toast.error('Could not repopulate cart.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Canteen Orders & Live Tokens
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time kitchen preparation status and order history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/app/canteen"
            className="clay-btn text-xs px-3.5 py-2 hover-lift flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Order Food
          </Link>
        </div>
      </div>

      {/* Active Orders with Live Stepper */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live In-Progress Orders ({activeOrders.length})
            </h3>
            <span className="text-[11px] text-zinc-400">Auto-updating every 5s</span>
          </div>

          <div className="space-y-4">
            {activeOrders.map((o) => (
              <div key={o.id} className="space-y-3">
                <OrderTrackerStepper
                  status={o.status}
                  orderNumber={o.orderNumber}
                  counterName="MR Food Court - Counter 1"
                  timestamp={new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />

                <div className="clay-card p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span>Ordered Items</span>
                    <span>Total: ₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                        <span>{i.quantity}x {i.itemName}</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{(i.quantity * i.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
          Past Order History
        </h3>
        {loading ? (
          <div className="clay-card p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Checking your orders...
          </div>
        ) : pastOrders.length === 0 ? (
          <div className="clay-card p-8 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
            <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-1" />
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">No completed orders yet</p>
            <p className="text-[11px]">When your food orders are picked up, they will be archived here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((o) => (
              <div
                key={o.id}
                className="clay-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover-lift"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Order #{o.orderNumber}
                    </span>
                    <span className="clay-badge-mint text-[10px] font-semibold">
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {o.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {new Date(o.createdAt).toLocaleDateString()} at{' '}
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    ₹{o.totalAmount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleReorder(o)}
                    className="clay-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 hover-lift"
                    title="Add items to cart"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
