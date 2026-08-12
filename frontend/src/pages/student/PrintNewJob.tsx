import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Upload, FileText, CheckCircle2, QrCode } from 'lucide-react';

interface PrintPricing {
  bwPerPage: number;
  colorPerPage: number;
}

export const PrintNewJob: React.FC = () => {
  const [pricing, setPricing] = useState<PrintPricing>({ bwPerPage: 2, colorPerPage: 10 });
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/print/pricing').then((res) => setPricing(res.data));
  }, []);

  const perPageRate = isColor ? pricing.colorPerPage : pricing.bwPerPage;
  const totalCost = perPageRate * totalPages * copies;

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      // Simulate Supabase Storage Bucket File Upload URL
      setFileUrl(`https://storage.supabase.co/campus-utility/print-uploads/${Date.now()}_${file.name}`);
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
      });

      if (res.data.upiIntentUrl) {
        window.location.href = res.data.upiIntentUrl;
      }

      navigate('/app/print/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit print job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">New Document Print Job</h2>
        <Link to="/app/print/jobs" className="text-xs font-semibold text-primary hover:underline">
          My Print History →
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitPrintJob} className="space-y-4">
        {/* Document Dropzone */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-sm p-6 text-center space-y-2 hover:border-primary transition">
          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
          <div>
            <label className="text-xs font-bold text-primary cursor-pointer hover:underline block">
              {fileName ? fileName : 'Choose PDF / DOCX / Image File'}
              <input
                type="file"
                accept=".pdf,.docx,.doc,.png,.jpg"
                onChange={handleSimulatedFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-500">Max size: 10MB per document</p>
          </div>
        </div>

        {/* Print Configuration */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Print Settings</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block">Total Document Pages</label>
              <input
                type="number"
                min={1}
                value={totalPages}
                onChange={(e) => setTotalPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block">Number of Copies</label>
              <input
                type="number"
                min={1}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block">Print Color</label>
              <select
                value={isColor ? 'color' : 'bw'}
                onChange={(e) => setIsColor(e.target.value === 'color')}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              >
                <option value="bw">Black & White (₹{pricing.bwPerPage.toFixed(2)}/pg)</option>
                <option value="color">Color (₹{pricing.colorPerPage.toFixed(2)}/pg)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs mt-1"
              >
                <option value="A4">A4 Standard</option>
                <option value="A3">A3 Poster</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isDoubleSided}
                onChange={(e) => setIsDoubleSided(e.target.checked)}
                className="rounded-sm text-primary"
              />
              Double-Sided (Duplex) Printing
            </label>
          </div>
        </div>

        {/* Price Calculation Card */}
        <div className="bg-slate-100 border border-slate-200 p-4 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-600">
              Rate: ₹{perPageRate.toFixed(2)} × {totalPages} pgs × {copies} copies
            </div>
            <div className="text-lg font-extrabold text-slate-900">Total Cost: ₹{totalCost.toFixed(2)}</div>
          </div>
          <button
            type="submit"
            disabled={loading || !fileUrl}
            className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> Pay & Print
          </button>
        </div>
      </form>
    </div>
  );
};
