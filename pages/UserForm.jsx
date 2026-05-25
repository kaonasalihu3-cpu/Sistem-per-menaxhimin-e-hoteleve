import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  emri: '',
  mbiemri: '',
  email: '',
  password: '',
  phone_number: '',
  statusi: 'active',
};

function UserForm({ open, initialValue, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialValue) {
      setForm({
        emri: initialValue.emri ?? '',
        mbiemri: initialValue.mbiemri ?? '',
        email: initialValue.email ?? '',
        password: '',
        phone_number: initialValue.phone_number ?? '',
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
    const payload = { ...form };
    if (!payload.password) {
      delete payload.password;
    }
    await onSubmit(payload);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit User' : 'Create User'}</h3>
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
            Email
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          </label>
          <label>
            Password {initialValue ? '(leave empty to keep existing)' : ''}
            <input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required={!initialValue}
            />
          </label>
          <label>
            Phone Number
            <input value={form.phone_number} onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))} />
          </label>
          <label>
            Status
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

export default UserForm;

