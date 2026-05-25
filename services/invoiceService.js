import api from './api';
import { cleanQueryParams, extractData } from './httpUtils';

export async function getInvoices(filters = {}) {
  const response = await api.get('/invoices', { params: cleanQueryParams(filters) });
  return extractData(response, []);
}

export async function getInvoice(id) {
  const response = await api.get(`/invoices/${id}`);
  return extractData(response);
}

export async function generateInvoice(reservationId) {
  const response = await api.post(`/invoices/generate/${reservationId}`);
  return extractData(response);
}

export async function updateInvoice(id, payload) {
  const response = await api.put(`/invoices/${id}`, payload);
  return extractData(response);
}

export async function deleteInvoice(id) {
  await api.delete(`/invoices/${id}`);
}

export async function markInvoiceAsPaid(id) {
  const response = await api.patch(`/invoices/${id}/pay`);
  return extractData(response);
}

export async function cancelInvoice(id) {
  const response = await api.patch(`/invoices/${id}/cancel`);
  return extractData(response);
}

export async function getInvoiceItems(invoiceId) {
  const response = await api.get(`/invoices/${invoiceId}/items`);
  return extractData(response, []);
}

export async function createInvoiceItem(invoiceId, payload) {
  const response = await api.post(`/invoices/${invoiceId}/items`, payload);
  return extractData(response);
}

export async function updateInvoiceItem(id, payload) {
  const response = await api.put(`/invoice-items/${id}`, payload);
  return extractData(response);
}

export async function deleteInvoiceItem(id) {
  const response = await api.delete(`/invoice-items/${id}`);
  return extractData(response);
}
