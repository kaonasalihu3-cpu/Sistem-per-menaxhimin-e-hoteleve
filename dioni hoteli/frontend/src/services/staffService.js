import api from './api';

export async function getStaff(filters = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const response = await api.get('/staff', { params: cleaned });
  return response.data.data ?? [];
}

export async function getStaffById(id) {
  const response = await api.get(`/staff/${id}`);
  return response.data.data;
}

export async function createStaff(payload) {
  const response = await api.post('/staff', payload);
  return response.data.data;
}

export async function updateStaff(id, payload) {
  const response = await api.put(`/staff/${id}`, payload);
  return response.data.data;
}

export async function deleteStaff(id) {
  await api.delete(`/staff/${id}`);
}
