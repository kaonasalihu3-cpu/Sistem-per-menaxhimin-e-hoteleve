import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import { getRooms } from '../api/roomsApi';
import { getGuests } from '../services/guestService';
import ReservationForm from './ReservationForm';
import {
  checkReservationAvailability,
  createReservation,
  deleteReservation,
  getReservations,
  performCheckIn,
  performCheckOut,
  updateReservation,
} from '../services/reservationService';

const INITIAL_FILTERS = {
  guest_id: '',
  room_id: '',
  statusi: '',
  date_from: '',
  date_to: '',
  search: '',
};

function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDependencies = async () => {
    const [guestsData, roomsResponse] = await Promise.all([getGuests(), getRooms()]);
    setGuests(guestsData);
    setRooms(roomsResponse.items ?? []);
  };

  const loadReservations = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const response = await getReservations(nextFilters);
      setReservations(response.items);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await loadDependencies();
        await loadReservations(INITIAL_FILTERS);
      } catch (requestError) {
        setError(requestError.message);
        setLoading(false);
      }
    };

    boot();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadReservations(filters);
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters.guest_id, filters.room_id, filters.statusi, filters.date_from, filters.date_to, filters.search]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      if (editing) {
        await updateReservation(editing.id, payload);
        setSuccessMessage('Reservation updated successfully.');
      } else {
        await createReservation(payload);
        setSuccessMessage('Reservation created successfully.');
      }

      setModalOpen(false);
      setEditing(null);
      await loadReservations();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reservation) => {
    const accepted = window.confirm(`Delete reservation #${reservation.id}?`);
    if (!accepted) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      await deleteReservation(reservation.id);
      setSuccessMessage('Reservation deleted successfully.');
      await loadReservations();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleCheckIn = async (reservation) => {
    try {
      setError('');
      setSuccessMessage('');
      await performCheckIn(reservation.id);
      setSuccessMessage('Check-in completed successfully.');
      await loadReservations();
      await loadDependencies();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleCheckOut = async (reservation) => {
    try {
      setError('');
      setSuccessMessage('');
      await performCheckOut(reservation.id);
      setSuccessMessage('Check-out completed successfully.');
      await loadReservations();
      await loadDependencies();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Reservations</h2>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Reservation
        </button>
      </div>

      {successMessage ? <div className="flash flash-success">{successMessage}</div> : null}

      <section className="filters-panel">
        <h3>Search & Filters</h3>
        <div className="filters-grid">
          <label>
            Guest
            <select name="guest_id" value={filters.guest_id} onChange={handleFilterChange}>
              <option value="">All</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.full_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Room
            <select name="room_id" value={filters.room_id} onChange={handleFilterChange}>
              <option value="">All</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="statusi" value={filters.statusi} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="checked_in">checked_in</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label>
            Date From
            <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
          </label>
          <label>
            Date To
            <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
          </label>
          <label>
            Search
            <input
              name="search"
              placeholder="guest name, email or room"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setFilters(INITIAL_FILTERS)}>
          Clear Filters
        </button>
      </section>

      {loading ? <LoadingState text="Loading reservations..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadReservations()} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.guest?.full_name || '-'}</td>
                  <td>{reservation.room?.room_number || '-'}</td>
                  <td>{String(reservation.data_hyrjes).slice(0, 10)}</td>
                  <td>{String(reservation.data_daljes).slice(0, 10)}</td>
                  <td>{reservation.netet}</td>
                  <td>
                    <StatusBadge status={reservation.statusi} />
                  </td>
                  <td className="actions-cell">
                    <Link to={`/reservations/${reservation.id}`} className="btn btn-secondary">
                      Details
                    </Link>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(reservation);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(reservation)}>
                      Delete
                    </button>
                    <button
                      type="button"
                      className="btn"
                      disabled={!reservation.can_check_in}
                      onClick={() => handleCheckIn(reservation)}
                    >
                      Check-in
                    </button>
                    <button
                      type="button"
                      className="btn"
                      disabled={!reservation.can_check_out}
                      onClick={() => handleCheckOut(reservation)}
                    >
                      Check-out
                    </button>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-cell">
                    No reservations found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <ReservationForm
        open={modalOpen}
        initialValue={editing}
        guests={guests}
        rooms={rooms}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        onCheckAvailability={checkReservationAvailability}
      />
    </section>
  );
}

export default ReservationsPage;