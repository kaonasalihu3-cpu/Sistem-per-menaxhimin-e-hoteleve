import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import {
  cancelInvoice,
  createInvoiceItem,
  deleteInvoiceItem,
  getInvoice,
  markInvoiceAsPaid,
  updateInvoiceItem,
} from '../services/invoiceService';

function ItemFormModal({ open, initialValue, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    pershkrimi: '',
    shuma: '',
  });

  useEffect(() => {
    if (initialValue) {
      setForm({
        pershkrimi: initialValue.pershkrimi ?? '',
        shuma: initialValue.shuma ?? '',
      });
      return;
    }
    setForm({
      pershkrimi: '',
      shuma: '',
    });
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialValue ? 'Edit Invoice Item' : 'Add Invoice Item'}</h3>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({
              pershkrimi: form.pershkrimi,
              shuma: Number(form.shuma),
            });
          }}
        >
          <label>
            Pershkrimi
            <input value={form.pershkrimi} onChange={(event) => setForm((current) => ({ ...current, pershkrimi: event.target.value }))} required />
          </label>
          <label>
            Shuma
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.shuma}
              onChange={(event) => setForm((current) => ({ ...current, shuma: event.target.value }))}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSaveItem = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      if (editingItem) {
        await updateInvoiceItem(editingItem.id, payload);
        setSuccess('Invoice item updated.');
      } else {
        await createInvoiceItem(invoice.id, payload);
        setSuccess('Invoice item added.');
      }
      setItemModalOpen(false);
      setEditingItem(null);
      await loadInvoice();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete invoice item "${item.pershkrimi}"?`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await deleteInvoiceItem(item.id);
      setSuccess('Invoice item deleted.');
      await loadInvoice();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handlePay = async () => {
    try {
      setError('');
      setSuccess('');
      await markInvoiceAsPaid(invoice.id);
      setSuccess('Invoice marked as paid.');
      await loadInvoice();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel invoice #${invoice.id}?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await cancelInvoice(invoice.id);
      setSuccess('Invoice cancelled.');
      await loadInvoice();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading) {
    return <LoadingState text="Loading invoice details..." />;
  }

  if (error && !invoice) {
    return <ErrorState message={error} onRetry={loadInvoice} />;
  }

  if (!invoice) {
    return <ErrorState message="Invoice not found." />;
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Invoice #{invoice.id}</h2>
        <div className="actions-cell">
          <Link className="btn btn-secondary" to="/invoices">
            Back
          </Link>
          <Link className="btn btn-secondary" to={`/invoices/${invoice.id}/print`}>
            Print View
          </Link>
        </div>
      </div>

      {error ? <div className="flash flash-error">{error}</div> : null}
      {success ? <div className="flash flash-success">{success}</div> : null}

      <div className="invoice-layout">
        <article className="detail-card">
          <div className="detail-row">
            <span>Reservation</span>
            <strong>#{invoice.reservation_id}</strong>
          </div>
          <div className="detail-row">
            <span>Guest</span>
            <strong>{invoice.reservation?.guest?.full_name || '-'}</strong>
          </div>
          <div className="detail-row">
            <span>Room</span>
            <strong>{invoice.reservation?.room?.room_number || '-'}</strong>
          </div>
          <div className="detail-row">
            <span>Date</span>
            <strong>{String(invoice.data_fatures).slice(0, 10)}</strong>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <strong>
              <StatusBadge status={invoice.statusi} />
            </strong>
          </div>
          <div className="detail-row">
            <span>Total</span>
            <strong>${Number(invoice.shuma_totale).toFixed(2)}</strong>
          </div>
          <div className="actions-cell">
            <button type="button" className="btn" disabled={invoice.statusi !== 'unpaid'} onClick={handlePay}>
              Mark as Paid
            </button>
            <button type="button" className="btn btn-secondary" disabled={invoice.statusi === 'cancelled'} onClick={handleCancel}>
              Cancel Invoice
            </button>
          </div>
        </article>

        <article className="detail-card">
          <div className="section-head">
            <h3>Invoice Items</h3>
            <button type="button" className="btn" onClick={() => { setEditingItem(null); setItemModalOpen(true); }}>
              Add Item
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.invoice_items || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.pershkrimi}</td>
                    <td>${Number(item.shuma).toFixed(2)}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn btn-secondary" onClick={() => { setEditingItem(item); setItemModalOpen(true); }}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDeleteItem(item)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(invoice.invoice_items || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-cell">
                      No invoice items found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <ItemFormModal
        open={itemModalOpen}
        initialValue={editingItem}
        onClose={() => setItemModalOpen(false)}
        onSubmit={handleSaveItem}
        submitting={submitting}
      />
    </section>
  );
}

export default InvoiceDetailsPage;

