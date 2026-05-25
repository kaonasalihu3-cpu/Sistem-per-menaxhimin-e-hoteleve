import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import { getReservations } from '../services/reservationService';
import {
  createServiceOrder,
  deleteServiceOrder,
  getServiceOrders,
  updateServiceOrder,
} from '../services/serviceOrderService';
import { getServices } from '../services/serviceService';
import ServiceOrderForm from './ServiceOrderForm';

const INITIAL_FILTERS = {
  statusi: '',
  reservation_id: '',
  service_id: '',
  date_from: '',
  date_to: '',
  search: '',
};

function ServiceOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDependencies = async () => {
    const [reservationsResult, servicesResult] = await Promise.all([
      getReservations(),
      getServices({ statusi: 'active' }),
    ]);
    setReservations(reservationsResult.items ?? []);
    setServices(servicesResult);
  };

  const loadOrders = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const data = await getServiceOrders(nextFilters);
      setOrders(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await loadDependencies();
        await loadOrders(INITIAL_FILTERS);
      } catch (requestError) {
        setError(requestError.message);
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadOrders(filters);
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters.statusi, filters.reservation_id, filters.service_id, filters.date_from, filters.date_to, filters.search]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      if (editing) {
        await updateServiceOrder(editing.id, payload);
        setSuccess('Service order updated successfully.');
      } else {
        await createServiceOrder(payload);
        setSuccess('Service order created successfully.');
      }
      setFormOpen(false);
      setEditing(null);
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Delete service order #${order.id}?`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await deleteServiceOrder(order.id);
      setSuccess('Service order deleted successfully.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Service Orders</h2>
        <button type="button" className="btn" onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Service Order
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
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label>
            Reservation
            <select value={filters.reservation_id} onChange={(event) => setFilters((current) => ({ ...current, reservation_id: event.target.value }))}>
              <option value="">All</option>
              {reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  #{reservation.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Service
            <select value={filters.service_id} onChange={(event) => setFilters((current) => ({ ...current, service_id: event.target.value }))}>
              <option value="">All</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.emertimi}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date From
            <input type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
          </label>
          <label>
            Date To
            <input type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} />
          </label>
          <label>
            Search
            <input
              placeholder="service / guest / room"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setFilters(INITIAL_FILTERS)}>
          Clear Filters
        </button>
      </section>

      {loading ? <LoadingState text="Loading service orders..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadOrders()} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reservation</th>
                <th>Service</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>#{order.reservation_id}</td>
                  <td>{order.service?.emertimi || '-'}</td>
                  <td>{order.sasia}</td>
                  <td>{String(order.data).slice(0, 10)}</td>
                  <td>
                    <StatusBadge status={order.statusi} />
                  </td>
                  <td className="actions-cell">
                    <button type="button" className="btn btn-secondary" onClick={() => { setEditing(order); setFormOpen(true); }}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(order)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No service orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <ServiceOrderForm
        open={formOpen}
        initialValue={editing}
        reservations={reservations}
        services={services}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default ServiceOrdersPage;

