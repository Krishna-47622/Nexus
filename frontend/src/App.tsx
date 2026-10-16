import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  PublicLayout,
  StudentLayout,
  StaffLayout,
  AdminLayout,
  PlatformAdminLayout,
} from './components/Layout';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { PlatformAdminLoginPage } from './pages/auth/PlatformAdminLoginPage';

// Student App Pages
import { StudentHome } from './pages/student/StudentHome';
import { StudentProfile } from './pages/student/StudentProfile';
import { CanteenMenu } from './pages/student/CanteenMenu';
import { CanteenCart } from './pages/student/CanteenCart';
import { CanteenOrders } from './pages/student/CanteenOrders';
import { SportsBrowse } from './pages/student/SportsBrowse';
import { SportsBorrowRequest } from './pages/student/SportsBorrowRequest';
import { SportsMyBorrows } from './pages/student/SportsMyBorrows';
import { PrintNewJob } from './pages/student/PrintNewJob';
import { PrintJobStatus } from './pages/student/PrintJobStatus';
import { LeaveNewRequest } from './pages/student/LeaveNewRequest';
import { OutpassNewRequest } from './pages/student/OutpassNewRequest';
import { RequestsStatus } from './pages/student/RequestsStatus';
import { NotificationsPage } from './pages/student/NotificationsPage';

// Staff Dashboards
import { CanteenStaffOrders } from './pages/staff/CanteenStaffOrders';
import { SportsStaffPending } from './pages/staff/SportsStaffPending';
import { SportsStaffCurrent } from './pages/staff/SportsStaffCurrent';
import { SportsStaffInventory } from './pages/staff/SportsStaffInventory';
import { PrintStaffQueue } from './pages/staff/PrintStaffQueue';
import { WardenApprovals } from './pages/staff/WardenApprovals';
import { WardenStudentRecords } from './pages/staff/WardenStudentRecords';

// College Admin Dashboards
import { CollegeAdminStaff } from './pages/admin/CollegeAdminStaff';
import { CollegeAdminStudentImport } from './pages/admin/CollegeAdminStudentImport';
import { CollegeAdminCatalog } from './pages/admin/CollegeAdminCatalog';
import { CollegeAdminAnalytics } from './pages/admin/CollegeAdminAnalytics';
import { CollegeAdminUsers } from './pages/admin/CollegeAdminUsers';

// Platform Admin Dashboards
import { PlatformAdminColleges } from './pages/platform/PlatformAdminColleges';
import { PlatformAdminCollegeNew } from './pages/platform/PlatformAdminCollegeNew';
import { PlatformAdminIAM } from './pages/platform/PlatformAdminIAM';
import { PlatformAdminOverview } from './pages/platform/PlatformAdminOverview';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRolePrefix?: string }> = ({ children, allowedRolePrefix }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRolePrefix) {
    const roleLower = user.primaryRole.toLowerCase();
    const prefixLower = allowedRolePrefix.toLowerCase();
    if (!roleLower.includes(prefixLower) && user.primaryRole !== 'Platform Admin') {
      if (roleLower.includes('student')) return <Navigate to="/app/home" replace />;
      if (roleLower.includes('platform')) return <Navigate to="/platform-admin/overview" replace />;
      if (roleLower.includes('admin')) return <Navigate to="/admin/college/analytics" replace />;
      return <Navigate to="/staff/canteen/orders" replace />;
    }
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/platform-admin/login" element={<PlatformAdminLoginPage />} />
          </Route>

          {/* Student App Mobile-First Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute allowedRolePrefix="Student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<StudentHome />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="canteen" element={<CanteenMenu />} />
            <Route path="canteen/cart" element={<CanteenCart />} />
            <Route path="canteen/orders" element={<CanteenOrders />} />
            <Route path="sports" element={<SportsBrowse />} />
            <Route path="sports/borrow/:equipmentId" element={<SportsBorrowRequest />} />
            <Route path="sports/my-borrows" element={<SportsMyBorrows />} />
            <Route path="print/new" element={<PrintNewJob />} />
            <Route path="print/jobs" element={<PrintJobStatus />} />
            <Route path="leave/new" element={<LeaveNewRequest />} />
            <Route path="outpass/new" element={<OutpassNewRequest />} />
            <Route path="requests" element={<RequestsStatus />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Staff Dashboards */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route path="canteen/orders" element={<CanteenStaffOrders />} />
            <Route path="sports/pending" element={<SportsStaffPending />} />
            <Route path="sports/current" element={<SportsStaffCurrent />} />
            <Route path="sports/inventory" element={<SportsStaffInventory />} />
            <Route path="print/queue" element={<PrintStaffQueue />} />
            <Route path="warden/approvals" element={<WardenApprovals />} />
            <Route path="warden/records" element={<WardenStudentRecords />} />
          </Route>

          {/* College Admin Dashboards */}
          <Route
            path="/admin/college"
            element={
              <ProtectedRoute allowedRolePrefix="Admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="analytics" element={<CollegeAdminAnalytics />} />
            <Route path="users" element={<CollegeAdminUsers />} />
            <Route path="staff" element={<CollegeAdminStaff />} />
            <Route path="students/import" element={<CollegeAdminStudentImport />} />
            <Route path="catalog" element={<CollegeAdminCatalog />} />
          </Route>

          {/* Platform Admin Dashboards */}
          <Route
            path="/platform-admin"
            element={
              <ProtectedRoute allowedRolePrefix="Platform Admin">
                <PlatformAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="overview" element={<PlatformAdminOverview />} />
            <Route path="colleges" element={<PlatformAdminColleges />} />
            <Route path="colleges/new" element={<PlatformAdminCollegeNew />} />
            <Route path="iam" element={<PlatformAdminIAM />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
