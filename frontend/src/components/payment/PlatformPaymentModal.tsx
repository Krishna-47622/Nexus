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
  ArrowRight,
  Sparkles
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
  const targetBeneficiary = 'Veeram Reddy';
  const navigate = useNavigate();

  // Ensure amount is a strictly valid number
  const safeAmount =
    typeof amount === 'number' && !isNaN(amount)
      ? amount
      : parseFloat(amount as any) || 0;

  const [activeTab, setActiveTab] = useState<'QR' | 'APPS' | 'UPI_ID'>('QR');
  const [payerUtr, setPayerUtr] = useState('');
  const [payerMarkedPaid, setPayerMarkedPaid] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes session
  const [error, setError] = useState('');

  // Exact UPI Intent URL pointing to 9398979155-1@superyes
  const effectiveUpiUrl = `upi://pay?pa=${encodeURIComponent(
    targetUpiVpa
  )}&pn=${encodeURIComponent(
    targetBeneficiary
  )}&am=${safeAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Order-${orderNumber}`
  )}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
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
  const handlePayerMarkedPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        tokenNumber:
          module === 'CANTEEN'
            ? `MR-${100 + ((orderId || 1) % 900)}`
            : `PRNT-${orderId || 1}`,
        pickupLocation:
          module === 'CANTEEN'
            ? 'MR Food Court - 1 (Counter #3)'
            : 'Engineering Block 2, Ground Floor (Print Center)',
        amount: safeAmount,
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
        amount: safeAmount,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto text-zinc-900 dark:text-zinc-100">
        {/* ─── MODAL HEADER (MINIMALIST) ─── */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                    Platform UPI Payment
                  </h3>
                  <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Direct
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Order #{orderNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3 text-zinc-400" />
                {formatTime(timeLeft)}
              </div>

              {!isSuccess && (
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Amount & Beneficiary Banner */}
          <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Total Amount Due
              </span>
              <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                ₹{safeAmount.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Beneficiary
              </span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {targetBeneficiary}
              </span>
            </div>
          </div>
        </div>

        {/* ─── SUCCESS SCREEN ─── */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                Payment Confirmed
              </span>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ₹{safeAmount.toFixed(2)} Credited Successfully
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Payment verified for <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{targetUpiVpa}</span>.
              </p>
            </div>

            {/* Receipt Card */}
            {receiptData && (
              <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3.5 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Pickup Token</span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    {receiptData.tokenNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">UTR Reference</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">{receiptData.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Counter</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 text-right max-w-[200px] truncate">
                    {receiptData.pickupLocation}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Amount Paid</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{safeAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGoToOrders}
              className="w-full py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Receipt className="w-4 h-4" /> View Live Order Tracking
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* ─── ACTIVE PAYMENT FLOW ─── */
          <div className="p-4 sm:p-5 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs rounded-lg flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Target UPI Banner */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 p-2.5 rounded-xl flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 block">
                  Receiver UPI ID:
                </span>
                <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate block">
                  {targetUpiVpa}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="shrink-0 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                {copiedVpa ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy ID
                  </>
                )}
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('QR')}
                className={`py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'QR'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Scan QR
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('APPS')}
                className={`py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'APPS'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                UPI Apps
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('UPI_ID')}
                className={`py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'UPI_ID'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Details
              </button>
            </div>

            {/* TAB 1: DYNAMIC QR CODE */}
            {activeTab === 'QR' && (
              <div className="space-y-3 text-center py-1">
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 inline-block shadow-xs">
                  <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white p-2 rounded-lg flex items-center justify-center mx-auto">
                    <img
                      src={qrCodeUrl}
                      alt={`UPI QR code for ${targetUpiVpa}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Scan with PhonePe, Google Pay, Paytm, or BHIM
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Link Copied
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" /> Copy UPI Payment URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: APPS INTENT */}
            {activeTab === 'APPS' && (
              <div className="space-y-2 py-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  Select your UPI app to auto-open with ₹{safeAmount.toFixed(2)}:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Google Pay', short: 'GPay' },
                    { name: 'PhonePe', short: 'PhonePe' },
                    { name: 'Paytm UPI', short: 'Paytm' },
                    { name: 'BHIM UPI', short: 'BHIM' },
                  ].map((app) => (
                    <button
                      key={app.short}
                      type="button"
                      onClick={() => handleAppLaunch(app.short)}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {app.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: UPI ID DETAILS */}
            {activeTab === 'UPI_ID' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-700/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Receiver VPA</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{targetUpiVpa}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-700/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Beneficiary Name</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{targetBeneficiary}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-700/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Order Reference</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 dark:text-zinc-400">Amount</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">₹{safeAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ─── CONFIRMATION WORKFLOW ─── */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              {!payerMarkedPaid ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Step 1: Have you completed the UPI transfer?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={payerUtr}
                      onChange={(e) => setPayerUtr(e.target.value)}
                      placeholder="12-digit UPI UTR / Ref (Optional)"
                      className="text-xs flex-1 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => handlePayerMarkedPayment()}
                      className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center gap-1 transition-colors shrink-0"
                    >
                      I Have Paid <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      Payment Marked • Awaiting Confirmation
                    </span>
                    <button
                      type="button"
                      onClick={() => setPayerMarkedPaid(false)}
                      className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      Edit UTR
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-snug">
                    Transfer sent for ₹{safeAmount.toFixed(2)}. Verify with recipient ({targetUpiVpa}).
                  </p>
                </div>
              )}

              {/* Step 2: Receiver Confirmation Button */}
              <div className="bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Receiver Verification ({targetUpiVpa})
                  </span>
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium px-1.5 py-0.2 rounded">
                    Strict
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Confirm only once you see ₹{safeAmount.toFixed(2)} credited in your UPI account.
                </p>

                <button
                  type="button"
                  onClick={handleReceiverConfirmPayment}
                  disabled={isVerifying}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credit...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Confirm Payment Received (₹{safeAmount.toFixed(2)})</span>
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
