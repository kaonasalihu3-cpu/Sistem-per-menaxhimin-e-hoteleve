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
import { getIncomeSummary } from '../services/reportService';

const INITIAL_FILTERS = {
  date_from: '',
  date_to: '',
};

function IncomeReportPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const response = await getIncomeSummary(nextFilters);
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
        <h2>Income Summary Report</h2>
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

      {loading ? <LoadingState text="Loading income summary..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadReport()} /> : null}

      {!loading && !error && data ? (
        <>
          <div className="dashboard-cards">
            <article className="dashboard-card">
              <p className="dashboard-card-label">Total Income</p>
              <p className="dashboard-card-value">${Number(data.total_income || 0).toFixed(2)}</p>
            </article>
            <article className="dashboard-card">
              <p className="dashboard-card-label">Paid Invoices</p>
              <p className="dashboard-card-value">{data.paid_invoices}</p>
            </article>
            <article className="dashboard-card">
              <p className="dashboard-card-label">Unpaid Invoices</p>
              <p className="dashboard-card-value">{data.unpaid_invoices}</p>
            </article>
            <article className="dashboard-card">
              <p className="dashboard-card-label">Cancelled Invoices</p>
              <p className="dashboard-card-value">{data.cancelled_invoices}</p>
            </article>
          </div>

          <section className="chart-card">
            <h3>Monthly Income</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.monthly_breakdown ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_income" fill="#0f4c81" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

export default IncomeReportPage;
