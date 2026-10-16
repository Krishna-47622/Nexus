import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
              <Building className="w-4 h-4" />
            </div>
            <span className="text-zinc-900 font-bold tracking-tight">NEXUS</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-2.5 sm:px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/platform-admin/login"
              className="clay-btn text-xs px-3 sm:px-3.5 py-1.5"
            >
              Platform Console
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        Nexus — Campus Utility Multi-Tenant Platform © 2026
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
    { label: 'Print Shop', path: '/app/print/new', icon: Printer },
    { label: 'Requests', path: '/app/requests', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* ──────── DESKTOP / LAPTOP HEADER (md and above) ──────── */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/app/home" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                N
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-900 font-bold text-sm tracking-tight leading-none">NEXUS</span>
                <span className="text-[11px] text-zinc-500 font-medium">{user?.collegeName || 'Campus Utility'}</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 ml-4 pl-4 border-l border-zinc-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/notifications"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <Link
              to="/app/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-medium text-zinc-800">{user?.fullName?.split(' ')[0]}</span>
            </Link>

            <button
              onClick={logout}
              className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ──────── MOBILE HEADER (phones only < md) ──────── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xs font-bold text-zinc-900 leading-tight">{user?.fullName}</h1>
            <span className="text-[10px] text-zinc-500">{user?.collegeName || 'Student Portal'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link to="/app/notifications" className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900">
            <Bell className="w-4 h-4" />
          </Link>
          <Link to="/app/profile" className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900">
            <UserIcon className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ──────── MAIN CONTENT AREA (Laptop wide, Phone compact) ──────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* ──────── MOBILE BOTTOM NAVBAR (strictly phones only < md) ──────── */}
      <nav className="md:hidden fixed bottom-3 left-4 right-4 bg-white/95 backdrop-blur-md border border-zinc-200 rounded-xl shadow-lg flex items-center justify-around py-2 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-zinc-900 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export const StaffLayout: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const permissions = user?.permissions || [];
  const sidebarLinks: { label: string; path: string; icon: React.ElementType }[] = [];

  if (permissions.includes('CANTEEN_UPDATE_ORDER_STATUS') || permissions.includes('CANTEEN_VIEW_MENU')) {
    sidebarLinks.push({ label: 'Canteen Kitchen Queue', path: '/staff/canteen/orders', icon: Utensils });
  }
  if (permissions.includes('SPORTS_APPROVE_BORROW') || permissions.includes('SPORTS_MANAGE_EQUIPMENT') || user?.primaryRole?.toLowerCase().includes('sports')) {
    sidebarLinks.push({ label: 'Sports Pending Borrows', path: '/staff/sports/pending', icon: Dumbbell });
    sidebarLinks.push({ label: 'Sports Currently Out', path: '/staff/sports/current', icon: CheckSquare });
    sidebarLinks.push({ label: 'Equipment Inventory', path: '/staff/sports/inventory', icon: Package });
  }
  if (permissions.includes('PRINT_VIEW_QUEUE')) {
    sidebarLinks.push({ label: 'Print Shop Queue', path: '/staff/print/queue', icon: Printer });
  }
  if (permissions.includes('LEAVE_OUTPASS_APPROVE_REJECT_REQUEST') || permissions.includes('LEAVE_OUTPASS_VIEW_REQUESTS')) {
    sidebarLinks.push({ label: 'Warden Pending Approvals', path: '/staff/warden/approvals', icon: FileText });
    sidebarLinks.push({ label: 'Student Movement History', path: '/staff/warden/records', icon: Users });
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* ──────── MOBILE TOP HEADER (< md) ──────── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-zinc-900 leading-tight">{user?.primaryRole}</h1>
            <span className="text-[10px] text-zinc-500 font-medium">{user?.collegeName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {user?.fullName?.split(' ')[0]}
          </span>
          <button
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ──────── MOBILE DRAWER BACKDROP & MENU ──────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-bold rounded-lg text-xs">
                  S
                </div>
                <div>
                  <h2 className="font-bold text-xs text-zinc-900 leading-tight">{user?.collegeName}</h2>
                  <span className="text-[10px] text-zinc-500 font-medium">{user?.primaryRole}</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ──────── DESKTOP SIDEBAR (md and above) ──────── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col shrink-0">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 text-white flex items-center justify-center font-bold rounded-lg text-sm">
            S
          </div>
          <div>
            <h2 className="font-bold text-sm text-zinc-900 leading-tight">{user?.collegeName}</h2>
            <span className="text-xs text-zinc-500 font-medium">{user?.primaryRole}</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ──────── MAIN CONTENT (Full width on mobile, right pane on desktop) ──────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="hidden md:flex bg-white border-b border-zinc-200 px-6 py-4 items-center justify-between">
          <h1 className="text-base font-bold text-zinc-900">{user?.primaryRole} Operations Portal</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
              {user?.fullName}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = [
    { label: 'Analytics & Overview', path: '/admin/college/analytics', icon: BarChart3 },
    { label: 'User & Credentials', path: '/admin/college/users', icon: ShieldCheck },
    { label: 'Staff Management', path: '/admin/college/staff', icon: Users },
    { label: 'Student Bulk Import', path: '/admin/college/students/import', icon: FileText },
    { label: 'Catalog Management', path: '/admin/college/catalog', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* ──────── MOBILE TOP HEADER (< md) ──────── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-zinc-900 leading-tight">College Admin</h1>
            <span className="text-[10px] text-zinc-500 font-medium">{user?.collegeName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {user?.fullName?.split(' ')[0]}
          </span>
          <button
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ──────── MOBILE DRAWER BACKDROP & MENU ──────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-bold rounded-lg text-xs">
                  A
                </div>
                <div>
                  <h2 className="font-bold text-xs text-zinc-900 leading-tight">{user?.collegeName}</h2>
                  <span className="text-[10px] text-zinc-500 font-medium">Administration</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ──────── DESKTOP SIDEBAR (md and above) ──────── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col shrink-0">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 text-white flex items-center justify-center rounded-lg text-sm font-bold">
            <Building className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-zinc-900">{user?.collegeName}</h2>
            <span className="text-xs text-zinc-500 font-medium">Administration</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ──────── MAIN CONTENT ──────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="hidden md:flex bg-white border-b border-zinc-200 px-6 py-4 items-center justify-between">
          <h1 className="text-base font-bold text-zinc-900">Institutional Administration</h1>
          <span className="text-xs font-medium text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
            {user?.fullName}
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const PlatformAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = [
    { label: 'Global Overview', path: '/platform-admin/overview', icon: BarChart3 },
    { label: 'Colleges Directory', path: '/platform-admin/colleges', icon: Building },
    { label: 'Add New College', path: '/platform-admin/colleges/new', icon: Layers },
    { label: 'IAM / Roles & Perms', path: '/platform-admin/iam', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* ──────── MOBILE TOP HEADER (< md) ──────── */}
      <header className="md:hidden sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-zinc-100 leading-tight">Platform Admin</h1>
            <span className="text-[10px] text-zinc-400 font-medium">SaaS Console</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700 px-2 py-0.5 rounded-md">
            Superadmin
          </span>
          <button
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ──────── MOBILE DRAWER BACKDROP & MENU ──────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-zinc-900 h-full shadow-2xl flex flex-col z-50 border-r border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-zinc-800 text-white flex items-center justify-center font-bold rounded-lg text-xs">
                  PA
                </div>
                <div>
                  <h2 className="font-bold text-xs text-zinc-100 leading-tight">Platform Admin</h2>
                  <span className="text-[10px] text-zinc-400 font-medium">Multi-Tenant Console</span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ──────── DESKTOP SIDEBAR (md and above) ──────── */}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0">
        <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold rounded-lg text-xs">
            PA
          </div>
          <div>
            <h2 className="font-bold text-sm text-zinc-100">Platform Admin</h2>
            <span className="text-xs text-zinc-400 font-medium">Multi-Tenant Console</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ──────── MAIN CONTENT ──────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="hidden md:flex bg-zinc-900 border-b border-zinc-800 px-6 py-4 items-center justify-between">
          <h1 className="text-base font-bold text-white">System Platform Console</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-800 border border-zinc-700 text-emerald-400">
            Superadmin
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
