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

      <div className="clay-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-clay-bg border-b border-white/60 font-bold uppercase text-ink">
            <tr>
              <th className="p-3">Roll Number</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Hostel / Room</th>
              <th className="p-3 text-center">Approved Leaves</th>
              <th className="p-3 text-center">Approved Outpasses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-clay-bg">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-clay-bg/60">
                <td className="p-3 font-mono font-semibold text-ink">{s.rollNumber}</td>
                <td className="p-3 font-bold text-primary">{s.fullName}</td>
                <td className="p-3">{s.department}</td>
                <td className="p-3">{s.hostelBlock} / {s.roomNumber}</td>
                <td className="p-3 text-center font-bold">{s.leaveCount}</td>
                <td className="p-3 text-center font-bold">{s.outpassCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
