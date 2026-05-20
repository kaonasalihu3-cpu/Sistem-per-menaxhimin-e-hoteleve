import apiClient from '../api/client';

export async function getGuests() {
  const response = await apiClient.get('/guests');
  return response.data.data ?? [];
}

export async function getGuest(id) {
  const response = await apiClient.get(`/guests/${id}`);
  return response.data.data;
}

export async function createGuest(payload) {
  const response = await apiClient.post('/guests', payload);
  return response.data.data;
}

export async function updateGuest(id, payload) {
  const response = await apiClient.put(`/guests/${id}`, payload);
  return response.data.data;
}

export async function deleteGuest(id) {
  await apiClient.delete(`/guests/${id}`);
}