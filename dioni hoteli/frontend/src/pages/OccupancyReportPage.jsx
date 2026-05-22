import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getOccupancyRateReport } from '../services/reportService';

const INITIAL_FILTERS = {
  date_from: '',
  date_to: '',
};

function OccupancyReportPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const response = await getOccupancyRateReport(nextFilters);
      setData(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(INITIAL_FILTERS);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadReport(filters);
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters.date_from, filters.date_to]);

  return (
    <section className="page">
      <div className="section-head">
        <h2>Occupancy Report</h2>
      </div>

      <section className="filters-panel">
        <h3>Date Range</h3>
        <div className="filters-grid">
          <label>
            Date From
            <input type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
          </label>
          <label>
            Date To
            <input type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} />
          </label>
        </div>
      </section>

      {loading ? <LoadingState text="Loading occupancy report..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadReport()} /> : null}

      {!loading && !error && data ? (
        <div className="dashboard-cards">
          <article className="dashboard-card">
            <p className="dashboard-card-label">Date From</p>
            <p className="dashboard-card-value">{data.date_from}</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-card-label">Date To</p>
            <p className="dashboard-card-value">{data.date_to}</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-card-label">Total Rooms</p>
            <p className="dashboard-card-value">{data.total_rooms}</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-card-label">Occupied Rooms</p>
            <p className="dashboard-card-value">{data.occupied_rooms}</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-card-label">Available Rooms</p>
            <p className="dashboard-card-value">{data.available_rooms}</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-card-label">Occupancy %</p>
            <p className="dashboard-card-value">{Number(data.occupancy_percentage || 0).toFixed(2)}%</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}

export default OccupancyReportPage;
