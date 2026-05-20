import apiClient from '../api/client';

export async function getCheckInOuts() {
  const response = await apiClient.get('/check-in-outs');
  return response.data.data ?? [];
}

export async function getCheckInOut(id) {
  const response = await apiClient.get(`/check-in-outs/${id}`);
  return response.data.data;
}

export async function createCheckInOut(payload) {
  const response = await apiClient.post('/check-in-outs', payload);
  return response.data.data;
}

export async function updateCheckInOut(id, payload) {
  const response = await apiClient.put(`/check-in-outs/${id}`, payload);
  return response.data.data;
}

export async function deleteCheckInOut(id) {
  await apiClient.delete(`/check-in-outs/${id}`);
}