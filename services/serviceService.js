import api from './api';
import { cleanQueryParams, extractData } from './httpUtils';

export async function getServices(filters = {}) {
  const response = await api.get('/services', { params: cleanQueryParams(filters) });
  return extractData(response, []);
}

export async function getService(id) {
  const response = await api.get(`/services/${id}`);
  return extractData(response);
}

export async function createService(payload) {
  const response = await api.post('/services', payload);
  return extractData(response);
}

export async function updateService(id, payload) {
  const response = await api.put(`/services/${id}`, payload);
  return extractData(response);
}

export async function deleteService(id) {
  await api.delete(`/services/${id}`);
}
