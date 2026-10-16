import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Utensils, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Store, 
  Filter, 
  RefreshCw,
  ShoppingBag,
  ChefHat
} from 'lucide-react';

interface OrderItem {
  id: number;
  menuItemId?: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  vendorName?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  studentName: string;
  rollNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  items: OrderItem[];
  vendors?: string[];
  createdAt: string;
}

export const CanteenStaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Persisted franchise filter preference
  const [selectedFranchise, setSelectedFranchise] = useState<string>(() => {
    return localStorage.getItem('canteen_active_franchise') || 'ALL';
  });

  // Standard franchises in MR Food Court - 1
  const standardFranchises = [
    'ALL',
    'Burger Haven',
    'DL Kitchen',
    'SHIVAN FOODS',
    'Brown Bear',
    'MR Food Court'
  ];

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, [selectedFranchise]);

  const fetchQueue = () => {
    const params = selectedFranchise !== 'ALL' ? { franchise: selectedFranchise } : {};
    api.get('/canteen/staff/orders', { params })
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error('Error fetching canteen orders queue:', err))
      .finally(() => setLoading(false));
  };

  const handleSelectFranchise = (franchise: string) => {
    setSelectedFranchise(franchise);
    localStorage.setItem('canteen_active_franchise', franchise);
    setLoading(true);
  };

  const updateStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.patch(`/canteen/staff/orders/${orderId}/status`, { status: nextStatus });
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const newOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="space-y-6">
      {/* ─── HEADER & CONTROLS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-zinc-800" />
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">Kitchen Order Kanban</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time incoming student food orders segmented by outlet
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ─── FRANCHISE / OUTLET SELECTOR BAR ─── */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
          <span className="flex items-center gap-1.5 text-zinc-800 font-bold">
            <Store className="w-4 h-4 text-zinc-500" />
            Select Kitchen Franchise / Counter Station:
          </span>
          {selectedFranchise !== 'ALL' && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Filtering ONLY: {selectedFranchise}
            </span>
          )}
        </div>

        {/* Franchise Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {standardFranchises.map((f) => {
            const isSelected = selectedFranchise === f;
            return (
              <button
                key={f}
                onClick={() => handleSelectFranchise(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                <Store className="w-3 h-3 opacity-70" />
                <span>{f === 'ALL' ? 'All Outlets (Food Court Overview)' : f}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── KANBAN BOARD ─── */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500 shadow-xs">
          Loading live kitchen orders...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ────── Column 1: New Incoming Orders ────── */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-900">New Orders</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs font-bold rounded-md">
                {newOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {newOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-amber-700/60 font-medium italic">
                  No new orders waiting
                </div>
              ) : (
                newOrders.map((o) => (
                  <div key={o.id} className="bg-white border border-amber-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="font-mono text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        #{o.orderNumber}
                      </span>
                      <span className="text-zinc-900 font-mono font-bold text-sm">
                        ₹{Number(o.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 flex items-center justify-between">
                      <span className="font-semibold text-zinc-800">{o.studentName}</span>
                      <span className="font-mono text-[11px] text-zinc-400">{o.rollNumber}</span>
                    </div>

                    {/* Order Items */}
                    <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 space-y-1.5 text-xs">
                      {o.items.map((i) => (
                        <div key={i.id} className="flex items-center justify-between">
                          <span className="font-medium text-zinc-800">
                            <span className="font-bold text-zinc-900 font-mono">{i.quantity}x</span> {i.itemName}
                          </span>
                          {i.vendorName && (
                            <span className="text-[10px] font-medium text-zinc-500 bg-white px-1.5 py-0.2 rounded border border-zinc-200">
                              {i.vendorName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateStatus(o.id, 'PREPARING')}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Start Preparing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ────── Column 2: In Preparation ────── */}
          <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-blue-900">Preparing</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-900 text-xs font-bold rounded-md">
                {preparingOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {preparingOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-blue-700/60 font-medium italic">
                  No orders currently in preparation
                </div>
              ) : (
                preparingOrders.map((o) => (
                  <div key={o.id} className="bg-white border border-blue-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="font-mono text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        #{o.orderNumber}
                      </span>
                      <span className="text-zinc-900 font-mono font-bold text-sm">
                        ₹{Number(o.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 flex items-center justify-between">
                      <span className="font-semibold text-zinc-800">{o.studentName}</span>
                      <span className="font-mono text-[11px] text-zinc-400">{o.rollNumber}</span>
                    </div>

                    {/* Order Items */}
                    <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 space-y-1.5 text-xs">
                      {o.items.map((i) => (
                        <div key={i.id} className="flex items-center justify-between">
                          <span className="font-medium text-zinc-800">
                            <span className="font-bold text-zinc-900 font-mono">{i.quantity}x</span> {i.itemName}
                          </span>
                          {i.vendorName && (
                            <span className="text-[10px] font-medium text-zinc-500 bg-white px-1.5 py-0.2 rounded border border-zinc-200">
                              {i.vendorName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateStatus(o.id, 'READY')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ────── Column 3: Ready for Pickup ────── */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-900">Ready for Pickup</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-xs font-bold rounded-md">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {readyOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-700/60 font-medium italic">
                  No orders waiting for pickup
                </div>
              ) : (
                readyOrders.map((o) => (
                  <div key={o.id} className="bg-white border border-emerald-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="font-mono text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        #{o.orderNumber}
                      </span>
                      <span className="text-zinc-900 font-mono font-bold text-sm">
                        ₹{Number(o.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 flex items-center justify-between">
                      <span className="font-semibold text-zinc-800">{o.studentName}</span>
                      <span className="font-mono text-[11px] text-zinc-400">{o.rollNumber}</span>
                    </div>

                    {/* Order Items */}
                    <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 space-y-1.5 text-xs">
                      {o.items.map((i) => (
                        <div key={i.id} className="flex items-center justify-between">
                          <span className="font-medium text-zinc-800">
                            <span className="font-bold text-zinc-900 font-mono">{i.quantity}x</span> {i.itemName}
                          </span>
                          {i.vendorName && (
                            <span className="text-[10px] font-medium text-zinc-500 bg-white px-1.5 py-0.2 rounded border border-zinc-200">
                              {i.vendorName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateStatus(o.id, 'COMPLETED')}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Handed Over / Completed</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CanteenStaffOrders;
