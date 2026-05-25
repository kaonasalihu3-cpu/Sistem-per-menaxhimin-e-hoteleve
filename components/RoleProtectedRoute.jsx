import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleProtectedRoute({ roles = [] }) {
  const { user, getDefaultRoute } = useAuth();

  const allowed = roles.some((role) =>
    user?.roles?.some((item) => item.normalized_name === String(role).toLowerCase())
  );

  if (!allowed) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
