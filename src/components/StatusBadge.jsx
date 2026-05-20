const STATUS_CLASS = {
  available: 'status-available',
  occupied: 'status-occupied',
  maintenance: 'status-maintenance',
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  checked_in: 'status-checked-in',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
};

function StatusBadge({ status }) {
  const cssClass = STATUS_CLASS[status] || '';
  return <span className={`status-badge ${cssClass}`}>{String(status).replace('_', ' ')}</span>;
}

export default StatusBadge;