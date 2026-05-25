import api from './api';
import { cleanQueryParams, extractData } from './httpUtils';

export async function getServiceOrders(filters = {}) {
  const response = await api.get('/service-orders', { params: cleanQueryParams(filters) });
  return extractData(response, []);
}

export async function getServiceOrder(id) {
  const response = await api.get(`/service-orders/${id}`);
  return extractData(response);
}

export async function createServiceOrder(payload) {
  const response = await api.post('/service-orders', payload);
  return extractData(response);
}

export async function updateServiceOrder(id, payload) {
  const response = await api.put(`/service-orders/${id}`, payload);
  return extractData(response);
}

export async function deleteServiceOrder(id) {
  await api.delete(`/service-orders/${id}`);
}
