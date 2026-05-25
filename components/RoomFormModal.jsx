import { useEffect, useState } from 'react';

const ROOM_STATUSES = ['available', 'occupied', 'maintenance'];

const INITIAL_FORM = {
  room_type_id: '',
  room_number: '',
  floor: '',
  capacity: '',
  status: 'available',
};

function RoomFormModal({ open, initialValue, roomTypes, onSubmit, onClose, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        room_type_id: initialValue.room_type_id ?? '',
        room_number: initialValue.room_number ?? '',
        floor: initialValue.floor ?? '',
        capacity: initialValue.capacity ?? '',
        status: initialValue.status ?? 'available',
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
      room_type_id: Number(form.room_type_id),
      floor: Number(form.floor),
      capacity: Number(form.capacity),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Room' : 'Create Room'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Room Type
            <select name="room_type_id" value={form.room_type_id} onChange={handleChange} required>
              <option value="">Select room type</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Room Number
            <input name="room_number" value={form.room_number} onChange={handleChange} required />
          </label>
          <label>
            Floor
            <input name="floor" type="number" value={form.floor} onChange={handleChange} required />
          </label>
          <label>
            Capacity
            <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange} required>
              {ROOM_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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

export default RoomFormModal;

