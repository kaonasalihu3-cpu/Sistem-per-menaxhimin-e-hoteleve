import api from './api';

export async function getServices(filters = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const response = await api.get('/services', { params: cleaned });
  return response.data.data ?? [];
}

export async function getService(id) {
  const response = await api.get(`/services/${id}`);
  return response.data.data;
}

export async function createService(payload) {
  const response = await api.post('/services', payload);
  return response.data.data;
}

export async function updateService(id, payload) {
  const response = await api.put(`/services/${id}`, payload);
  return response.data.data;
}

export async function deleteService(id) {
  await api.delete(`/services/${id}`);
}

