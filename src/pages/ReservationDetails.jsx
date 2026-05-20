import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import { getReservation } from '../services/reservationService';

function ReservationDetails() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservation = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getReservation(id);
      setReservation(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservation();
  }, [id]);

  if (loading) {
    return <LoadingState text="Loading reservation details..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadReservation} />;
  }

  if (!reservation) {
    return <ErrorState message="Reservation not found." />;
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Reservation Details</h2>
        <Link to="/reservations" className="btn btn-secondary">
          Back to Reservations
        </Link>
      </div>

      <article className="detail-card">
        <div className="detail-row">
          <span>Guest</span>
          <strong>{reservation.guest?.full_name || '-'}</strong>
        </div>
        <div className="detail-row">
          <span>Room</span>
          <strong>{reservation.room?.room_number || '-'}</strong>
        </div>
        <div className="detail-row">
          <span>Check-in Date</span>
          <strong>{String(reservation.data_hyrjes).slice(0, 10)}</strong>
        </div>
        <div className="detail-row">
          <span>Check-out Date</span>
          <strong>{String(reservation.data_daljes).slice(0, 10)}</strong>
        </div>
        <div className="detail-row">
          <span>Nights</span>
          <strong>{reservation.netet}</strong>
        </div>
        <div className="detail-row">
          <span>Persons</span>
          <strong>{reservation.nr_personave}</strong>
        </div>
        <div className="detail-row">
          <span>Status</span>
          <strong>
            <StatusBadge status={reservation.statusi} />
          </strong>
        </div>
        <div className="detail-row">
          <span>Check-in Time</span>
          <strong>{reservation.check_in_out?.data_checkin || '-'}</strong>
        </div>
        <div className="detail-row">
          <span>Check-out Time</span>
          <strong>{reservation.check_in_out?.data_checkout || '-'}</strong>
        </div>
      </article>
    </section>
  );
}

export default ReservationDetails;