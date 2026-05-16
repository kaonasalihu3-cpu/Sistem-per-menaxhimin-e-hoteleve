import apiClient from './client';

export async function getRooms(filters = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const response = await apiClient.get('/rooms', { params: cleaned });
  return {
    items: response.data.data ?? [],
    meta: response.data.meta ?? {},
  };
}

export async function getRoom(id) {
  const response = await apiClient.get(`/rooms/${id}`);
  return response.data.data;
}

export async function createRoom(payload) {
  const response = await apiClient.post('/rooms', payload);
  return response.data.data;
}

export async function updateRoom(id, payload) {
  const response = await apiClient.put(`/rooms/${id}`, payload);
  return response.data.data;
}

export async function deleteRoom(id) {
  await apiClient.delete(`/rooms/${id}`);
}