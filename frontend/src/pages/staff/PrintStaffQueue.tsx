import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Printer, Download, ExternalLink } from 'lucide-react';

interface PrintJob {
  id: number;
  studentName: string;
  rollNumber: string;
  fileUrl: string;
  fileName: string;
  copies: number;
  isColor: boolean;
  paperSize: string;
  totalPages: number;
  totalCost: number;
  status: string;
  createdAt: string;
}

export const PrintStaffQueue: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = () => {
    api.get('/print/staff/queue')
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (id: number, nextStatus: string) => {
    try {
      await api.patch(`/print/staff/jobs/${id}/status`, { status: nextStatus });
      fetchQueue();
    } catch (err) {
      alert('Failed to update print status.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Print Shop Queue</h2>
        <p className="text-xs text-slate-500">Manage high-volume document printing jobs</p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">Loading print queue...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">No print jobs in queue.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-700">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">File Name</th>
                <th className="p-3">Settings</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{j.studentName}</td>
                  <td className="p-3 font-mono">{j.rollNumber}</td>
                  <td className="p-3">
                    <a
                      href={j.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      {j.fileName} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-3 font-medium">
                    {j.copies} copies • {j.totalPages} pgs • {j.isColor ? 'Color' : 'B&W'} • {j.paperSize}
                  </td>
                  <td className="p-3 font-bold text-slate-900">₹{j.totalCost.toFixed(2)}</td>
                  <td className="p-3">
                    <select
                      value={j.status}
                      onChange={(e) => handleStatusChange(j.id, e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded-sm text-xs font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="QUEUED">Queued</option>
                      <option value="PRINTING">Printing</option>
                      <option value="READY">Ready for Pickup</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
