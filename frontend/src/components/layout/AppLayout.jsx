import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import EmergencyContactsModal from '../shared/EmergencyContactsModal';

const PAGE_META = {
  '/dashboard': { title: 'Home' },
  '/visitors': { title: 'Visitors', subtitle: 'Guest access management' },
  '/maintenance': { title: 'Maintenance', subtitle: 'Service requests' },
  '/facilities': { title: 'Booking', subtitle: 'Facility reservations' },
  '/payments': { title: 'Payments', subtitle: 'Billing & dues' },
  '/community': { title: 'Community', subtitle: 'Announcements & forum' },
  '/security': { title: 'Security', subtitle: 'Vehicles & emergency contacts' },
  '/notifications': { title: 'Notifications' },
  '/profile': { title: 'Profile' },
  '/admin/users': { title: 'Admin', subtitle: 'User management' },
  '/admin/units': { title: 'Admin', subtitle: 'Unit management' },
};

export default function AppLayout() {
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const current = PAGE_META[location.pathname] || {};

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onReportIncident={() => setIncidentOpen(true)} />
      <TopBar title={current.title || 'SocietySphere'} subtitle={current.subtitle} onMenuClick={() => setSidebarOpen(true)} />
      <main className="pl-0 lg:pl-[264px] pt-16 min-h-screen">
        <div key={location.pathname} className="max-w-[1600px] mx-auto p-5 pb-36 sm:p-6 sm:pb-36 md:p-8 lg:p-10 lg:pb-10 animate-fade-up">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <EmergencyContactsModal open={incidentOpen} onClose={() => setIncidentOpen(false)} />
    </div>
  );
}
