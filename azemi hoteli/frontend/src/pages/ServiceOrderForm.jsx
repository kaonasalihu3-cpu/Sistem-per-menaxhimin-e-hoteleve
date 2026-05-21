import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  reservation_id: '',
  service_id: '',
  sasia: 1,
  data: '',
  statusi: 'pending',
};

function ServiceOrderForm({ open, initialValue, reservations, services, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        reservation_id: initialValue.reservation_id ?? '',
        service_id: initialValue.service_id ?? '',
        sasia: initialValue.sasia ?? 1,
        data: initialValue.data ? String(initialValue.data).slice(0, 10) : '',
        statusi: initialValue.statusi ?? 'pending',
      });
      return;
    }
    setForm(INITIAL_FORM);
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      reservation_id: Number(form.reservation_id),
      service_id: Number(form.service_id),
      sasia: Number(form.sasia),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Service Order' : 'Create Service Order'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Reservation
            <select value={form.reservation_id} onChange={(event) => setForm((current) => ({ ...current, reservation_id: event.target.value }))} required>
              <option value="">Select reservation</option>
              {reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  #{reservation.id} - {reservation.guest?.full_name || 'Guest'} / Room {reservation.room?.room_number || '-'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Service
            <select value={form.service_id} onChange={(event) => setForm((current) => ({ ...current, service_id: event.target.value }))} required>
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.emertimi} (${Number(service.cmimi).toFixed(2)})
                </option>
              ))}
            </select>
          </label>
          <label>
            Sasia
            <input type="number" min="1" value={form.sasia} onChange={(event) => setForm((current) => ({ ...current, sasia: event.target.value }))} required />
          </label>
          <label>
            Data
            <input type="date" value={form.data} onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))} required />
          </label>
          <label>
            Statusi
            <select value={form.statusi} onChange={(event) => setForm((current) => ({ ...current, statusi: event.target.value }))}>
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
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

export default ServiceOrderForm;

