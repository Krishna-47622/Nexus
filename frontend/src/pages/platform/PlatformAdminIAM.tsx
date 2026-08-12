import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ShieldCheck, Plus, Check } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

interface Permission {
  id: number;
  module: string;
  action: string;
  code: string;
}

export const PlatformAdminIAM: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedPermCodes, setSelectedPermCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIAM();
  }, []);

  const fetchIAM = () => {
    Promise.all([
      api.get('/platform-admin/iam/roles'),
      api.get('/platform-admin/iam/permissions'),
    ])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.data);
        setAllPermissions(permsRes.data);
      })
      .finally(() => setLoading(false));
  };

  const handleTogglePerm = (code: string) => {
    setSelectedPermCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      await api.post('/platform-admin/iam/roles', {
        name: newRoleName,
        permissions: selectedPermCodes,
      });
      setNewRoleName('');
      setSelectedPermCodes([]);
      fetchIAM();
    } catch (err) {
      alert('Failed to create role template.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">IAM — Dynamic Roles & Permissions Matrix</h2>
        <p className="text-xs text-slate-400">Configure permission strings evaluated dynamically via Spring Security @PreAuthorize</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Existing Role Templates */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-sm p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Role Templates</h3>
          <div className="space-y-2">
            {roles.map((r) => (
              <div key={r.id} className="bg-slate-950 border border-slate-800 p-3 rounded-sm space-y-1">
                <div className="font-bold text-xs text-white flex items-center justify-between">
                  <span>{r.name}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-sm">
                    {r.permissions.length} perms
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2">
                  {r.permissions.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Dynamic Role Builder */}
        <form onSubmit={handleCreateRole} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-sm p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Create Custom Dynamic Role</h3>

          <div>
            <label className="text-xs font-semibold text-slate-300 block">Role Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sports Assistant Warden"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-sm text-xs mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Assign Module Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-sm">
              {allPermissions.map((p) => {
                const checked = selectedPermCodes.includes(p.code);
                return (
                  <label
                    key={p.id}
                    onClick={() => handleTogglePerm(p.code)}
                    className={`flex items-center gap-2 p-2 border rounded-sm text-xs cursor-pointer transition ${
                      checked ? 'border-blue-500 bg-blue-950/40 text-white' : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span>{p.code}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-sm hover:bg-blue-700 transition"
          >
            + Create & Publish Dynamic Role Template
          </button>
        </form>
      </div>
    </div>
  );
};
