import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes/guards';
import AppLayout from './components/layout/AppLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Visitors from './pages/visitors/Visitors';
import Maintenance from './pages/maintenance/Maintenance';
import Facilities from './pages/facilities/Facilities';
import Payments from './pages/payments/Payments';
import Community from './pages/community/Community';
import Security from './pages/security/Security';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUnits from './pages/admin/AdminUnits';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} handle={{ title: 'Home' }} />
        <Route path="visitors" element={<Visitors />} handle={{ title: 'Visitors', subtitle: 'Guest access management' }} />
        <Route path="maintenance" element={<Maintenance />} handle={{ title: 'Maintenance', subtitle: 'Service requests' }} />
        <Route path="facilities" element={<Facilities />} handle={{ title: 'Booking', subtitle: 'Facility reservations' }} />
        <Route path="payments" element={<Payments />} handle={{ title: 'Payments', subtitle: 'Billing & dues' }} />
        <Route path="community" element={<Community />} handle={{ title: 'Community', subtitle: 'Announcements & forum' }} />
        <Route path="security" element={<Security />} handle={{ title: 'Security', subtitle: 'Vehicles & emergency contacts' }} />
        <Route path="notifications" element={<Notifications />} handle={{ title: 'Notifications' }} />
        <Route path="profile" element={<Profile />} handle={{ title: 'Profile' }} />
        <Route
          path="admin/users"
          element={
            <RoleRoute roles={['Admin', 'SuperAdmin']}>
              <AdminUsers />
            </RoleRoute>
          }
          handle={{ title: 'Admin', subtitle: 'User management' }}
        />
        <Route
          path="admin/units"
          element={
            <RoleRoute roles={['Admin', 'SuperAdmin']}>
              <AdminUnits />
            </RoleRoute>
          }
          handle={{ title: 'Admin', subtitle: 'Unit management' }}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
