import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  emertimi: '',
  pershkrimi: '',
  cmimi: '',
  statusi: 'active',
};

function ServiceForm({ open, initialValue, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        emertimi: initialValue.emertimi ?? '',
        pershkrimi: initialValue.pershkrimi ?? '',
        cmimi: initialValue.cmimi ?? '',
        statusi: initialValue.statusi ?? 'active',
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
      cmimi: Number(form.cmimi),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Service' : 'Create Service'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Emertimi
            <input value={form.emertimi} onChange={(event) => setForm((current) => ({ ...current, emertimi: event.target.value }))} required />
          </label>
          <label>
            Pershkrimi
            <textarea value={form.pershkrimi} onChange={(event) => setForm((current) => ({ ...current, pershkrimi: event.target.value }))} rows={3} />
          </label>
          <label>
            Cmimi
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cmimi}
              onChange={(event) => setForm((current) => ({ ...current, cmimi: event.target.value }))}
              required
            />
          </label>
          <label>
            Statusi
            <select value={form.statusi} onChange={(event) => setForm((current) => ({ ...current, statusi: event.target.value }))}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
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

export default ServiceForm;

