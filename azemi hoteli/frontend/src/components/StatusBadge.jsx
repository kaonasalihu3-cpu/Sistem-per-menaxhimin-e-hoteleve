const STATUS_CLASS = {
  available: 'status-available',
  occupied: 'status-occupied',
  maintenance: 'status-maintenance',
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  checked_in: 'status-checked-in',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  active: 'status-active',
  inactive: 'status-inactive',
  unpaid: 'status-unpaid',
  paid: 'status-paid',
};

function StatusBadge({ status }) {
  const cssClass = STATUS_CLASS[status] || '';
  return <span className={`status-badge ${cssClass}`}>{String(status).replace('_', ' ')}</span>;
}

export default StatusBadge;
