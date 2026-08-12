import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  Dumbbell,
  Printer,
  FileText,
  Home,
  User as UserIcon,
  LogOut,
  Bell,
  CheckSquare,
  Package,
  Users,
  BarChart3,
  ShieldCheck,
  Building,
  Layers,
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-black text-lg text-primary tracking-tight">
            <Building className="w-5 h-5 text-primary" />
            <span>CAMPUS UTILITY</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-primary transition"
            >
              Sign In
            </Link>
            <Link
              to="/platform-admin/login"
              className="px-3.5 py-1.5 text-xs font-bold bg-primary text-white rounded-sm hover:bg-primary-dark transition"
            >
              Platform Console
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Campus Utility Multi-Tenant SaaS Platform © 2026. Institutional Infrastructure.
      </footer>
    </div>
  );
};

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/app/home', icon: Home },
    { label: 'Canteen', path: '/app/canteen', icon: Utensils },
    { label: 'Sports', path: '/app/sports', icon: Dumbbell },
    { label: 'Print', path: '/app/print/new', icon: Printer },
    { label: 'Requests', path: '/app/requests', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col border-x border-slate-200 shadow-sm relative pb-16">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs">
              {user?.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xs font-bold text-slate-900 leading-none">{user?.fullName}</h1>
              <span className="text-[10px] text-slate-500">{user?.collegeName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/app/notifications" className="p-1.5 text-slate-500 hover:text-primary relative">
              <Bell className="w-4 h-4" />
            </Link>
            <Link to="/app/profile" className="p-1.5 text-slate-500 hover:text-primary">
              <UserIcon className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Mobile Navbar */}
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-slate-200 flex items-center justify-around py-2 z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
                  isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export const StaffLayout: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const permissions = user?.permissions || [];
  const sidebarLinks = [];

  if (permissions.includes('CANTEEN_UPDATE_ORDER_STATUS') || permissions.includes('CANTEEN_VIEW_MENU')) {
    sidebarLinks.push({ label: 'Canteen Kitchen Queue', path: '/staff/canteen/orders', icon: Utensils });
  }
  if (permissions.includes('SPORTS_APPROVE_BORROW')) {
    sidebarLinks.push({ label: 'Sports Pending Borrows', path: '/staff/sports/pending', icon: Dumbbell });
    sidebarLinks.push({ label: 'Sports Currently Out', path: '/staff/sports/current', icon: CheckSquare });
  }
  if (permissions.includes('PRINT_VIEW_QUEUE')) {
    sidebarLinks.push({ label: 'Print Shop Queue', path: '/staff/print/queue', icon: Printer });
  }
  if (permissions.includes('LEAVE_OUTPASS_APPROVE_REJECT_REQUEST') || permissions.includes('LEAVE_OUTPASS_VIEW_REQUESTS')) {
    sidebarLinks.push({ label: 'Warden Pending Approvals', path: '/staff/warden/approvals', icon: FileText });
    sidebarLinks.push({ label: 'Student Movement History', path: '/staff/warden/records', icon: Users });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-primary text-white flex flex-col border-r border-primary-dark">
        <div className="p-4 border-b border-primary-light flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-primary flex items-center justify-center font-bold rounded-sm">
            S
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">{user?.collegeName}</h2>
            <span className="text-xs text-slate-300 font-medium">{user?.primaryRole}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition ${
                  isActive ? 'bg-white text-primary font-bold' : 'text-slate-200 hover:bg-primary-light'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-primary-light">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-200 hover:bg-red-900/40 rounded-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">{user?.primaryRole} Operations Portal</h1>
          <span className="text-sm text-slate-600 font-medium">Operator: {user?.fullName}</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { label: 'Analytics & Overview', path: '/admin/college/analytics', icon: BarChart3 },
    { label: 'User & Credentials', path: '/admin/college/users', icon: ShieldCheck },
    { label: 'Staff Management', path: '/admin/college/staff', icon: Users },
    { label: 'Student Bulk Import', path: '/admin/college/students/import', icon: FileText },
    { label: 'Catalog Management', path: '/admin/college/catalog', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Building className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="font-bold text-sm">{user?.collegeName}</h2>
            <span className="text-xs text-slate-400">College Administration</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition ${
                  isActive ? 'bg-primary text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white rounded-sm">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">Institutional Administration Dashboard</h1>
          <span className="text-sm font-medium text-slate-600">{user?.fullName}</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const PlatformAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { label: 'Global Overview', path: '/platform-admin/overview', icon: BarChart3 },
    { label: 'Colleges Directory', path: '/platform-admin/colleges', icon: Building },
    { label: 'Add New College', path: '/platform-admin/colleges/new', icon: Layers },
    { label: 'IAM / Roles & Perms', path: '/platform-admin/iam', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold rounded-sm">
            PA
          </div>
          <div>
            <h2 className="font-bold text-sm">Platform Admin</h2>
            <span className="text-xs text-slate-400">Multi-Tenant SaaS</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition ${
                  isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white rounded-sm">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">System Platform Console</h1>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2 py-1 rounded-sm">
            Root Superadmin
          </span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
