import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { getInvoice } from '../services/invoiceService';

function InvoicePrintPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInvoice(id);
      setInvoice(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  if (loading) {
    return <LoadingState text="Loading printable invoice..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadInvoice} />;
  }

  if (!invoice) {
    return <ErrorState message="Invoice not found." />;
  }

  return (
    <div className="print-shell">
      <div className="print-actions no-print">
        <Link to={`/invoices/${invoice.id}`} className="btn btn-secondary">
          Back
        </Link>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <article className="print-invoice">
        <header className="print-header">
          <h1>Hotel Invoice</h1>
          <p>Invoice #{invoice.id}</p>
        </header>

        <section className="print-meta">
          <p><strong>Date:</strong> {String(invoice.data_fatures).slice(0, 10)}</p>
          <p><strong>Status:</strong> {invoice.statusi}</p>
          <p><strong>Reservation:</strong> #{invoice.reservation_id}</p>
          <p><strong>Guest:</strong> {invoice.reservation?.guest?.full_name || '-'}</p>
          <p><strong>Room:</strong> {invoice.reservation?.room?.room_number || '-'}</p>
        </section>

        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.invoice_items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.pershkrimi}</td>
                <td>${Number(item.shuma).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-total">
          <strong>Total: ${Number(invoice.shuma_totale).toFixed(2)}</strong>
        </div>
      </article>
    </div>
  );
}

export default InvoicePrintPage;

