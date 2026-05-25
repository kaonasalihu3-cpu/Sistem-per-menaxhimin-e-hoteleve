import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import GuestForm from './GuestForm';
import { createGuest, deleteGuest, getGuests, updateGuest } from '../services/guestService';

function GuestsPage() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadGuests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getGuests();
      setGuests(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      if (editing) {
        await updateGuest(editing.id, payload);
        setSuccessMessage('Guest updated successfully.');
      } else {
        await createGuest(payload);
        setSuccessMessage('Guest created successfully.');
      }

      setModalOpen(false);
      setEditing(null);
      await loadGuests();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (guest) => {
    const accepted = window.confirm(`Delete guest "${guest.full_name}"?`);
    if (!accepted) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      await deleteGuest(guest.id);
      setSuccessMessage('Guest deleted successfully.');
      await loadGuests();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Guests</h2>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add Guest
        </button>
      </div>

      {successMessage ? <div className="flash flash-success">{successMessage}</div> : null}
      {loading ? <LoadingState text="Loading guests..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadGuests} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Document</th>
                <th>Nationality</th>
                <th>Reservations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td>{guest.full_name}</td>
                  <td>{guest.email}</td>
                  <td>{guest.telefoni}</td>
                  <td>{guest.nr_dokumentit}</td>
                  <td>{guest.kombesia}</td>
                  <td>{guest.reservations_count ?? 0}</td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(guest);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(guest)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No guests found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <GuestForm
        open={modalOpen}
        initialValue={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default GuestsPage;

