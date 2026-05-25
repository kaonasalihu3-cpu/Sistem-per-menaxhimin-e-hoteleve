import apiClient from './client';
import { extractData } from '../services/httpUtils';

export async function getRoomTypes() {
  const response = await apiClient.get('/room-types');
  return extractData(response, []);
}

export async function createRoomType(payload) {
  const response = await apiClient.post('/room-types', payload);
  return extractData(response);
}

export async function updateRoomType(id, payload) {
  const response = await apiClient.put(`/room-types/${id}`, payload);
  return extractData(response);
}

export async function deleteRoomType(id) {
  await apiClient.delete(`/room-types/${id}`);
}
