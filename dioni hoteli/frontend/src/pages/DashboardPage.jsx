import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import {
  getDashboardSummary,
  getOccupancyChart,
  getRecentReservations,
  getRevenueChart,
} from '../services/dashboardService';
import { getReservationReport, getServiceUsageReport } from '../services/reportService';

const STATUS_COLORS = {
  pending: '#f97316',
  confirmed: '#3b82f6',
  checked_in: '#16a34a',
  completed: '#475569',
  cancelled: '#dc2626',
};

const SERVICE_COLOR = '#0f4c81';

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [occupancyChart, setOccupancyChart] = useState([]);
  const [reservationStatusChart, setReservationStatusChart] = useState([]);
  const [serviceUsageChart, setServiceUsageChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dashboardCards = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      { label: 'Available Rooms', value: summary.available_rooms },
      { label: 'Occupied Rooms', value: summary.occupied_rooms },
      { label: 'Maintenance Rooms', value: summary.maintenance_rooms },
      { label: 'Active Reservations', value: summary.active_reservations },
      { label: 'Check-ins Today', value: summary.check_ins_today },
      { label: 'Check-outs Today', value: summary.check_outs_today },
      { label: 'Monthly Revenue', value: `$${Number(summary.monthly_income || 0).toFixed(2)}` },
      { label: 'Unpaid Invoices', value: summary.unpaid_invoices },
      { label: 'Total Guests', value: summary.total_guests },
      { label: 'Total Staff', value: summary.total_staff },
    ];
  }, [summary]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        summaryData,
        recentData,
        revenueData,
        occupancyData,
        reservationsReport,
        serviceReport,
      ] = await Promise.all([
        getDashboardSummary(),
        getRecentReservations(),
        getRevenueChart(),
        getOccupancyChart(),
        getReservationReport({}),
        getServiceUsageReport({}),
      ]);

      const reservationItems = reservationsReport.items ?? [];
      const statusCounts = reservationItems.reduce((accumulator, item) => {
        const status = item.statusi;
        accumulator[status] = (accumulator[status] || 0) + 1;
        return accumulator;
      }, {});

      setSummary(summaryData);
      setRecentReservations(recentData);
      setRevenueChart(revenueData);
      setOccupancyChart(occupancyData);
      setReservationStatusChart(
        Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
        }))
      );
      setServiceUsageChart((serviceReport.items ?? []).slice(0, 8));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-cards">
        {dashboardCards.map((card) => (
          <article className="dashboard-card" key={card.label}>
            <p className="dashboard-card-label">{card.label}</p>
            <p className="dashboard-card-value">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="chart-grid">
        <section className="chart-card">
          <h3>Monthly Revenue</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_income" stroke="#0f4c81" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="chart-card">
          <h3>Occupancy Rate</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={occupancyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="occupancy_rate" fill="#1b6aa8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="chart-card">
          <h3>Reservations by Status</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={reservationStatusChart} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={95} label>
                  {reservationStatusChart.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="chart-card">
          <h3>Service Usage</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={serviceUsageChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_quantity" fill={SERVICE_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentReservations.map((item) => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>{item.guest_name || '-'}</td>
                <td>{item.room_number || '-'}</td>
                <td>{String(item.data_hyrjes).slice(0, 10)}</td>
                <td>{String(item.data_daljes).slice(0, 10)}</td>
                <td>
                  <StatusBadge status={item.statusi} />
                </td>
              </tr>
            ))}
            {recentReservations.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan={6}>
                  No recent reservations.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </section>
  );
}

export default DashboardPage;
