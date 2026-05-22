import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import { getRooms } from '../api/roomsApi';
import { getGuests } from '../services/guestService';
import { getReservationReport } from '../services/reportService';

const INITIAL_FILTERS = {
  date_from: '',
  date_to: '',
  status: '',
  room_id: '',
  guest_id: '',
  search: '',
};

function ReservationReportsPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);

  const loadDependencies = async () => {
    const [guestData, roomsResponse] = await Promise.all([getGuests(), getRooms()]);
    setGuests(guestData);
    setRooms(roomsResponse.items ?? []);
  };

  const loadReport = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const response = await getReservationReport(nextFilters);
      setItems(response.items ?? []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.all([loadDependencies(), loadReport(INITIAL_FILTERS)]);
      } catch (requestError) {
        setError(requestError.message);
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadReport(filters);
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters.date_from, filters.date_to, filters.status, filters.room_id, filters.guest_id, filters.search]);

  const exportCsv = () => {
    const header = ['Reservation ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Status', 'Persons', 'Nights'];
    const rows = items.map((item) => [
      item.id,
      item.guest?.full_name || '',
      item.room?.room_number || '',
      String(item.data_hyrjes).slice(0, 10),
      String(item.data_daljes).slice(0, 10),
      item.statusi,
      item.nr_personave,
      item.netet,
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reservation-report.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Reservation Report</h2>
        <button type="button" className="btn btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <section className="filters-panel">
        <h3>Filters</h3>
        <div className="filters-grid">
          <label>
            Date From
            <input type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
          </label>
          <label>
            Date To
            <input type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} />
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">All</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="checked_in">checked_in</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label>
            Guest
            <select value={filters.guest_id} onChange={(event) => setFilters((current) => ({ ...current, guest_id: event.target.value }))}>
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
            <select value={filters.room_id} onChange={(event) => setFilters((current) => ({ ...current, room_id: event.target.value }))}>
              <option value="">All</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number}
                </option>
              ))}
            </select>
          </label>
          <label>
            Search
            <input
              value={filters.search}
              placeholder="guest/email/room"
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>
        </div>
      </section>

      {loading ? <LoadingState text="Loading reservation report..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadReport()} /> : null}

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
                <th>Status</th>
                <th>Persons</th>
                <th>Nights</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.guest?.full_name || '-'}</td>
                  <td>{item.room?.room_number || '-'}</td>
                  <td>{String(item.data_hyrjes).slice(0, 10)}</td>
                  <td>{String(item.data_daljes).slice(0, 10)}</td>
                  <td>
                    <StatusBadge status={item.statusi} />
                  </td>
                  <td>{item.nr_personave}</td>
                  <td>{item.netet}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-cell">
                    No reservations in this filter range.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default ReservationReportsPage;
