import { useAuth } from '../../context/AuthContext';
import ResidentHome from './ResidentHome';
import GuardHome from './GuardHome';
import AdminHome from './AdminHome';
import StaffHome from './StaffHome';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'Guard') return <GuardHome />;
  if (user?.role === 'Admin' || user?.role === 'SuperAdmin') return <AdminHome />;
  if (user?.role === 'Staff') return <StaffHome />;
  return <ResidentHome />;
}
