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
        <h2 className="text-xl font-extrabold text-ink">Student CSV Bulk Import Wizard</h2>
        <p className="text-xs text-ink-soft">Bulk upload student roster to provision top-down login accounts</p>
      </div>

      {error && (
        <div className="p-3 bg-clay-coral/10 border border-clay-coral/20 text-clay-coral text-xs rounded-2xl">
          {error}
        </div>
      )}

      {/* CSV File Upload Dropzone */}
      <form onSubmit={handleImportSubmit} className="clay-card p-6 space-y-4">
        <div className="border-2 border-dashed border-white/50 rounded-2xl p-6 text-center space-y-2">
          <FileText className="w-8 h-8 text-ink-muted mx-auto" />
          <div>
            <label className="text-xs font-bold text-clay-indigo cursor-pointer hover:underline block">
              {file ? file.name : 'Select Student Roster CSV File'}
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-ink-soft mt-1">
              CSV Format: <code className="bg-clay-bg px-1 py-0.5 rounded text-ink">RollNumber, FullName, Email, Department, Year, HostelBlock, RoomNumber</code>
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2.5 clay-btn text-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {loading ? 'Processing Import & Generating Passwords...' : 'Confirm Import & Generate Student Credentials'}
        </button>
      </form>

      {/* Import Log & Results Table */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">
            Import Log ({results.filter((r) => r.status === 'SUCCESS').length} Imported Successfully)
          </h3>
          <div className="clay-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-clay-bg border-b border-white/60 font-bold uppercase text-ink">
                <tr>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Dept / Year</th>
                  <th className="p-3">Temp Password</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clay-bg">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-clay-bg/60">
                    <td className="p-3 font-mono font-bold text-ink">{r.rollNumber}</td>
                    <td className="p-3 font-semibold">{r.fullName}</td>
                    <td className="p-3 text-ink-soft">{r.email}</td>
                    <td className="p-3">{r.department} / Yr {r.year}</td>
                    <td className="p-3 font-mono font-bold text-primary">{r.tempPassword || 'N/A'}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-2xl border ${
                          r.status === 'SUCCESS'
                            ? 'bg-clay-mint/10 text-clay-mint border-clay-mint/20'
                            : 'bg-clay-coral/10 text-clay-coral border-clay-coral/20'
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
