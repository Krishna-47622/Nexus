import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { CartItem } from './CanteenMenu';
import { PlatformPaymentModal } from '../../components/payment/PlatformPaymentModal';
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  ShoppingBag,
  Store,
  CreditCard,
  Smartphone,
  RefreshCw,
  Bookmark,
  Info,
  X,
  Sparkles
} from 'lucide-react';

export const CanteenCart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('canteen_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [paymentMode, setPaymentMode] = useState<'PLATFORM_UPI' | 'ISTHARA'>('PLATFORM_UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIstharaModal, setShowIstharaModal] = useState(false);
  const [copiedSyncScript, setCopiedSyncScript] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Platform Payment Modal state
  const [showPlatformPayment, setShowPlatformPayment] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<{
    orderId: number;
    orderNumber: string;
    totalAmount: number;
    upiIntentUrl?: string;
  } | null>(null);

  const navigate = useNavigate();
  const toast = useToast();

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

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('canteen_cart');
  };

  // Prices: Exact match with Isthara sellingPrice & 5% GST
  const totalAmount = cart.reduce(
    (sum, ci) => sum + (ci.item.sellingPrice ?? ci.item.price) * ci.quantity,
    0
  );
  const totalBase = cart.reduce(
    (sum, ci) =>
      sum +
      (ci.item.basePrice ??
        Number(((ci.item.sellingPrice ?? ci.item.price) / 1.05).toFixed(2))) *
        ci.quantity,
    0
  );
  const totalTaxes = totalAmount - totalBase;
  const totalItemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  // Complete, valid Isthara Cart Payload formatted for USER_CART IndexedDB & localStorage
  const getIstharaCartItems = () => {
    return cart.map((ci) => {
      const it = ci.item;
      const itemId = it.istharaItemId || `item-${it.id}`;
      const vendorId = it.istharaVendorId || '3650ba30-e9fa-11f0-bc03-024d9959caad';
      const selling = it.sellingPrice ?? it.price;
      const base = it.basePrice ?? Number((selling / 1.05).toFixed(2));
      const taxVal = it.taxValue ?? Number((selling - base).toFixed(2));

      return {
        appItemId: itemId,
        id: itemId,
        itemId: itemId,
        name: it.name,
        itemName: it.name,
        price: base,
        sellingPrice: selling,
        markUpPrice: base,
        markUpTotalPrice: Number((base * ci.quantity).toFixed(2)),
        markUpTaxValue: taxVal,
        markUpTotalTax: Number((taxVal * ci.quantity).toFixed(2)),
        markUpTaxPerItem: taxVal,
        taxValue: taxVal,
        taxPerItem: taxVal,
        taxPercentPerItem: 5,
        itemQuantity: ci.quantity,
        showItemQuantity: ci.quantity,
        vendorId: vendorId,
        vendorName: it.vendorName || 'MR Food Court',
        foodCourtId: 'd656ce31-7db0-11ec-81b6-02d12e814022',
        siteId: 'ed38dfe1-7dae-11ec-81b6-02d12e814022',
        itemType: it.isVeg ? 'VEG' : 'NON_VEG',
        veg: !!it.isVeg,
        itemImageUrl: it.imageUrl || '',
        itemCategory: 'FOOD',
        itemStatus: 'VENDOR_AVAILABLE',
        taxCategory: 'NON_MRP',
        packagingCharge: 0,
        customizationPrice: 0,
        orderedItemCustomizations: [],
        isCartObject: true,
        isCustomizationRequired: false,
      };
    });
  };

  // Automated sync script for Isthara's IndexedDB USER_CART and LocalStorage
  // Uses exact AES-128-ECB encrypted food court tokens (key: 0123456789123456)
  // to prevent the "Could not get delivery info of the foodcourt" error
  const getIstharaSyncScript = () => {
    const istharaItems = getIstharaCartItems();
    return `(function(){try{var enc={"orderingFCId":"Hmm+cMbh3v3WzJUx2Kb19Oo3pbs2lru0QW0JDjNxjJfqIF/RO26i4LFkxpWr9WIX","foodCourtId":"Hmm+cMbh3v3WzJUx2Kb19Oo3pbs2lru0QW0JDjNxjJfqIF/RO26i4LFkxpWr9WIX","foodCourtName":"32/Nw/6Pre9D7xU0JZqyyNQAjrgQcBTGTBdmxUqh1Tc=","siteId":"hayiFJQooTZz3qcg8lhvo+o3pbs2lru0QW0JDjNxjJfqIF/RO26i4LFkxpWr9WIX","siteName":"IylDGyA0yfZcjEBpoTRlycbhbYCNB0iiPDu9UX1NpqA="};for(var k in enc){try{localStorage.setItem(k,enc[k]);}catch(_){}}var items=${JSON.stringify(
      istharaItems
    )};var req=window.indexedDB.open("USER_DETAILS",1);req.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains("USER_CART")){db.createObjectStore("USER_CART",{keyPath:"appItemId"});}};req.onsuccess=function(e){var db=e.target.result;var tx=db.transaction("USER_CART","readwrite");var store=tx.objectStore("USER_CART");store.clear();items.forEach(function(it){store.put(it);});tx.oncomplete=function(){try{var t=document.createElement("div");t.innerText="✓ Nexus Cart Synced ("+items.length+" items)";t.style.cssText="position:fixed;top:24px;left:50%;transform:translateX(-50%);background:#18181b;color:#fff;padding:10px 20px;border-radius:10px;font-family:sans-serif;font-size:13px;font-weight:600;z-index:999999;box-shadow:0 8px 20px rgba(0,0,0,0.25);";document.body.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},2500);}catch(_){}if(window.location.pathname.indexOf("/cart")!==-1){window.location.reload();}else{window.location.href="https://isthara.com/mbd/cart";}};tx.onerror=function(){window.location.href="https://isthara.com/mbd/cart";};};req.onerror=function(){window.location.href="https://isthara.com/mbd/cart";};}catch(err){window.location.href="https://isthara.com/mbd/cart";}})();`;
  };

  const handleCopySyncScript = () => {
    navigator.clipboard.writeText(getIstharaSyncScript());
    setCopiedSyncScript(true);
    toast.success('Sync script copied to clipboard!');
    setTimeout(() => setCopiedSyncScript(false), 2500);
  };

  // Text summary of items
  const getOrderSummaryText = () => {
    const lines = cart.map(
      (ci) =>
        `• ${ci.item.name} (${ci.item.vendorName || 'MR Food Court'}) × ${
          ci.quantity
        } = ₹${((ci.item.sellingPrice ?? ci.item.price) * ci.quantity).toFixed(2)}`
    );
    return `MR FOOD COURT - 1 (Malla Reddy University)\n${lines.join(
      '\n'
    )}\nItem Base: ₹${totalBase.toFixed(2)}\nTaxes (GST 5%): ₹${totalTaxes.toFixed(
      2
    )}\nTotal: ₹${totalAmount.toFixed(2)}`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(getOrderSummaryText());
    setCopiedSummary(true);
    toast.success('Order summary copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // 1. Isthara Checkout Handler (Auto-copies script and auto-opens Isthara cart tab)
  const handleIstharaCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const itemsPayload = cart.map((ci) => ({
        menuItemId: ci.item.id,
        quantity: ci.quantity,
      }));

      // Log in Nexus for tracking
      await api.post('/canteen/orders', {
        items: itemsPayload,
        paymentMethod: 'ISTHARA_APP',
      });
    } catch (_) {
      // Proceed even if offline
    } finally {
      // Auto-copy sync script to clipboard
      try {
        await navigator.clipboard.writeText(getIstharaSyncScript());
      } catch (_) {}

      // Open Isthara in new tab
      window.open('https://isthara.com/mbd/cart', '_blank');
      setShowIstharaModal(true);
      toast.success('Isthara cart opened & sync script auto-copied to clipboard!');
      setLoading(false);
    }
  };

  // 2. Platform Payment (UPI) Checkout Handler
  const handlePlatformUpiCheckout = async () => {
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
        paymentMethod: 'PLATFORM_UPI',
      });

      const serverAmount = res.data.totalAmount ? Number(res.data.totalAmount) : totalAmount;

      setPendingOrderData({
        orderId: res.data.id,
        orderNumber: res.data.orderNumber,
        totalAmount: serverAmount,
        upiIntentUrl: res.data.upiIntentUrl,
      });

      setShowPlatformPayment(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize platform payment.');
      toast.error('Failed to initialize platform payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    localStorage.removeItem('canteen_cart');
    setCart([]);
    setShowPlatformPayment(false);
    toast.success('Order successfully placed!');
    navigate('/app/canteen/orders');
  };

  const launchIstharaAndSync = () => {
    navigator.clipboard.writeText(getIstharaSyncScript());
    window.open('https://isthara.com/mbd/cart', '_blank');
    toast.success('Script copied to clipboard & Isthara cart opened!');
  };

  if (cart.length === 0 && !showPlatformPayment) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Your cart is empty
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Choose authentic dishes from MR Food Court - 1 to start your order.
          </p>
        </div>
        <div>
          <Link
            to="/app/canteen"
            className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Explore Live Menu
          </Link>
        </div>
      </div>
    );
  }

  const syncBookmarkletHref = `javascript:${getIstharaSyncScript()}`;

  return (
    <div className="space-y-6 pb-24 md:pb-12 text-zinc-900 dark:text-zinc-100">
      {/* ──────── TOP NAV & TITLE ──────── */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            to="/app/canteen"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Order Checkout
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              MR Food Court - 1 • {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-zinc-400 hover:text-rose-600 font-medium transition-colors inline-flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ──────── 2-COLUMN RESPONSIVE LAYOUT (Laptop 7:5, Mobile 1-Col) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
            Items in your cart ({totalItemCount})
          </div>

          <div className="space-y-2.5">
            {cart.map((ci, index) => {
              const item = ci.item;
              const selling = item.sellingPrice ?? item.price;
              const subtotal = selling * ci.quantity;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-100 dark:border-zinc-800"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-zinc-400 text-[10px] font-medium">
                        Food
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                          {item.vendorName || 'MR Food Court'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {item.name}
                      </h4>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        ₹{selling.toFixed(2)} × {ci.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Subtotal */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        ₹{subtotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-800 shadow-xs">
                      <button
                        onClick={() => updateQty(index, -1)}
                        className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 min-w-[20px] text-center">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(index, 1)}
                        className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(index)}
                      className="text-zinc-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/app/canteen"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add more dishes from Food Court
            </Link>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Payment Selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Payment & Checkout Options
            </h3>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label
                onClick={() => setPaymentMode('PLATFORM_UPI')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  paymentMode === 'PLATFORM_UPI'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50/70 dark:bg-zinc-800/70 ring-1 ring-zinc-900 dark:ring-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMode === 'PLATFORM_UPI'}
                  onChange={() => setPaymentMode('PLATFORM_UPI')}
                  className="mt-0.5 text-zinc-900 focus:ring-zinc-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" /> Direct UPI / QR Pay
                    </span>
                    <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
                      Instant Token
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Pay via GPay, PhonePe, Paytm to UPI ID <code className="text-zinc-800 dark:text-zinc-200 font-mono font-bold">9398979155-1@superyes</code> and get counter pickup token.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMode('ISTHARA')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  paymentMode === 'ISTHARA'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50/70 dark:bg-zinc-800/70 ring-1 ring-zinc-900 dark:ring-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMode === 'ISTHARA'}
                  onChange={() => setPaymentMode('ISTHARA')}
                  className="mt-0.5 text-zinc-900 focus:ring-zinc-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" /> Isthara Web / App Sync
                    </span>
                    <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                      Auto Transfer
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Opens Isthara cart tab with script auto-copied to clipboard for 1-click execution.
                  </p>
                </div>
              </label>
            </div>

            {/* Bill Summary */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Items Base Total</span>
                <span>₹{totalBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>GST (5%)</span>
                <span>₹{totalTaxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Packaging & Platform Fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">FREE (₹0.00)</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between items-baseline font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <span>To Pay</span>
                <span className="text-base text-zinc-900 dark:text-zinc-50">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div>
              {paymentMode === 'PLATFORM_UPI' ? (
                <button
                  onClick={handlePlatformUpiCheckout}
                  disabled={loading}
                  className="w-full py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)} via UPI QR`}
                </button>
              ) : (
                <button
                  onClick={handleIstharaCheckout}
                  disabled={loading}
                  className="w-full py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {loading ? 'Preparing Cart...' : 'Open Isthara Cart & Copy Script'}
                </button>
              )}
            </div>
          </div>

          {/* Isthara 1-Click Sync Bridge Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" /> Isthara Cart Sync Bridge
              </span>
              <span className="text-[10px] text-zinc-400">1-Click Auto Sync</span>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Drag the button below to your browser bookmarks bar. When on Isthara, click the bookmark to sync your items into Isthara's cart immediately without opening the console:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <a
                href={syncBookmarkletHref}
                onClick={(e) => {
                  e.preventDefault();
                  handleCopySyncScript();
                }}
                draggable="true"
                title="Drag to bookmarks bar"
                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-grab transition-colors"
              >
                ★ Sync Isthara Cart
              </a>

              <button
                onClick={handleCopySyncScript}
                className="px-3 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedSyncScript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Sync Code
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Sync Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ──────── PLATFORM PAYMENT MODAL ──────── */}
      {showPlatformPayment && pendingOrderData && (
        <PlatformPaymentModal
          isOpen={showPlatformPayment}
          onClose={() => setShowPlatformPayment(false)}
          amount={pendingOrderData.totalAmount ?? totalAmount}
          orderNumber={pendingOrderData.orderNumber}
          orderId={pendingOrderData.orderId}
          upiVpa="9398979155-1@superyes"
          module="CANTEEN"
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* ──────── ISTHARA REDIRECT / SYNC MODAL ──────── */}
      {showIstharaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Isthara Cart Sync Ready
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    MR Food Court - 1 items & campus tokens prepared
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIstharaModal(false)}
                className="w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Script Auto-Copied to Clipboard!</strong> Isthara has been opened in a new tab. Paste the script in the console to populate your cart with the exact items.
                </span>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2.5">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                  Two ways to run it:
                </div>
                <div className="space-y-2 text-zinc-600 dark:text-zinc-400 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong>Console (Fastest):</strong> On the newly opened Isthara tab, press <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">F12</kbd> (Console), press <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">Ctrl+V</kbd> and hit <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">Enter</kbd>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong>1-Click Bookmarklet (No Console):</strong> Drag the <strong>"★ Sync Isthara Cart"</strong> button below to your bookmarks bar. On Isthara, click that bookmark anytime!
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={launchIstharaAndSync}
                  className="w-full py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Re-open Isthara Cart & Copy Script
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={syncBookmarkletHref}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopySyncScript();
                    }}
                    draggable="true"
                    title="Drag to bookmarks bar"
                    className="py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 cursor-grab transition-colors"
                  >
                    ★ Bookmarklet (Drag Me)
                  </a>

                  <button
                    onClick={handleCopySyncScript}
                    className="py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium text-xs hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedSyncScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Script
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
