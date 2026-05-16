import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import RoomTypeFormModal from '../components/RoomTypeFormModal';
import { createRoomType, deleteRoomType, getRoomTypes, updateRoomType } from '../api/roomTypesApi';

function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRoomTypes();
      setRoomTypes(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const handleOpenCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (roomType) => {
    setEditing(roomType);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      if (editing) {
        await updateRoomType(editing.id, payload);
      } else {
        await createRoomType(payload);
      }
      setModalOpen(false);
      setEditing(null);
      await loadRoomTypes();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roomType) => {
    const accepted = window.confirm(`Delete room type "${roomType.name}"?`);
    if (!accepted) {
      return;
    }

    try {
      setError('');
      await deleteRoomType(roomType.id);
      await loadRoomTypes();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Room Types</h2>
        <button type="button" className="btn" onClick={handleOpenCreate}>
          Add Room Type
        </button>
      </div>

      {loading ? <LoadingState text="Loading room types..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadRoomTypes} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price / Night</th>
                <th>Capacity</th>
                <th>Rooms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((roomType) => (
                <tr key={roomType.id}>
                  <td>{roomType.name}</td>
                  <td>{roomType.description || '-'}</td>
                  <td>${Number(roomType.price_per_night).toFixed(2)}</td>
                  <td>{roomType.capacity}</td>
                  <td>{roomType.rooms_count ?? 0}</td>
                  <td className="actions-cell">
                    <button type="button" className="btn btn-secondary" onClick={() => handleOpenEdit(roomType)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(roomType)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {roomTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No room types found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <RoomTypeFormModal
        open={modalOpen}
        initialValue={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default RoomTypesPage;

