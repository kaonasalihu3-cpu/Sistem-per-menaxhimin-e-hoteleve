import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import RoomFilters from '../components/RoomFilters';
import RoomFormModal from '../components/RoomFormModal';
import StatusBadge from '../components/StatusBadge';
import { createRoom, deleteRoom, getRooms, updateRoom } from '../api/roomsApi';
import { getRoomTypes } from '../api/roomTypesApi';

const INITIAL_FILTERS = {
  status: '',
  room_type_id: '',
  min_price: '',
  max_price: '',
  capacity: '',
  search: '',
};

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const appliedFilters = useMemo(() => filters, [filters]);

  const loadRooms = async (nextFilters = appliedFilters) => {
    try {
      setLoading(true);
      setError('');
      const [roomsResponse, roomTypesResponse] = await Promise.all([
        getRooms(nextFilters),
        getRoomTypes(),
      ]);
      setRooms(roomsResponse.items);
      setRoomTypes(roomTypesResponse);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(INITIAL_FILTERS);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadRooms(appliedFilters);
    }, 250);

    return () => clearTimeout(timeout);
  }, [appliedFilters.status, appliedFilters.room_type_id, appliedFilters.min_price, appliedFilters.max_price, appliedFilters.capacity, appliedFilters.search]);

  const handleOpenCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditing(room);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      if (editing) {
        await updateRoom(editing.id, payload);
      } else {
        await createRoom(payload);
      }
      setModalOpen(false);
      setEditing(null);
      await loadRooms();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room) => {
    const accepted = window.confirm(`Delete room "${room.room_number}"?`);
    if (!accepted) {
      return;
    }

    try {
      setError('');
      await deleteRoom(room.id);
      await loadRooms();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Rooms</h2>
        <button type="button" className="btn" onClick={handleOpenCreate}>
          Add Room
        </button>
      </div>

      <RoomFilters
        filters={filters}
        roomTypes={roomTypes}
        onChange={handleFilterChange}
        onClear={clearFilters}
      />

      {loading ? <LoadingState text="Loading rooms..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadRooms()} /> : null}

      {!loading && !error ? (
        <div className="cards-grid">
          {rooms.map((room) => (
            <article key={room.id} className="room-card">
              <div className="room-card-top">
                <h3>{room.room_number}</h3>
                <StatusBadge status={room.status} />
              </div>
              <p className="room-meta">
                <strong>Type:</strong> {room.room_type?.name || '-'}
              </p>
              <p className="room-meta">
                <strong>Floor:</strong> {room.floor}
              </p>
              <p className="room-meta">
                <strong>Capacity:</strong> {room.capacity}
              </p>
              <p className="room-meta">
                <strong>Price:</strong> ${room.room_type ? Number(room.room_type.price_per_night).toFixed(2) : '-'}
              </p>
              <p className="room-meta">
                <strong>Reservation:</strong> {room.can_be_reserved ? 'Available to reserve' : 'Unavailable'}
              </p>
              <div className="room-card-actions">
                <Link to={`/rooms/${room.id}`} className="btn btn-secondary">
                  Details
                </Link>
                <button type="button" className="btn btn-secondary" onClick={() => handleOpenEdit(room)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(room)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {rooms.length === 0 ? <div className="state">No rooms found for current filters.</div> : null}
        </div>
      ) : null}

      <RoomFormModal
        open={modalOpen}
        initialValue={editing}
        roomTypes={roomTypes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default RoomsPage;

