import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  emri: '',
  mbiemri: '',
  pozicioni: '',
  departamenti: '',
  turni: '',
  email: '',
  telefoni: '',
  statusi: 'active',
  data_punesimit: '',
};

function StaffForm({ open, initialValue, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        emri: initialValue.emri ?? '',
        mbiemri: initialValue.mbiemri ?? '',
        pozicioni: initialValue.pozicioni ?? '',
        departamenti: initialValue.departamenti ?? '',
        turni: initialValue.turni ?? '',
        email: initialValue.email ?? '',
        telefoni: initialValue.telefoni ?? '',
        statusi: initialValue.statusi ?? 'active',
        data_punesimit: String(initialValue.data_punesimit ?? '').slice(0, 10),
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
      email: form.email || null,
      telefoni: form.telefoni || null,
      data_punesimit: form.data_punesimit || null,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Staff' : 'Create Staff'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Emri
            <input value={form.emri} onChange={(event) => setForm((current) => ({ ...current, emri: event.target.value }))} required />
          </label>
          <label>
            Mbiemri
            <input value={form.mbiemri} onChange={(event) => setForm((current) => ({ ...current, mbiemri: event.target.value }))} required />
          </label>
          <label>
            Pozicioni
            <input value={form.pozicioni} onChange={(event) => setForm((current) => ({ ...current, pozicioni: event.target.value }))} required />
          </label>
          <label>
            Departamenti
            <input value={form.departamenti} onChange={(event) => setForm((current) => ({ ...current, departamenti: event.target.value }))} required />
          </label>
          <label>
            Turni
            <input value={form.turni} onChange={(event) => setForm((current) => ({ ...current, turni: event.target.value }))} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label>
            Telefoni
            <input value={form.telefoni} onChange={(event) => setForm((current) => ({ ...current, telefoni: event.target.value }))} />
          </label>
          <label>
            Statusi
            <select value={form.statusi} onChange={(event) => setForm((current) => ({ ...current, statusi: event.target.value }))}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
          <label>
            Data Punesimit
            <input type="date" value={form.data_punesimit} onChange={(event) => setForm((current) => ({ ...current, data_punesimit: event.target.value }))} />
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

export default StaffForm;
