import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CartItem } from './CanteenMenu';
import { Plus, Minus, Trash2, ArrowLeft, CheckCircle2, QrCode } from 'lucide-react';

export const CanteenCart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('canteen_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('GPay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('canteen_cart', JSON.stringify(cart));
  }, [cart]);

  const updateQty = (index: number, delta: number) => {
    const newCart = [...cart];
    const newQty = newCart[index].quantity + delta;
    if (newQty <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = newQty;
    }
    setCart(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const itemsPayload = cart.map((ci) => ({
        menuItemId: ci.item.id,
        quantity: ci.quantity,
      }));

      const res = await api.post('/canteen/orders', {
        items: itemsPayload,
        paymentMethod: 'UPI',
      });

      // Clear cart
      localStorage.removeItem('canteen_cart');

      // Launch UPI intent if available
      if (res.data.upiIntentUrl) {
        window.location.href = res.data.upiIntentUrl;
      }

      navigate('/app/canteen/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-4 text-center py-12">
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Add food items from the canteen menu to place an order.</p>
        <Link
          to="/app/canteen"
          className="inline-block px-4 py-2 bg-primary text-white font-semibold text-xs rounded-sm hover:bg-primary-dark"
        >
          Return to Canteen Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/app/canteen" className="p-1 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Checkout & Payment</h2>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* Cart Item Summary Table */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Order Summary</h3>
        <div className="divide-y divide-slate-100">
          {cart.map((ci, idx) => (
            <div key={ci.item.id} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">{ci.item.name}</div>
                <div className="text-[11px] text-slate-500">₹{ci.item.price.toFixed(2)} each</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-sm bg-slate-50">
                  <button onClick={() => updateQty(idx, -1)} className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2.5 text-xs font-bold text-slate-900">{ci.quantity}</span>
                  <button onClick={() => updateQty(idx, 1)} className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="w-16 text-right font-bold text-xs text-slate-900">
                  ₹{(ci.item.price * ci.quantity).toFixed(2)}
                </div>
                <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
          <span>Total Order Amount</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* UPI Passthrough Selector */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select UPI Payment Application</h3>
        <p className="text-[11px] text-slate-500">
          Direct intent passthrough to your payment app. Zero stored wallet liability.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {['GPay', 'PhonePe', 'Paytm'].map((app) => (
            <button
              key={app}
              type="button"
              onClick={() => setSelectedUpiApp(app)}
              className={`p-3 border rounded-sm text-xs font-bold transition flex flex-col items-center gap-1 ${
                selectedUpiApp === app
                  ? 'border-primary bg-blue-50 text-primary'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              {app}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || !selectedUpiApp}
        className="w-full py-3 bg-primary text-white font-bold text-sm rounded-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        {loading ? 'Processing Order...' : `Pay ₹${totalAmount.toFixed(2)} via ${selectedUpiApp}`}
      </button>
    </div>
  );
};
