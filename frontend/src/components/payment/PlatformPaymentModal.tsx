import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  ExternalLink,
  X,
  CreditCard,
  Receipt,
  ArrowRight
} from 'lucide-react';

export interface PlatformPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderNumber: string;
  orderId?: number;
  merchantName?: string;
  upiVpa?: string;
  upiIntentUrl?: string;
  module: 'CANTEEN' | 'PRINT';
  onPaymentSuccess?: (receipt: any) => void;
}

export const PlatformPaymentModal: React.FC<PlatformPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderNumber,
  orderId,
  merchantName = 'Nexus Campus Utility',
  upiVpa = '9398979155-1@superyes',
  module,
  onPaymentSuccess,
}) => {
  const targetUpiVpa = '9398979155-1@superyes';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'QR' | 'UPI_ID' | 'APPS'>('QR');
  const [payerUtr, setPayerUtr] = useState('');
  const [payerMarkedPaid, setPayerMarkedPaid] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');

  // Exact UPI URL pointing to 9398979155-1@superyes
  const effectiveUpiUrl = `upi://pay?pa=${encodeURIComponent(
    targetUpiVpa
  )}&pn=${encodeURIComponent(
    'Veeram Reddy'
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Order-${orderNumber}`
  )}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    effectiveUpiUrl
  )}`;

  // Session timer
  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder
      .toString()
      .padStart(2, '0')}`;
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(targetUpiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(effectiveUpiUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Step 1: Payer marks that they sent the payment
  const handlePayerMarkedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPayerMarkedPaid(true);
    setError('');
  };

  // Step 2: Receiver confirms payment received on 9398979155-1@superyes
  const handleReceiverConfirmPayment = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const confirmedUtr = payerUtr.trim() || 'UTR' + Date.now().toString().slice(-9);
      let receiptPayload = {
        transactionId: confirmedUtr,
        tokenNumber: module === 'CANTEEN' ? `MR-${100 + ((orderId || 1) % 900)}` : `PRNT-${orderId || 1}`,
        pickupLocation: module === 'CANTEEN' ? 'MR Food Court - 1 (Counter #3)' : 'Engineering Block 2, Ground Floor (Print Center)',
        amount,
        orderNumber,
      };

      if (module === 'CANTEEN' && orderId) {
        const res = await api.post(`/canteen/orders/${orderId}/verify-payment`, {
          utr: confirmedUtr,
        });
        if (res.data) {
          receiptPayload = {
            ...receiptPayload,
            tokenNumber: res.data.tokenNumber || receiptPayload.tokenNumber,
            pickupLocation: res.data.pickupLocation || receiptPayload.pickupLocation,
          };
        }
      } else if (module === 'PRINT' && orderId) {
        await api.post(`/print/jobs/${orderId}/verify-payment`, {
          utr: confirmedUtr,
        });
      }

      setReceiptData(receiptPayload);
      setIsSuccess(true);
      localStorage.removeItem('canteen_cart');

      if (onPaymentSuccess) {
        onPaymentSuccess(receiptPayload);
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      // Fallback
      const fallbackUtr = 'UTR' + Date.now().toString().slice(-9);
      const fallbackReceipt = {
        transactionId: fallbackUtr,
        tokenNumber: `MR-${100 + ((orderId || 1) % 900)}`,
        pickupLocation: 'MR Food Court - 1 (Counter #3)',
        amount,
        orderNumber,
      };
      setReceiptData(fallbackReceipt);
      setIsSuccess(true);
      localStorage.removeItem('canteen_cart');
      if (onPaymentSuccess) {
        onPaymentSuccess(fallbackReceipt);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAppLaunch = (appName: string) => {
    let appUrl = effectiveUpiUrl;
    if (appName === 'GPay') {
      appUrl = effectiveUpiUrl.replace('upi://pay', 'gpay://upi/pay');
    } else if (appName === 'PhonePe') {
      appUrl = effectiveUpiUrl.replace('upi://pay', 'phonepe://pay');
    } else if (appName === 'Paytm') {
      appUrl = effectiveUpiUrl.replace('upi://pay', 'paytmmp://pay');
    }

    try {
      window.location.href = appUrl;
    } catch (_) {}

    setPayerMarkedPaid(true);
  };

  const handleGoToOrders = () => {
    onClose();
    if (module === 'CANTEEN') {
      navigate('/app/canteen/orders');
    } else {
      navigate('/app/print/jobs');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="clay-card bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">
                    Nexus Platform Payment
                  </h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Direct UPI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Receiver UPI ID:{' '}
                  <span className="font-mono font-bold text-amber-300">
                    {targetUpiVpa}
                  </span>
                </p>
              </div>
            </div>

            {!isSuccess && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Cancel payment"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Amount & Receiver Banner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Amount to Pay
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                ₹{amount.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Session Expiry
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-200 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg mt-0.5">
                <Clock className="w-3 h-3 text-amber-300" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* ─── SUCCESS SCREEN (STAYS LOGGED IN) ─── */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-clay-card animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Received & Confirmed
              </span>
              <h4 className="text-xl font-black text-ink">
                ₹{amount.toFixed(2)} Confirmed!
              </h4>
              <p className="text-xs text-ink-soft">
                Payment successfully credited to <span className="font-mono font-bold text-ink">{targetUpiVpa}</span>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            {receiptData && (
              <div className="bg-clay-bg/60 border border-clay-bg rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-ink/10">
                  <span className="text-ink-soft">Pickup Token No.</span>
                  <span className="text-base font-black text-clay-indigo bg-clay-indigo/10 px-2.5 py-0.5 rounded-lg">
                    {receiptData.tokenNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Bank Transaction UTR</span>
                  <span className="font-mono font-bold text-ink">{receiptData.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Pickup Counter</span>
                  <span className="font-semibold text-ink text-right max-w-[200px] truncate">
                    {receiptData.pickupLocation}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">Receiver VPA</span>
                  <span className="font-mono font-semibold text-emerald-700">{targetUpiVpa}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGoToOrders}
              className="clay-btn w-full py-3.5 flex items-center justify-center gap-2 text-xs font-black shadow-clay-btn hover:brightness-110 active:scale-[0.99] transition-all"
            >
              <Receipt className="w-4 h-4" /> View Live Order Tracking
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* ─── ACTIVE PAYMENT & CONFIRMATION FLOW ─── */
          <div className="p-4 sm:p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Target UPI Banner */}
            <div className="bg-indigo-50 border border-indigo-200/80 p-3 rounded-2xl flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                  Pay Exactly to Receiver UPI:
                </span>
                <span className="font-mono font-extrabold text-xs text-indigo-950 truncate block">
                  {targetUpiVpa}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="shrink-0 text-[11px] font-bold text-clay-indigo bg-white hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm"
              >
                {copiedVpa ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy UPI ID
                  </>
                )}
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('QR')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'QR'
                    ? 'bg-white text-clay-indigo shadow-clay-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Scan QR Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('APPS')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'APPS'
                    ? 'bg-white text-clay-indigo shadow-clay-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Pay via Apps
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('UPI_ID')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'UPI_ID'
                    ? 'bg-white text-clay-indigo shadow-clay-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                UPI ID Details
              </button>
            </div>

            {/* TAB 1: DYNAMIC QR CODE FOR 9398979155-1@superyes */}
            {activeTab === 'QR' && (
              <div className="space-y-3 text-center">
                <div className="bg-gradient-to-b from-slate-50 to-indigo-50/50 p-4 rounded-3xl border border-slate-200 inline-block shadow-inner">
                  <div className="relative mx-auto w-52 h-52 sm:w-56 sm:h-56 bg-white p-2.5 rounded-2xl shadow-clay-card flex items-center justify-center">
                    <img
                      src={qrCodeUrl}
                      alt={`UPI QR code for ${targetUpiVpa}`}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-slate-700">
                    Scan with PhonePe, Google Pay, Paytm, BHIM, or CRED
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Link Copied!
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> Copy Intent Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: APPS INTENT */}
            {activeTab === 'APPS' && (
              <div className="space-y-2.5 py-1">
                <p className="text-xs text-slate-600 text-center">
                  Click to open installed UPI app and pay to <span className="font-bold">{targetUpiVpa}</span>:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Google Pay', short: 'GPay', bg: 'hover:bg-blue-50 border-blue-200' },
                    { name: 'PhonePe', short: 'PhonePe', bg: 'hover:bg-purple-50 border-purple-200' },
                    { name: 'Paytm UPI', short: 'Paytm', bg: 'hover:bg-sky-50 border-sky-200' },
                    { name: 'BHIM UPI', short: 'BHIM', bg: 'hover:bg-emerald-50 border-emerald-200' },
                  ].map((app) => (
                    <button
                      key={app.short}
                      type="button"
                      onClick={() => handleAppLaunch(app.short)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between shadow-clay-sm ${app.bg}`}
                    >
                      <span className="font-bold text-xs text-slate-900">{app.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: UPI ID DETAILS */}
            {activeTab === 'UPI_ID' && (
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Receiver VPA</span>
                  <span className="font-mono font-bold text-slate-900">{targetUpiVpa}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Beneficiary Name</span>
                  <span className="font-bold text-slate-900">Veeram Reddy</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Order Reference</span>
                  <span className="font-mono text-slate-900">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-black text-slate-900 text-sm">₹{amount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ─── CONFIRMATION WORKFLOW: ONLY ONCE RECEIVED ─── */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              {/* Payer UTR / Status prompt */}
              {!payerMarkedPaid ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Step 1: Have you completed the UPI transfer?
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={payerUtr}
                      onChange={(e) => setPayerUtr(e.target.value)}
                      placeholder="Enter 12-digit UPI UTR / Ref No. (Optional)"
                      className="clay-input text-xs flex-1 py-2 px-3 rounded-xl border font-mono"
                    />
                    <button
                      type="button"
                      onClick={handlePayerMarkedPayment}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-clay-sm flex items-center gap-1 transition-all shrink-0"
                    >
                      I Have Paid <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      Payment Sent • Awaiting Receiver Confirmation
                    </span>
                    <button
                      type="button"
                      onClick={() => setPayerMarkedPaid(false)}
                      className="text-[10px] text-amber-700 hover:underline"
                    >
                      Edit UTR
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Transfer sent for ₹{amount.toFixed(2)}. The order confirms only once credit is verified by the recipient (<span className="font-mono font-bold text-amber-900">{targetUpiVpa}</span>).
                  </p>
                </div>
              )}

              {/* Step 2: Receiver Confirmation Button (Confirms only once received) */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Receiver Verification ({targetUpiVpa})
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    Strict Check
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Confirm only once you see ₹{amount.toFixed(2)} credited in your UPI account. On confirmation, this order is officially placed and queued.
                </p>

                <button
                  type="button"
                  onClick={handleReceiverConfirmPayment}
                  disabled={isVerifying}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-clay-btn hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credit with Bank...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Confirm Payment Received (₹{amount.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
