import apiClient from '../api/client';
import { extractData } from './httpUtils';

export async function getGuests() {
  const response = await apiClient.get('/guests');
  return extractData(response, []);
}

export async function getGuest(id) {
  const response = await apiClient.get(`/guests/${id}`);
  return extractData(response);
}

export async function createGuest(payload) {
  const response = await apiClient.post('/guests', payload);
  return extractData(response);
}

export async function updateGuest(id, payload) {
  const response = await apiClient.put(`/guests/${id}`, payload);
  return extractData(response);
}

export async function deleteGuest(id) {
  await apiClient.delete(`/guests/${id}`);
}
