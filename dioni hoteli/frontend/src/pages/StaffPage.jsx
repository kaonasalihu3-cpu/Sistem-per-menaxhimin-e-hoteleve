import { useEffect, useMemo, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import {
  createStaff,
  deleteStaff,
  getStaff,
  updateStaff,
} from '../services/staffService';
import StaffForm from './StaffForm';

const INITIAL_FILTERS = {
  departamenti: '',
  turni: '',
  statusi: '',
  search: '',
};

function StaffPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const departments = useMemo(
    () => [...new Set(items.map((item) => item.departamenti).filter(Boolean))],
    [items]
  );

  const shifts = useMemo(
    () => [...new Set(items.map((item) => item.turni).filter(Boolean))],
    [items]
  );

  const loadStaff = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const data = await getStaff(nextFilters);
      setItems(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff(INITIAL_FILTERS);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStaff(filters);
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters.departamenti, filters.turni, filters.statusi, filters.search]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (editing) {
        await updateStaff(editing.id, payload);
        setSuccess('Staff updated successfully.');
      } else {
        await createStaff(payload);
        setSuccess('Staff created successfully.');
      }

      setFormOpen(false);
      setEditing(null);
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete staff member "${item.full_name}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteStaff(item.id);
      setSuccess('Staff deleted successfully.');
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Staff</h2>
        <button type="button" className="btn" onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Staff
        </button>
      </div>

      {success ? <div className="flash flash-success">{success}</div> : null}

      <section className="filters-panel">
        <h3>Filters</h3>
        <div className="filters-grid">
          <label>
            Department
            <select value={filters.departamenti} onChange={(event) => setFilters((current) => ({ ...current, departamenti: event.target.value }))}>
              <option value="">All</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label>
            Shift
            <select value={filters.turni} onChange={(event) => setFilters((current) => ({ ...current, turni: event.target.value }))}>
              <option value="">All</option>
              {shifts.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filters.statusi} onChange={(event) => setFilters((current) => ({ ...current, statusi: event.target.value }))}>
              <option value="">All</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
          <label>
            Search
            <input
              value={filters.search}
              placeholder="name / email / position"
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setFilters(INITIAL_FILTERS)}>
          Clear Filters
        </button>
      </section>

      {loading ? <LoadingState text="Loading staff..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadStaff()} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Hire Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.full_name}</td>
                  <td>{item.pozicioni}</td>
                  <td>{item.departamenti}</td>
                  <td>{item.turni}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.telefoni || '-'}</td>
                  <td>
                    <StatusBadge status={item.statusi} />
                  </td>
                  <td>{item.data_punesimit ? String(item.data_punesimit).slice(0, 10) : '-'}</td>
                  <td className="actions-cell">
                    <button type="button" className="btn btn-secondary" onClick={() => { setEditing(item); setFormOpen(true); }}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(item)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-cell">
                    No staff members found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <StaffForm
        open={formOpen}
        initialValue={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default StaffPage;
