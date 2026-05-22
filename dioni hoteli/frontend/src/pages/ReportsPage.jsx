import { Link } from 'react-router-dom';

function ReportsPage() {
  return (
    <section className="page">
      <div className="section-head">
        <h2>Reports</h2>
      </div>
      <div className="dashboard-cards">
        <Link className="dashboard-card dashboard-link-card" to="/reports/reservations">
          <p className="dashboard-card-label">Reservations Report</p>
          <p className="dashboard-card-value">Open</p>
        </Link>
        <Link className="dashboard-card dashboard-link-card" to="/reports/income">
          <p className="dashboard-card-label">Income Summary</p>
          <p className="dashboard-card-value">Open</p>
        </Link>
        <Link className="dashboard-card dashboard-link-card" to="/reports/service-usage">
          <p className="dashboard-card-label">Service Usage</p>
          <p className="dashboard-card-value">Open</p>
        </Link>
        <Link className="dashboard-card dashboard-link-card" to="/reports/occupancy">
          <p className="dashboard-card-label">Occupancy Rate</p>
          <p className="dashboard-card-value">Open</p>
        </Link>
      </div>
    </section>
  );
}

export default ReportsPage;
