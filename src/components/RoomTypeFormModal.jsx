import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  name: '',
  description: '',
  price_per_night: '',
  capacity: '',
};

function RoomTypeFormModal({ open, initialValue, onSubmit, onClose, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name ?? '',
        description: initialValue.description ?? '',
        price_per_night: initialValue.price_per_night ?? '',
        capacity: initialValue.capacity ?? '',
      });
      return;
    }
    setForm(INITIAL_FORM);
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
      ...form,
      price_per_night: Number(form.price_per_night),
      capacity: Number(form.capacity),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Room Type' : 'Create Room Type'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <label>
            Price Per Night
            <input
              name="price_per_night"
              type="number"
              min="0.01"
              step="0.01"
              value={form.price_per_night}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Capacity
            <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
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

export default RoomTypeFormModal;

