import api from './api';

export async function getInvoices(filters = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const response = await api.get('/invoices', { params: cleaned });
  return response.data.data ?? [];
}

export async function getInvoice(id) {
  const response = await api.get(`/invoices/${id}`);
  return response.data.data;
}

export async function generateInvoice(reservationId) {
  const response = await api.post(`/invoices/generate/${reservationId}`);
  return response.data.data;
}

export async function updateInvoice(id, payload) {
  const response = await api.put(`/invoices/${id}`, payload);
  return response.data.data;
}

export async function deleteInvoice(id) {
  await api.delete(`/invoices/${id}`);
}

export async function markInvoiceAsPaid(id) {
  const response = await api.patch(`/invoices/${id}/pay`);
  return response.data.data;
}

export async function cancelInvoice(id) {
  const response = await api.patch(`/invoices/${id}/cancel`);
  return response.data.data;
}

export async function getInvoiceItems(invoiceId) {
  const response = await api.get(`/invoices/${invoiceId}/items`);
  return response.data.data ?? [];
}

export async function createInvoiceItem(invoiceId, payload) {
  const response = await api.post(`/invoices/${invoiceId}/items`, payload);
  return response.data.data;
}

export async function updateInvoiceItem(id, payload) {
  const response = await api.put(`/invoice-items/${id}`, payload);
  return response.data.data;
}

export async function deleteInvoiceItem(id) {
  const response = await api.delete(`/invoice-items/${id}`);
  return response.data.data;
}

