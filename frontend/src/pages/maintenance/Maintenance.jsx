import { useAuth } from '../../context/AuthContext';
import ResidentMaintenance from './ResidentMaintenance';
import StaffMaintenance from './StaffMaintenance';

export default function Maintenance() {
  const { user } = useAuth();
  if (['Staff', 'Admin', 'SuperAdmin'].includes(user?.role)) return <StaffMaintenance />;
  return <ResidentMaintenance />;
}
