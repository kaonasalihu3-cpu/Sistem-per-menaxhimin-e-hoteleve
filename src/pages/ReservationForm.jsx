import { useEffect, useState } from 'react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'];

const INITIAL_FORM = {
  guest_id: '',
  room_id: '',
  data_hyrjes: '',
  data_daljes: '',
  statusi: 'pending',
  nr_personave: 1,
};

function ReservationForm({ open, initialValue, guests, rooms, onSubmit, onClose, submitting, onCheckAvailability }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  useEffect(() => {
    if (initialValue) {
      setForm({
        guest_id: initialValue.guest_id ?? '',
        room_id: initialValue.room_id ?? '',
        data_hyrjes: initialValue.data_hyrjes ? String(initialValue.data_hyrjes).slice(0, 10) : '',
        data_daljes: initialValue.data_daljes ? String(initialValue.data_daljes).slice(0, 10) : '',
        statusi: initialValue.statusi ?? 'pending',
        nr_personave: initialValue.nr_personave ?? 1,
      });
      setAvailabilityMessage('');
      return;
    }

    setForm(INITIAL_FORM);
    setAvailabilityMessage('');
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAvailabilityCheck = async () => {
    if (!form.room_id || !form.data_hyrjes || !form.data_daljes) {
      setAvailabilityMessage('Select room and date range first.');
      return;
    }

    try {
      const result = await onCheckAvailability({
        room_id: Number(form.room_id),
        data_hyrjes: form.data_hyrjes,
        data_daljes: form.data_daljes,
        exclude_reservation_id: initialValue?.id,
      });
      setAvailabilityMessage(result.available ? 'Room is available for these dates.' : 'Room is NOT available for these dates.');
    } catch (error) {
      setAvailabilityMessage(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      guest_id: Number(form.guest_id),
      room_id: Number(form.room_id),
      nr_personave: Number(form.nr_personave),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Reservation' : 'Create Reservation'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Guest
            <select name="guest_id" value={form.guest_id} onChange={handleChange} required>
              <option value="">Select guest</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.full_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Room
            <select name="room_id" value={form.room_id} onChange={handleChange} required>
              <option value="">Select room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} ({room.room_type?.name || 'No type'})
                </option>
              ))}
            </select>
          </label>
          <label>
            Check-in Date
            <input type="date" name="data_hyrjes" value={form.data_hyrjes} onChange={handleChange} required />
          </label>
          <label>
            Check-out Date
            <input type="date" name="data_daljes" value={form.data_daljes} onChange={handleChange} required />
          </label>
          <label>
            Status
            <select name="statusi" value={form.statusi} onChange={handleChange} required>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Number of Persons
            <input type="number" name="nr_personave" min="1" value={form.nr_personave} onChange={handleChange} required />
          </label>

          <div className="availability-row">
            <button type="button" className="btn btn-secondary" onClick={handleAvailabilityCheck}>
              Check Availability
            </button>
            {availabilityMessage ? <span className="availability-message">{availabilityMessage}</span> : null}
          </div>

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

export default ReservationForm;