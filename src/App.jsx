import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import GuestsPage from './pages/GuestsPage';
import CheckInOutPage from './pages/CheckInOutPage';
import ReservationDetails from './pages/ReservationDetails';
import ReservationsPage from './pages/ReservationsPage';
import RoomTypesPage from './pages/RoomTypesPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/reservations" replace />} />
        <Route path="/guests" element={<GuestsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/:id" element={<ReservationDetails />} />
        <Route path="/check-in-out" element={<CheckInOutPage />} />
        <Route path="/room-types" element={<RoomTypesPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
      </Routes>
    </Layout>
  );
}

export default App;