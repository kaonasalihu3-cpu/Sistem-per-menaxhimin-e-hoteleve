import api from './api';
import { extractData } from './httpUtils';

export async function getRoles() {
  const response = await api.get('/roles');
  return extractData(response, []);
}

export async function getRole(id) {
  const response = await api.get(`/roles/${id}`);
  return extractData(response);
}

export async function createRole(payload) {
  const response = await api.post('/roles', payload);
  return extractData(response);
}

export async function updateRole(id, payload) {
  const response = await api.put(`/roles/${id}`, payload);
  return extractData(response);
}

export async function deleteRole(id) {
  await api.delete(`/roles/${id}`);
}
