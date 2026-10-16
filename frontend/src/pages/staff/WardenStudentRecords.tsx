import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, User, FileText } from 'lucide-react';

interface StudentRecord {
  id: number;
  rollNumber: string;
  fullName: string;
  department: string;
  hostelBlock: string;
  roomNumber: string;
  leaveCount: number;
  outpassCount: number;
}

export const WardenStudentRecords: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch warden student directory
    api.get('/admin/staff')
      .then(() => {
        // Mock directory list mapped to college students
        setStudents([
          { id: 1, rollNumber: '2024-CS-101', fullName: 'Rahul Verma', department: 'Computer Science', hostelBlock: 'Block-A', roomNumber: '204', leaveCount: 3, outpassCount: 8 },
          { id: 2, rollNumber: '2024-EC-205', fullName: 'Ananya Sharma', department: 'Electronics', hostelBlock: 'Block-B', roomNumber: '112', leaveCount: 1, outpassCount: 4 },
          { id: 3, rollNumber: '2024-ME-310', fullName: 'Vikram Singh', department: 'Mechanical', hostelBlock: 'Block-A', roomNumber: '305', leaveCount: 0, outpassCount: 2 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.hostelBlock.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-ink">Hostel Student Directory & Movement Logs</h2>
        <p className="text-xs text-ink-soft">Comprehensive leave & outpass record per resident student</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by student name, roll number, or hostel block..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="clay-input pl-9"
        />
      </div>

      {/* ─── MOBILE VIEW: CLEAN RESPONSIVE CARDS (strictly < md) ─── */}
      <div className="md:hidden space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">{s.fullName}</h3>
                <span className="text-xs font-mono text-zinc-500">{s.rollNumber}</span>
              </div>
              <span className="text-[11px] font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                {s.department}
              </span>
            </div>

            <div className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-zinc-400 font-medium">Hostel: </span>
                <span className="font-semibold text-zinc-800">{s.hostelBlock} / Room {s.roomNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="flex-1 py-1.5 px-2.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-center font-medium">
                Leaves: <strong className="font-bold">{s.leaveCount}</strong>
              </span>
              <span className="flex-1 py-1.5 px-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-center font-medium">
                Outpasses: <strong className="font-bold">{s.outpassCount}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── DESKTOP VIEW: CLEAN TABLE (md and above) ─── */}
      <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-600 uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Roll Number</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Hostel / Room</th>
              <th className="p-3.5 text-center">Approved Leaves</th>
              <th className="p-3.5 text-center">Approved Outpasses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50/70 transition-colors">
                <td className="p-3.5 font-mono font-semibold text-zinc-900">{s.rollNumber}</td>
                <td className="p-3.5 font-bold text-zinc-900">{s.fullName}</td>
                <td className="p-3.5 text-zinc-600">{s.department}</td>
                <td className="p-3.5 text-zinc-600">{s.hostelBlock} / {s.roomNumber}</td>
                <td className="p-3.5 text-center font-bold text-zinc-900">{s.leaveCount}</td>
                <td className="p-3.5 text-center font-bold text-zinc-900">{s.outpassCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
