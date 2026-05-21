import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import {
  createService,
  deleteService,
  getServices,
  updateService,
} from '../services/serviceService';
import ServiceForm from './ServiceForm';

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    statusi: '',
    search: '',
  });

  const loadServices = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const data = await getServices(nextFilters);
      setServices(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadServices(filters);
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters.statusi, filters.search]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      if (editing) {
        await updateService(editing.id, payload);
        setSuccess('Service updated successfully.');
      } else {
        await createService(payload);
        setSuccess('Service created successfully.');
      }
      setFormOpen(false);
      setEditing(null);
      await loadServices();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete service "${item.emertimi}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteService(item.id);
      setSuccess('Service deleted successfully.');
      await loadServices();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Services</h2>
        <button type="button" className="btn" onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Service
        </button>
      </div>

      {success ? <div className="flash flash-success">{success}</div> : null}

      <section className="filters-panel">
        <h3>Filters</h3>
        <div className="filters-grid">
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
              placeholder="name / description"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>
        </div>
      </section>

      {loading ? <LoadingState text="Loading services..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadServices()} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Emertimi</th>
                <th>Pershkrimi</th>
                <th>Cmimi</th>
                <th>Statusi</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((item) => (
                <tr key={item.id}>
                  <td>{item.emertimi}</td>
                  <td>{item.pershkrimi || '-'}</td>
                  <td>${Number(item.cmimi).toFixed(2)}</td>
                  <td>
                    <StatusBadge status={item.statusi} />
                  </td>
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
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No services found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <ServiceForm
        open={formOpen}
        initialValue={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default ServicesPage;

