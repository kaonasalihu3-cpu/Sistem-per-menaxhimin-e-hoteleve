import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import AssignRolesPage from './pages/AssignRolesPage';
import CheckInOutPage from './pages/CheckInOutPage';
import GuestsPage from './pages/GuestsPage';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import InvoicesPage from './pages/InvoicesPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ReservationDetails from './pages/ReservationDetails';
import ReservationsPage from './pages/ReservationsPage';
import RolesPage from './pages/RolesPage';
import RoomDetailPage from './pages/RoomDetailPage';
import RoomTypesPage from './pages/RoomTypesPage';
import RoomsPage from './pages/RoomsPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import ServicesPage from './pages/ServicesPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute roles={['admin', 'manager']} />}>
          <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleProtectedRoute roles={['admin', 'manager', 'user']} />}>
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:id" element={<RoomDetailPage />} />
            <Route path="/room-types" element={<RoomTypesPage />} />
            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/reservations/:id" element={<ReservationDetails />} />
          </Route>

          <Route element={<RoleProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="/check-in-out" element={<CheckInOutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service-orders" element={<ServiceOrdersPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
          </Route>

          <Route element={<RoleProtectedRoute roles={['admin']} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/assign-roles" element={<AssignRolesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
