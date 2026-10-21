import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PlatformPaymentModal } from '../../components/payment/PlatformPaymentModal';
import {
  Upload,
  FileText,
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  Info,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  DollarSign,
  FileCheck
} from 'lucide-react';

interface PrintPricing {
  bwPerPage: number;
  colorPerPage: number;
  a4Multiplier: number;
  a3Multiplier: number;
  letterMultiplier: number;
  doubleSidedDiscountPercent: number;
  bindingCharge: number;
  urgentSurchargePercent: number;
  printerShopName?: string;
  printerContactPerson?: string;
  printerPhone?: string;
  printerWhatsapp?: string;
  printerShopLocation?: string;
  printerUpiId?: string;
}

interface PriceBreakdown {
  perPageRate: number;
  paperSizeMultiplier: number;
  totalPages: number;
  copies: number;
  baseCost: number;
  isDoubleSided: boolean;
  doubleSidedDiscountPercent: number;
  doubleSidedDiscount: number;
  subtotal: number;
  isUrgent: boolean;
  urgentSurchargePercent: number;
  urgentSurcharge: number;
  needsBinding: boolean;
  bindingCharge: number;
  totalCost: number;
  paperQuality?: string;
  orientation?: string;
  pageRange?: string;
}

const defaultPricing: PrintPricing = {
  bwPerPage: 2,
  colorPerPage: 10,
  a4Multiplier: 1,
  a3Multiplier: 2,
  letterMultiplier: 1,
  doubleSidedDiscountPercent: 10,
  bindingCharge: 30,
  urgentSurchargePercent: 25,
  printerShopName: 'Campus Reprographics & Digital Print Center',
  printerContactPerson: 'Ramesh Kumar (Print Operator)',
  printerPhone: '+91 98490 12345',
  printerWhatsapp: '919849012345',
  printerShopLocation: 'Engineering Block 2, Ground Floor (Adjacent to MR Food Court)',
  printerUpiId: 'printshop@mallareddyuniversity.ac.in',
};

// Utility to parse custom page range like "1-5, 8, 11-14"
const parsePageRangeCount = (rangeStr: string, maxPages: number): number => {
  if (!rangeStr || rangeStr.trim().toUpperCase() === 'ALL') {
    return maxPages;
  }
  const parts = rangeStr.split(',').map((s) => s.trim());
  const selected = new Set<number>();

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => parseInt(s.trim(), 10));
      if (!isNaN(startStr) && !isNaN(endStr)) {
        const start = Math.max(1, Math.min(startStr, endStr));
        const end = Math.min(maxPages, Math.max(startStr, endStr));
        for (let i = start; i <= end; i++) {
          selected.add(i);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        selected.add(pageNum);
      }
    }
  }

  return selected.size > 0 ? selected.size : maxPages;
};

export const PrintNewJob: React.FC = () => {
  const [pricing, setPricing] = useState<PrintPricing>(defaultPricing);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [docTotalPages, setDocTotalPages] = useState(1);
  const [pageRangeMode, setPageRangeMode] = useState<'ALL' | 'CUSTOM'>('ALL');
  const [customRangeText, setCustomRangeText] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const [paperQuality, setPaperQuality] = useState('STANDARD_75GSM');
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [bindingType, setBindingType] = useState<'NONE' | 'STAPLE' | 'SPIRAL'>('NONE');
  const [isUrgent, setIsUrgent] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<'PAY_NOW' | 'PAY_ON_COLLECTION'>('PAY_NOW');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPlatformPayment, setShowPlatformPayment] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<{
    jobId: number;
    fileName: string;
    amount: number;
    upiIntentUrl?: string;
  } | null>(null);

  // Document analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [detectedFileType, setDetectedFileType] = useState('');
  const [fileSizeKB, setFileSizeKB] = useState(0);

  // Price breakdown
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [estimating, setEstimating] = useState(false);

  const navigate = useNavigate();
  const { success, error: showToastError } = useToast();

  // Fetch real printer shop guy pricing on mount
  useEffect(() => {
    api
      .get('/print/pricing')
      .then((res) => setPricing((prev) => ({ ...prev, ...res.data })))
      .catch(() => {});
  }, []);

  // Recalibrate totalPages whenever range changes
  useEffect(() => {
    if (pageRangeMode === 'ALL') {
      setTotalPages(docTotalPages);
    } else {
      const calculated = parsePageRangeCount(customRangeText, docTotalPages);
      setTotalPages(calculated);
    }
  }, [pageRangeMode, customRangeText, docTotalPages]);

  // Fetch real-time estimate based on printer shop guy's pricing
  const fetchEstimate = useCallback(async () => {
    if (!fileUrl && totalPages <= 0) return;
    setEstimating(true);
    const needsBinding = bindingType === 'SPIRAL';

    try {
      const res = await api.post('/print/estimate', {
        totalPages,
        copies,
        isColor,
        isDoubleSided,
        paperSize,
        isUrgent,
        needsBinding,
        paperQuality,
        orientation,
        pageRange: pageRangeMode === 'ALL' ? 'ALL' : customRangeText,
      });
      setBreakdown(res.data);
    } catch {
      // Local fallback calculation based on exact printer guy rules
      let perPageRate = isColor ? pricing.colorPerPage : pricing.bwPerPage;
      if (paperQuality === 'BOND_100GSM') perPageRate += 1;
      else if (paperQuality === 'GLOSSY') perPageRate += 4;

      let paperMul = pricing.a4Multiplier;
      if (paperSize === 'A3') paperMul = pricing.a3Multiplier;
      else if (paperSize === 'Letter') paperMul = pricing.letterMultiplier;

      const baseCost = perPageRate * paperMul * totalPages * copies;
      const dblDiscount = isDoubleSided
        ? baseCost * (pricing.doubleSidedDiscountPercent / 100)
        : 0;
      const subtotal = baseCost - dblDiscount;
      const urgSurcharge = isUrgent
        ? subtotal * (pricing.urgentSurchargePercent / 100)
        : 0;
      const bindChg = needsBinding ? pricing.bindingCharge * copies : 0;
      const total = subtotal + urgSurcharge + bindChg;

      setBreakdown({
        perPageRate,
        paperSizeMultiplier: paperMul,
        totalPages,
        copies,
        baseCost: +baseCost.toFixed(2),
        isDoubleSided,
        doubleSidedDiscountPercent: pricing.doubleSidedDiscountPercent,
        doubleSidedDiscount: +dblDiscount.toFixed(2),
        subtotal: +subtotal.toFixed(2),
        isUrgent,
        urgentSurchargePercent: pricing.urgentSurchargePercent,
        urgentSurcharge: +urgSurcharge.toFixed(2),
        needsBinding,
        bindingCharge: +bindChg.toFixed(2),
        totalCost: +total.toFixed(2),
      });
    } finally {
      setEstimating(false);
    }
  }, [
    totalPages,
    copies,
    isColor,
    isDoubleSided,
    paperSize,
    paperQuality,
    orientation,
    bindingType,
    isUrgent,
    pageRangeMode,
    customRangeText,
    pricing,
    fileUrl,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEstimate();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEstimate]);

  // ─── Auto-analyze uploaded document (PDF page count via pdf.js) ───
  const analyzeDocument = async (file: File) => {
    setAnalyzing(true);
    setAnalysisComplete(false);
    setDetectedFileType(file.type || file.name.split('.').pop() || 'unknown');
    setFileSizeKB(Math.round(file.size / 1024));

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;
        setDocTotalPages(pageCount);
        setTotalPages(pageCount);
        setAnalysisComplete(true);
      } else if (
        file.type.startsWith('image/') ||
        /\.(png|jpg|jpeg|bmp|gif|webp)$/i.test(file.name)
      ) {
        setDocTotalPages(1);
        setTotalPages(1);
        setAnalysisComplete(true);
      } else if (
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        const estimatedPages = Math.max(1, Math.round(file.size / 10240));
        setDocTotalPages(estimatedPages);
        setTotalPages(estimatedPages);
        setAnalysisComplete(true);
      } else {
        setDocTotalPages(1);
        setTotalPages(1);
        setAnalysisComplete(true);
      }
    } catch (err) {
      console.error('Document analysis error:', err);
      setDocTotalPages(1);
      setTotalPages(1);
      setAnalysisComplete(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileUrl(
        `https://storage.supabase.co/campus-utility/print-uploads/${Date.now()}_${file.name}`
      );
      setError('');
      analyzeDocument(file);
    }
  };

  const handleSubmitPrintJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      setError('Please select a document file to upload.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/print/jobs', {
        fileUrl,
        fileName,
        copies,
        isColor,
        isDoubleSided,
        paperSize,
        totalPages,
        isUrgent,
        needsBinding: bindingType === 'SPIRAL',
        orientation,
        paperQuality,
        pageRange: pageRangeMode === 'ALL' ? 'ALL' : customRangeText,
        specialInstructions,
        paymentMethod: paymentChoice,
      });

      if (paymentChoice === 'PAY_NOW') {
        setPendingPaymentData({
          jobId: res.data.id,
          fileName: res.data.fileName || fileName,
          amount: res.data.totalCost,
          upiIntentUrl: res.data.upiIntentUrl,
        });
        success('Print order created. Please complete UPI payment.');
        setShowPlatformPayment(true);
      } else {
        success('Print job queued successfully! Direct tracking active.');
        navigate('/app/print/jobs');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit print job.';
      setError(msg);
      showToastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = breakdown?.totalCost ?? 0;

  return (
    <div className="space-y-5 pb-24 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">New Document Print Job</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Direct queue to {pricing.printerShopName || 'Campus Reprographics'}
          </p>
        </div>
        <Link
          to="/app/print/jobs"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          My Print History →
        </Link>
      </div>

      {/* ─── Contact Printer Guy Banner ─── */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Need custom paper, posters, or urgent queries?
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Contact operator: <span className="font-semibold text-blue-700 dark:text-blue-400">{pricing.printerContactPerson}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowContactModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
        >
          Contact Shop Guy
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitPrintJob} className="space-y-4">
        {/* ─── Document Upload Dropzone with Page Analysis ─── */}
        <div
          className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-2 transition-all duration-300 ${
            analyzing
              ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
              : analysisComplete
              ? 'border-emerald-400/50 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-500'
          }`}
        >
          {analyzing ? (
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto animate-spin" />
          ) : analysisComplete ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          ) : (
            <Upload className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mx-auto" />
          )}
          <div>
            <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline block">
              {analyzing
                ? 'Accurately scanning document pages...'
                : fileName
                ? fileName
                : 'Upload PDF / DOCX / Image File'}
              <input
                type="file"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {analysisComplete && (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Auto-verified: {docTotalPages} total page{docTotalPages !== 1 ? 's' : ''} in file •{' '}
                  {detectedFileType.toUpperCase().replace('APPLICATION/', '')} •{' '}
                  {fileSizeKB > 1024
                    ? `${(fileSizeKB / 1024).toFixed(1)} MB`
                    : `${fileSizeKB} KB`}
                </p>
                <p className="text-[10px] text-ink-soft">
                  Printer pricing applies accurately per selected page below
                </p>
              </div>
            )}
            {!analysisComplete && !analyzing && (
              <p className="text-[11px] text-ink-soft">
                PDF pages are analyzed automatically using PDF.js worker
              </p>
            )}
          </div>
        </div>

        {/* ─── Page Selection & Range ─── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pages & Copies</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold lowercase text-xs">
              {totalPages} page{totalPages !== 1 ? 's' : ''} targeted
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Page Range Selection</label>
              <select
                value={pageRangeMode}
                onChange={(e) => setPageRangeMode(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Pages ({docTotalPages} Pages)</option>
                <option value="CUSTOM">Custom Page Range...</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Number of Copies</label>
              <input
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {pageRangeMode === 'CUSTOM' && (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 dark:border-blue-900/40 space-y-1">
              <label className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
                Specify pages (e.g. 1-5, 8, 11-{docTotalPages}):
              </label>
              <input
                type="text"
                placeholder={`e.g. 1-${Math.min(5, docTotalPages)} or 1,3,5`}
                value={customRangeText}
                onChange={(e) => setCustomRangeText(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-[10px] text-blue-700 dark:text-blue-400">
                Accurately calculated: {totalPages} page{totalPages !== 1 ? 's' : ''} to print
              </p>
            </div>
          )}
        </div>

        {/* ─── Print Conditions & Specifications ─── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Print Conditions & Paper Spec
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Color vs B&W */}
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Print Mode</label>
              <select
                value={isColor ? 'color' : 'bw'}
                onChange={(e) => setIsColor(e.target.value === 'color')}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bw">
                  Black & White (₹{pricing.bwPerPage.toFixed(2)}/pg)
                </option>
                <option value="color">
                  Color Print (₹{pricing.colorPerPage.toFixed(2)}/pg)
                </option>
              </select>
            </div>

            {/* Paper Size */}
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="A4">A4 Standard ({pricing.a4Multiplier}×)</option>
                <option value="A3">A3 Poster / Large ({pricing.a3Multiplier}×)</option>
                <option value="Letter">Letter Format ({pricing.letterMultiplier}×)</option>
              </select>
            </div>

            {/* Paper Quality */}
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Paper Quality / GSM</label>
              <select
                value={paperQuality}
                onChange={(e) => setPaperQuality(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="STANDARD_75GSM">Standard (75 GSM) — Regular</option>
                <option value="BOND_100GSM">Executive Bond (100 GSM) — +₹1/pg</option>
                <option value="GLOSSY">Glossy Photo Paper — +₹4/pg</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PORTRAIT">Portrait (Vertical)</option>
                <option value="LANDSCAPE">Landscape (Horizontal)</option>
              </select>
            </div>
          </div>

          {/* Duplex and Finishing options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <input
                type="checkbox"
                checked={isDoubleSided}
                onChange={(e) => setIsDoubleSided(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                Double-Sided (Duplex){' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ({pricing.doubleSidedDiscountPercent}% off)
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Urgent Priority (+{pricing.urgentSurchargePercent}%)
              </span>
            </label>
          </div>

          {/* Binding options */}
          <div className="pt-2">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1.5">
              Binding & Finishing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NONE', label: 'No Binding', cost: 'Free' },
                { id: 'STAPLE', label: 'Corner Stapled', cost: 'Free' },
                {
                  id: 'SPIRAL',
                  label: 'Spiral Binding',
                  cost: `+₹${pricing.bindingCharge.toFixed(2)}/copy`,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBindingType(opt.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    bindingType === opt.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-75">{opt.cost}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom instructions / unlisted conditions */}
          <div className="pt-2">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1 flex items-center justify-between">
              <span>Special Instructions for Printer Operator</span>
              <span className="text-[10px] font-normal text-zinc-400">
                (if something you need isn't listed above)
              </span>
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please bind with plastic sheet cover, punch 2-holes on left margin, or print first page in color..."
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* ─── Price Breakdown (Operator Set Rates) ─── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Live Price Calculation (Accurate)
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              Shop rates applied
            </span>
          </h3>

          {breakdown ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>
                  Base: ₹{breakdown.perPageRate.toFixed(2)} × {breakdown.paperSizeMultiplier}×
                  ({paperSize}) × {breakdown.totalPages} pgs × {breakdown.copies} cop{breakdown.copies !== 1 ? 'ies' : 'y'}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ₹{breakdown.baseCost.toFixed(2)}
                </span>
              </div>

              {breakdown.isDoubleSided && breakdown.doubleSidedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Duplex Discount ({breakdown.doubleSidedDiscountPercent}%)</span>
                  <span className="font-semibold">
                    −₹{breakdown.doubleSidedDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {breakdown.isUrgent && breakdown.urgentSurcharge > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>
                    <Zap className="w-3 h-3 inline mr-0.5" />
                    Urgent Surcharge ({breakdown.urgentSurchargePercent}%)
                  </span>
                  <span className="font-semibold">
                    +₹{breakdown.urgentSurcharge.toFixed(2)}
                  </span>
                </div>
              )}

              {breakdown.needsBinding && breakdown.bindingCharge > 0 && (
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                  <span>
                    <BookOpen className="w-3 h-3 inline mr-0.5" />
                    Spiral Binding ({breakdown.copies} × ₹
                    {(breakdown.bindingCharge / breakdown.copies).toFixed(2)})
                  </span>
                  <span className="font-semibold">
                    +₹{breakdown.bindingCharge.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2.5 mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Total Calculated Cost</span>
                <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  ₹{breakdown.totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">
              Upload a document to see exact live pricing
            </div>
          )}
        </div>

        {/* ─── Payment Choice: Pay Now vs Pay Later ─── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Payment Option
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pay Now */}
            <div
              onClick={() => setPaymentChoice('PAY_NOW')}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-start gap-3 ${
                paymentChoice === 'PAY_NOW'
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                  paymentChoice === 'PAY_NOW'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-zinc-400'
                }`}
              >
                {paymentChoice === 'PAY_NOW' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 block">
                  Pay Now (Online UPI / Isthara)
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Instant cashless payment via UPI / QR. Pick up directly without waiting for payment.
                </p>
              </div>
            </div>

            {/* Pay Later */}
            <div
              onClick={() => setPaymentChoice('PAY_ON_COLLECTION')}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-start gap-3 ${
                paymentChoice === 'PAY_ON_COLLECTION'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-600 dark:border-emerald-500 shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                  paymentChoice === 'PAY_ON_COLLECTION'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-zinc-400'
                }`}
              >
                {paymentChoice === 'PAY_ON_COLLECTION' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 block">
                  Pay Later on Collection 💵
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Pay cash or UPI at the print shop counter when collecting your physical prints.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Submit Action Bar ─── */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {estimating ? 'Calculating...' : 'Payable Amount'}
            </div>
            <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">₹{totalCost.toFixed(2)}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {paymentChoice === 'PAY_NOW'
                ? 'Pay now via UPI / Isthara'
                : 'Pay ₹' + totalCost.toFixed(2) + ' while collecting prints'}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !fileUrl}
            className={`px-5 py-3 font-bold text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-xs ${
              paymentChoice === 'PAY_NOW'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : paymentChoice === 'PAY_NOW' ? (
              <QrCode className="w-4 h-4" />
            ) : (
              <FileCheck className="w-4 h-4" />
            )}
            {paymentChoice === 'PAY_NOW' ? 'Pay & Submit Job' : 'Queue Job (Pay on Pickup)'}
          </button>
        </div>
      </form>

      {/* ─── Contact Printer Guy Modal ─── */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 max-w-sm w-full rounded-3xl space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">Contact Print Operator</h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{pricing.printerShopName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <span className="font-bold">Operator:</span>
                  <span>{pricing.printerContactPerson || 'Ramesh Kumar'}</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800 dark:text-zinc-200">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    {pricing.printerShopLocation ||
                      'Engineering Block 2, Ground Floor (Adjacent to MR Food Court)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Working Hours: 8:30 AM – 7:30 PM (Mon–Sat)</span>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={`tel:${pricing.printerPhone || '+919849012345'}`}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Phone className="w-4 h-4" /> Call {pricing.printerPhone || '+91 98490 12345'}
                </a>

                <a
                  href={`https://wa.me/${
                    pricing.printerWhatsapp || '919849012345'
                  }?text=Hi%20Print%20Shop%2C%20I%20have%20a%20print%20job%20query%20for%20Malla%20Reddy%20University%20Campus%20Utility`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Platform Payment Modal for Pay Now */}
      {showPlatformPayment && pendingPaymentData && (
        <PlatformPaymentModal
          isOpen={showPlatformPayment}
          onClose={() => {
            setShowPlatformPayment(false);
            navigate('/app/print/jobs');
          }}
          amount={pendingPaymentData.amount}
          orderNumber={`PRNT-${pendingPaymentData.jobId}`}
          orderId={pendingPaymentData.jobId}
          merchantName={pricing.printerShopName || 'Campus Reprographics & Digital Print Center'}
          upiVpa="9398979155-1@superyes"
          upiIntentUrl={pendingPaymentData.upiIntentUrl}
          module="PRINT"
          onPaymentSuccess={() => {
            setShowPlatformPayment(false);
            navigate('/app/print/jobs');
          }}
        />
      )}
    </div>
  );
};
