import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import {
  createCheckInOut,
  deleteCheckInOut,
  getCheckInOuts,
  updateCheckInOut,
} from '../services/checkInOutService';
import { getReservations } from '../services/reservationService';

function CheckInOutForm({ open, initialValue, reservations, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    reservation_id: '',
    data_checkin: '',
    data_checkout: '',
    shenime: '',
  });

  useEffect(() => {
    if (initialValue) {
      setForm({
        reservation_id: initialValue.reservation_id ?? '',
        data_checkin: initialValue.data_checkin ? String(initialValue.data_checkin).replace(' ', 'T').slice(0, 16) : '',
        data_checkout: initialValue.data_checkout ? String(initialValue.data_checkout).replace(' ', 'T').slice(0, 16) : '',
        shenime: initialValue.shenime ?? '',
      });
      return;
    }

    setForm({
      reservation_id: '',
      data_checkin: '',
      data_checkout: '',
      shenime: '',
    });
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      reservation_id: Number(form.reservation_id),
      data_checkin: form.data_checkin || null,
      data_checkout: form.data_checkout || null,
      shenime: form.shenime || null,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit CheckIn/Out' : 'Create CheckIn/Out'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Reservation
            <select
              name="reservation_id"
              value={form.reservation_id}
              onChange={handleChange}
              required
              disabled={Boolean(initialValue)}
            >
              <option value="">Select reservation</option>
              {reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  #{reservation.id} - {reservation.guest?.full_name || 'Guest'} / Room {reservation.room?.room_number || '-'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Check-in DateTime
            <input type="datetime-local" name="data_checkin" value={form.data_checkin} onChange={handleChange} />
          </label>
          <label>
            Check-out DateTime
            <input type="datetime-local" name="data_checkout" value={form.data_checkout} onChange={handleChange} />
          </label>
          <label>
            Notes
            <textarea name="shenime" rows={3} value={form.shenime} onChange={handleChange} />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CheckInOutPage() {
  const [items, setItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [checkData, reservationData] = await Promise.all([
        getCheckInOuts(),
        getReservations(),
      ]);
      setItems(checkData);
      setReservations(reservationData.items ?? []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      if (editing) {
        const updatePayload = { ...payload };
        delete updatePayload.reservation_id;
        await updateCheckInOut(editing.id, updatePayload);
        setSuccessMessage('CheckIn/Out record updated successfully.');
      } else {
        await createCheckInOut(payload);
        setSuccessMessage('CheckIn/Out record created successfully.');
      }

      setModalOpen(false);
      setEditing(null);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const accepted = window.confirm(`Delete check-in/out #${item.id}?`);
    if (!accepted) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      await deleteCheckInOut(item.id);
      setSuccessMessage('CheckIn/Out record deleted successfully.');
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Check-in / Check-out</h2>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Record
        </button>
      </div>

      {successMessage ? <div className="flash flash-success">{successMessage}</div> : null}
      {loading ? <LoadingState text="Loading check-in/out records..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadData} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reservation</th>
                <th>Guest / Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const reservation = reservations.find((r) => r.id === item.reservation_id);
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>#{item.reservation_id}</td>
                    <td>
                      {reservation?.guest?.full_name || '-'} / {reservation?.room?.room_number || '-'}
                    </td>
                    <td>{item.data_checkin || '-'}</td>
                    <td>{item.data_checkout || '-'}</td>
                    <td>{item.shenime || '-'}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditing(item);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(item)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No check-in/out records found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <CheckInOutForm
        open={modalOpen}
        initialValue={editing}
        reservations={reservations}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default CheckInOutPage;

