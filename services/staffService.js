import api from './api';
import { cleanQueryParams, extractData } from './httpUtils';

export async function getStaff(filters = {}) {
  const response = await api.get('/staff', { params: cleanQueryParams(filters) });
  return extractData(response, []);
}

export async function getStaffById(id) {
  const response = await api.get(`/staff/${id}`);
  return extractData(response);
}

export async function createStaff(payload) {
  const response = await api.post('/staff', payload);
  return extractData(response);
}

export async function updateStaff(id, payload) {
  const response = await api.put(`/staff/${id}`, payload);
  return extractData(response);
}

export async function deleteStaff(id) {
  await api.delete(`/staff/${id}`);
}
