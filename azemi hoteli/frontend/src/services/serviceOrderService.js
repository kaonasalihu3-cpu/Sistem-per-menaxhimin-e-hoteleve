import api from './api';

export async function getServiceOrders(filters = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const response = await api.get('/service-orders', { params: cleaned });
  return response.data.data ?? [];
}

export async function getServiceOrder(id) {
  const response = await api.get(`/service-orders/${id}`);
  return response.data.data;
}

export async function createServiceOrder(payload) {
  const response = await api.post('/service-orders', payload);
  return response.data.data;
}

export async function updateServiceOrder(id, payload) {
  const response = await api.put(`/service-orders/${id}`, payload);
  return response.data.data;
}

export async function deleteServiceOrder(id) {
  await api.delete(`/service-orders/${id}`);
}

