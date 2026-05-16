const STATUS_CLASS = {
    available: 'status-available',
    occupied: 'status-occupied',
    maintenance: 'status-maintenance',
};

function StatusBadge({ status }) {
    const cssClass = STATUS_CLASS[status] || '';
    return <span className={`status-badge ${cssClass}`}>{status}</span>;
}

export default StatusBadge;