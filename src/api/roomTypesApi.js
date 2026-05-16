import apiClient from './client';

export async function getRoomTypes() {
  const response = await apiClient.get('/room-types');
  return response.data.data ?? [];
}

export async function createRoomType(payload) {
  const response = await apiClient.post('/room-types', payload);
  return response.data.data;
}

export async function updateRoomType(id, payload) {
  const response = await apiClient.put(`/room-types/${id}`, payload);
  return response.data.data;
}

export async function deleteRoomType(id) {
  await apiClient.delete(`/room-types/${id}`);
}
