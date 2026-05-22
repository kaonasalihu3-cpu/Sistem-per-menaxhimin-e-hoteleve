import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import AssignRolesPage from './pages/AssignRolesPage';
import CheckInOutPage from './pages/CheckInOutPage';
import DashboardPage from './pages/DashboardPage';
import GuestsPage from './pages/GuestsPage';
import IncomeReportPage from './pages/IncomeReportPage';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import InvoicesPage from './pages/InvoicesPage';
import LoginPage from './pages/LoginPage';
import OccupancyReportPage from './pages/OccupancyReportPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ReportsPage from './pages/ReportsPage';
import ReservationDetails from './pages/ReservationDetails';
import ReservationReportsPage from './pages/ReservationReportsPage';
import ReservationsPage from './pages/ReservationsPage';
import RolesPage from './pages/RolesPage';
import RoomDetailPage from './pages/RoomDetailPage';
import RoomTypesPage from './pages/RoomTypesPage';
import RoomsPage from './pages/RoomsPage';
import ServiceUsageReportPage from './pages/ServiceUsageReportPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import ServicesPage from './pages/ServicesPage';
import StaffPage from './pages/StaffPage';
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/check-in-out" element={<CheckInOutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service-orders" element={<ServiceOrdersPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/reservations" element={<ReservationReportsPage />} />
            <Route path="/reports/income" element={<IncomeReportPage />} />
            <Route path="/reports/service-usage" element={<ServiceUsageReportPage />} />
            <Route path="/reports/occupancy" element={<OccupancyReportPage />} />
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
