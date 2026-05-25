import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import { getInvoices, generateInvoice, markInvoiceAsPaid, cancelInvoice, deleteInvoice } from '../services/invoiceService';
import { getReservations } from '../services/reservationService';

const INITIAL_FILTERS = {
  statusi: '',
  reservation_id: '',
  date_from: '',
  date_to: '',
  search: '',
};

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [generateReservationId, setGenerateReservationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadInvoices = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const data = await getInvoices(nextFilters);
      setInvoices(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    const result = await getReservations();
    setReservations(result.items ?? []);
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.all([loadInvoices(INITIAL_FILTERS), loadReservations()]);
      } catch (requestError) {
        setError(requestError.message);
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadInvoices(filters);
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters.statusi, filters.reservation_id, filters.date_from, filters.date_to, filters.search]);

  const handleGenerate = async () => {
    if (!generateReservationId) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await generateInvoice(Number(generateReservationId));
      setSuccess('Invoice generated successfully.');
      setGenerateReservationId('');
      await loadInvoices();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleMarkPaid = async (invoice) => {
    try {
      setError('');
      setSuccess('');
      await markInvoiceAsPaid(invoice.id);
      setSuccess('Invoice marked as paid.');
      await loadInvoices();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleCancel = async (invoice) => {
    if (!window.confirm(`Cancel invoice #${invoice.id}?`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await cancelInvoice(invoice.id);
      setSuccess('Invoice cancelled.');
      await loadInvoices();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDelete = async (invoice) => {
    if (!window.confirm(`Delete invoice #${invoice.id}?`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await deleteInvoice(invoice.id);
      setSuccess('Invoice deleted.');
      await loadInvoices();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Invoices</h2>
      </div>

      {success ? <div className="flash flash-success">{success}</div> : null}

      <section className="filters-panel">
        <h3>Generate Invoice</h3>
        <div className="filters-grid">
          <label>
            Reservation
            <select value={generateReservationId} onChange={(event) => setGenerateReservationId(event.target.value)}>
              <option value="">Select reservation</option>
              {reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  #{reservation.id} - {reservation.guest?.full_name || 'Guest'} / Room {reservation.room?.room_number || '-'}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="btn" onClick={handleGenerate}>
          Generate Invoice
        </button>
      </section>

      <section className="filters-panel">
        <h3>Filters</h3>
        <div className="filters-grid">
          <label>
            Status
            <select value={filters.statusi} onChange={(event) => setFilters((current) => ({ ...current, statusi: event.target.value }))}>
              <option value="">All</option>
              <option value="unpaid">unpaid</option>
              <option value="paid">paid</option>
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
              placeholder="invoice/reservation/guest/room"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setFilters(INITIAL_FILTERS)}>
          Clear Filters
        </button>
      </section>

      {loading ? <LoadingState text="Loading invoices..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => loadInvoices()} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reservation</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>#{invoice.id}</td>
                  <td>#{invoice.reservation_id}</td>
                  <td>{invoice.reservation?.guest?.full_name || '-'}</td>
                  <td>{invoice.reservation?.room?.room_number || '-'}</td>
                  <td>{String(invoice.data_fatures).slice(0, 10)}</td>
                  <td>
                    <StatusBadge status={invoice.statusi} />
                  </td>
                  <td>${Number(invoice.shuma_totale).toFixed(2)}</td>
                  <td className="actions-cell">
                    <Link className="btn btn-secondary" to={`/invoices/${invoice.id}`}>
                      Details
                    </Link>
                    <Link className="btn btn-secondary" to={`/invoices/${invoice.id}/print`}>
                      Print
                    </Link>
                    <button
                      type="button"
                      className="btn"
                      disabled={invoice.statusi !== 'unpaid'}
                      onClick={() => handleMarkPaid(invoice)}
                    >
                      Mark Paid
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={invoice.statusi === 'cancelled'}
                      onClick={() => handleCancel(invoice)}
                    >
                      Cancel
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(invoice)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-cell">
                    No invoices found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default InvoicesPage;

