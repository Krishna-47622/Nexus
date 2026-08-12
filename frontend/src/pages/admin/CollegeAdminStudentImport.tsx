import React, { useState } from 'react';
import { api } from '../../api/client';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportRecord {
  rollNumber: string;
  fullName: string;
  email: string;
  department: string;
  year: string;
  hostelBlock: string;
  roomNumber: string;
  tempPassword?: string;
  status: string;
  error?: string;
}

export const CollegeAdminStudentImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(res.data);
    } catch (err: any) {
      setError('Failed to import CSV file. Please ensure valid CSV formatting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Student CSV Bulk Import Wizard</h2>
        <p className="text-xs text-slate-500">Bulk upload student roster to provision top-down login accounts</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* CSV File Upload Dropzone */}
      <form onSubmit={handleImportSubmit} className="bg-white border border-slate-200 rounded-sm p-6 space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-sm p-6 text-center space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <div>
            <label className="text-xs font-bold text-primary cursor-pointer hover:underline block">
              {file ? file.name : 'Select Student Roster CSV File'}
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-500 mt-1">
              CSV Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">RollNumber, FullName, Email, Department, Year, HostelBlock, RoomNumber</code>
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {loading ? 'Processing Import & Generating Passwords...' : 'Confirm Import & Generate Student Credentials'}
        </button>
      </form>

      {/* Import Log & Results Table */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Import Log ({results.filter((r) => r.status === 'SUCCESS').length} Imported Successfully)
          </h3>
          <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-700">
                <tr>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Dept / Year</th>
                  <th className="p-3">Temp Password</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{r.rollNumber}</td>
                    <td className="p-3 font-semibold">{r.fullName}</td>
                    <td className="p-3 text-slate-600">{r.email}</td>
                    <td className="p-3">{r.department} / Yr {r.year}</td>
                    <td className="p-3 font-mono font-bold text-primary">{r.tempPassword || 'N/A'}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                          r.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
