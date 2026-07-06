import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined text-error text-[48px] mb-4">block</span>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Access Restricted</h3>
        <p className="text-on-surface-variant text-body-md">You don't have permission to view this page.</p>
      </div>
    );
  }
  return children;
}
