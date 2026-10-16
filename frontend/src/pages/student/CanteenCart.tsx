import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
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
  Info
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
    (sum, ci) => sum + (ci.item.basePrice ?? Number(((ci.item.sellingPrice ?? ci.item.price) / 1.05).toFixed(2))) * ci.quantity,
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
  const getIstharaSyncScript = () => {
    const istharaItems = getIstharaCartItems();
    return `(function(){try{var items=${JSON.stringify(istharaItems)};localStorage.setItem("orderingFCId","d656ce31-7db0-11ec-81b6-02d12e814022");localStorage.setItem("foodCourtId","d656ce31-7db0-11ec-81b6-02d12e814022");localStorage.setItem("foodCourtName","MR+FOOD+COURT+-+1");localStorage.setItem("siteId","ed38dfe1-7dae-11ec-81b6-02d12e814022");var req=window.indexedDB.open("USER_DETAILS",1);req.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains("USER_CART")){db.createObjectStore("USER_CART",{keyPath:"appItemId"});}};req.onsuccess=function(e){var db=e.target.result;var tx=db.transaction("USER_CART","readwrite");var store=tx.objectStore("USER_CART");store.clear();items.forEach(function(it){store.put(it);});tx.oncomplete=function(){if(window.location.pathname.indexOf("/cart")!==-1){window.location.reload();}else{window.location.href="https://isthara.com/mbd/cart";}};tx.onerror=function(){window.location.href="https://isthara.com/mbd/cart";};};req.onerror=function(){window.location.href="https://isthara.com/mbd/cart";};}catch(err){window.location.href="https://isthara.com/mbd/cart";}})();`;
  };

  const handleCopySyncScript = () => {
    navigator.clipboard.writeText(getIstharaSyncScript());
    setCopiedSyncScript(true);
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
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // 1. Isthara Checkout Handler
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

      // Auto-copy sync script to clipboard
      try {
        navigator.clipboard.writeText(getIstharaSyncScript());
      } catch (_) {}

      setShowIstharaModal(true);
    } catch (err: any) {
      setShowIstharaModal(true);
    } finally {
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

      setPendingOrderData({
        orderId: res.data.id,
        orderNumber: res.data.orderNumber,
        totalAmount: res.data.totalAmount,
        upiIntentUrl: res.data.upiIntentUrl,
      });

      setShowPlatformPayment(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize platform payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    localStorage.removeItem('canteen_cart');
    setCart([]);
    setShowPlatformPayment(false);
    navigate('/app/canteen/orders');
  };

  const launchIstharaAndSync = () => {
    navigator.clipboard.writeText(getIstharaSyncScript());
    window.open('https://isthara.com/mbd/cart', '_blank');
  };

  if (cart.length === 0 && !showPlatformPayment) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Your cart is empty</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Choose dishes from MR Food Court - 1 to start your order.
          </p>
        </div>
        <div>
          <Link to="/app/canteen" className="clay-btn text-xs inline-flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            Explore Live Menu
          </Link>
        </div>
      </div>
    );
  }

  const syncBookmarkletHref = `javascript:${getIstharaSyncScript()}`;

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* ──────── TOP NAV & TITLE ──────── */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/canteen"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            title="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Order Checkout
            </h1>
            <p className="text-xs text-zinc-500">
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
        <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ──────── 2-COLUMN RESPONSIVE LAYOUT (Laptop 7:5, Mobile 1-Col) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
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
                  className="bg-white border border-zinc-200/90 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-100"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-400 text-[10px] font-medium">
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
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {item.vendorName || 'MR Food Court'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                        {item.name}
                      </h4>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        ₹{selling.toFixed(2)} × {ci.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Subtotal */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-900">
                        ₹{subtotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <button
                        onClick={() => updateQty(index, -1)}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-100 transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-zinc-900 min-w-[20px] text-center">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(index, 1)}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-100 transition-colors"
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
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add more dishes from Food Court
            </Link>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Payment Selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-zinc-900">Payment & Checkout Options</h3>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label
                onClick={() => setPaymentMode('PLATFORM_UPI')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  paymentMode === 'PLATFORM_UPI'
                    ? 'border-zinc-900 bg-zinc-50/70 ring-1 ring-zinc-900'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50/50'
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
                    <span className="font-semibold text-xs text-zinc-900 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-zinc-800" /> Direct UPI / QR Pay
                    </span>
                    <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                      Instant Token
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Pay via GPay, PhonePe, Paytm to UPI ID <code className="text-zinc-800 font-mono font-bold">9398979155-1@superyes</code> and get counter pickup token.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMode('ISTHARA')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  paymentMode === 'ISTHARA'
                    ? 'border-zinc-900 bg-zinc-50/70 ring-1 ring-zinc-900'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50/50'
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
                    <span className="font-semibold text-xs text-zinc-900 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-800" /> Isthara Web / App Sync
                    </span>
                    <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 px-1.5 py-0.5 rounded">
                      Auto Transfer
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Transfers your exact selected items to the Isthara food court cart for direct checkout in Isthara.
                  </p>
                </div>
              </label>
            </div>

            {/* Bill Summary */}
            <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Items Base Total</span>
                <span>₹{totalBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>GST (5%)</span>
                <span>₹{totalTaxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Packaging & Platform Fee</span>
                <span className="text-emerald-600 font-medium">FREE (₹0.00)</span>
              </div>
              <div className="border-t border-zinc-200 pt-2 flex justify-between items-baseline font-bold text-sm text-zinc-900">
                <span>To Pay</span>
                <span className="text-base">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div>
              {paymentMode === 'PLATFORM_UPI' ? (
                <button
                  onClick={handlePlatformUpiCheckout}
                  disabled={loading}
                  className="w-full py-3 bg-zinc-900 text-white rounded-lg font-semibold text-xs hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)} via UPI QR`}
                </button>
              ) : (
                <button
                  onClick={handleIstharaCheckout}
                  disabled={loading}
                  className="w-full py-3 bg-zinc-900 text-white rounded-lg font-semibold text-xs hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {loading ? 'Preparing Cart...' : 'Transfer to Isthara Cart & Pay'}
                </button>
              )}
            </div>
          </div>

          {/* Isthara 1-Click Sync Bridge Card */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-zinc-800" /> Isthara Cart Sync Bridge
              </span>
              <span className="text-[10px] text-zinc-400">1-Click Cross-Domain</span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Drag the button below to your browser bookmarks bar. When on Isthara, click the bookmark to sync your items into Isthara's cart immediately:
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
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-grab transition-colors"
              >
                ★ Sync Isthara Cart
              </a>

              <button
                onClick={handleCopySyncScript}
                className="px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
          amount={pendingOrderData.totalAmount}
          orderNumber={pendingOrderData.orderNumber}
          orderId={pendingOrderData.orderId}
          upiVpa="9398979155-1@superyes"
          module="CANTEEN"
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* ──────── ISTHARA REDIRECT / SYNC MODAL ──────── */}
      {showIstharaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">Isthara Cart Sync Ready</h3>
                  <p className="text-[11px] text-zinc-500">MR Food Court - 1 items prepared</p>
                </div>
              </div>
              <button
                onClick={() => setShowIstharaModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                <div className="font-semibold text-zinc-900">How to view your synced cart in Isthara:</div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-600 text-[11px]">
                  <li>Click <strong>"Open Isthara Cart & Sync"</strong> below (the sync script is already copied).</li>
                  <li>On the Isthara page, paste into the browser address bar or DevTools Console (F12) and press Enter.</li>
                  <li>Your exact items and prices will immediately appear ready for payment!</li>
                </ol>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={launchIstharaAndSync}
                  className="w-full py-2.5 bg-zinc-900 text-white rounded-lg font-medium text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Isthara Cart & Sync
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopySyncScript}
                    className="py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg font-medium text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5"
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

                  <button
                    onClick={handleCopySummary}
                    className="py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg font-medium text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Text
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Order Text
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
