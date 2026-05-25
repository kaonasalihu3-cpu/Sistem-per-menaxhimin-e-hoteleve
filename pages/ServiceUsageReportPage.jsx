import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getServices } from '../services/serviceService';
import { getServiceUsageReport } from '../services/reportService';

const INITIAL_FILTERS = {
  date_from: '',
  date_to: '',
  service_id: '',
};

function ServiceUsageReportPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDependencies = async () => {
    const data = await getServices();
    setServices(data);
  };

  const loadReport = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const response = await getServiceUsageReport(nextFilters);
      setItems(response.items ?? []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.all([loadDependencies(), loadReport(INITIAL_FILTERS)]);
      } catch (requestError) {
        setError(requestError.message);
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadReport(filters);
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters.date_from, filters.date_to, filters.service_id]);

  return (
    <section className="page">
      <div className="section-head">
        <h2>Service Usage Report</h2>
      </div>

      <section className="filters-panel">
        <h3>Filters</h3>
        <div className="filters-grid">
          <label>
            Date From
            <input type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
          </label>
          <label>
            Date To
            <input type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} />
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
        </div>
      </section>

      {loading ? <LoadingState text="Loading service usage..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadReport()} /> : null}

      {!loading && !error ? (
        <>
          <section className="chart-card">
            <h3>Quantity by Service</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={items}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_quantity" fill="#1b6aa8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Total Quantity</th>
                  <th>Total Revenue</th>
                  <th>Reservation Count</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.service_id}>
                    <td>{item.service_name}</td>
                    <td>{item.total_quantity}</td>
                    <td>${Number(item.total_revenue).toFixed(2)}</td>
                    <td>{item.reservation_count}</td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      No service usage data found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default ServiceUsageReportPage;
