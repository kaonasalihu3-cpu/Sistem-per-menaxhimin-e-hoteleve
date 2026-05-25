import apiClient from './client';
import { cleanQueryParams, extractData } from '../services/httpUtils';

export async function getRooms(filters = {}) {
  const response = await apiClient.get('/rooms', { params: cleanQueryParams(filters) });
  return {
    items: extractData(response, []),
    meta: response.data.meta ?? {},
  };
}

export async function getRoom(id) {
  const response = await apiClient.get(`/rooms/${id}`);
  return extractData(response);
}

export async function createRoom(payload) {
  const response = await apiClient.post('/rooms', payload);
  return extractData(response);
}

export async function updateRoom(id, payload) {
  const response = await apiClient.put(`/rooms/${id}`, payload);
  return extractData(response);
}

export async function deleteRoom(id) {
  await apiClient.delete(`/rooms/${id}`);
}
