import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  emertimi: '',
  normalized_name: '',
  pershkrimi: '',
};

function RoleForm({ open, initialValue, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        emertimi: initialValue.emertimi ?? '',
        normalized_name: initialValue.normalized_name ?? '',
        pershkrimi: initialValue.pershkrimi ?? '',
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
    await onSubmit(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Role' : 'Create Role'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Role Name
            <input value={form.emertimi} onChange={(event) => setForm((current) => ({ ...current, emertimi: event.target.value }))} required />
          </label>
          <label>
            Normalized Name
            <input
              value={form.normalized_name}
              onChange={(event) => setForm((current) => ({ ...current, normalized_name: event.target.value }))}
              placeholder="admin"
            />
          </label>
          <label>
            Description
            <textarea value={form.pershkrimi} onChange={(event) => setForm((current) => ({ ...current, pershkrimi: event.target.value }))} rows={3} />
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

export default RoleForm;

