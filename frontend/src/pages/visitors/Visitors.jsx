import { useAuth } from '../../context/AuthContext';
import ResidentVisitors from './ResidentVisitors';
import GuardVisitors from './GuardVisitors';

export default function Visitors() {
  const { user } = useAuth();
  if (['Guard', 'Admin', 'SuperAdmin'].includes(user?.role)) return <GuardVisitors />;
  return <ResidentVisitors />;
}
