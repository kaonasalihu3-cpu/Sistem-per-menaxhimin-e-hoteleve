import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

function GuestOnlyRoute() {
  const { loading, isAuthenticated, getDefaultRoute } = useAuth();

  if (loading) {
    return <LoadingState text="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <Outlet />;
}

export default GuestOnlyRoute;
