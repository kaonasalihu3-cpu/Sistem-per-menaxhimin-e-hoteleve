import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRoom } from '../api/roomsApi';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';

function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRoom = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRoom(id);
      setRoom(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  if (loading) {
    return <LoadingState text="Loading room details..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadRoom} />;
  }

  if (!room) {
    return <ErrorState message="Room not found." />;
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Room Detail</h2>
        <Link to="/rooms" className="btn btn-secondary">
          Back to Rooms
        </Link>
      </div>

      <article className="detail-card">
        <div className="detail-row">
          <span>Room Number</span>
          <strong>{room.room_number}</strong>
        </div>
        <div className="detail-row">
          <span>Room Type</span>
          <strong>{room.room_type?.name || '-'}</strong>
        </div>
        <div className="detail-row">
          <span>Floor</span>
          <strong>{room.floor}</strong>
        </div>
        <div className="detail-row">
          <span>Capacity</span>
          <strong>{room.capacity}</strong>
        </div>
        <div className="detail-row">
          <span>Price per Night</span>
          <strong>${room.room_type ? Number(room.room_type.price_per_night).toFixed(2) : '-'}</strong>
        </div>
        <div className="detail-row">
          <span>Status</span>
          <strong>
            <StatusBadge status={room.status} />
          </strong>
        </div>
      </article>
    </section>
  );
}

export default RoomDetailPage;

