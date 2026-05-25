import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  emri: '',
  mbiemri: '',
  email: '',
  telefoni: '',
  nr_dokumentit: '',
  kombesia: '',
};

function GuestForm({ open, initialValue, onSubmit, onClose, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        emri: initialValue.emri ?? '',
        mbiemri: initialValue.mbiemri ?? '',
        email: initialValue.email ?? '',
        telefoni: initialValue.telefoni ?? '',
        nr_dokumentit: initialValue.nr_dokumentit ?? '',
        kombesia: initialValue.kombesia ?? '',
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
    await onSubmit(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Guest' : 'Create Guest'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Emri
            <input name="emri" value={form.emri} onChange={handleChange} required />
          </label>
          <label>
            Mbiemri
            <input name="mbiemri" value={form.mbiemri} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Telefoni
            <input name="telefoni" value={form.telefoni} onChange={handleChange} required />
          </label>
          <label>
            Nr Dokumentit
            <input name="nr_dokumentit" value={form.nr_dokumentit} onChange={handleChange} required />
          </label>
          <label>
            Kombesia
            <input name="kombesia" value={form.kombesia} onChange={handleChange} required />
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

export default GuestForm;

