import apiClient from '../api/client';
import { cleanQueryParams, extractData } from './httpUtils';

export async function getReservations(filters = {}) {
  const response = await apiClient.get('/reservations', { params: cleanQueryParams(filters) });
  return {
    items: extractData(response, []),
    meta: response.data.meta ?? {},
  };
}

export async function getReservation(id) {
  const response = await apiClient.get(`/reservations/${id}`);
  return extractData(response);
}

export async function createReservation(payload) {
  const response = await apiClient.post('/reservations', payload);
  return extractData(response);
}

export async function updateReservation(id, payload) {
  const response = await apiClient.put(`/reservations/${id}`, payload);
  return extractData(response);
}

export async function deleteReservation(id) {
  await apiClient.delete(`/reservations/${id}`);
}

export async function checkReservationAvailability(params) {
  const response = await apiClient.get('/reservations/availability', { params });
  return extractData(response);
}

export async function performCheckIn(reservationId, payload = {}) {
  const response = await apiClient.post(`/reservations/${reservationId}/check-in`, payload);
  return extractData(response);
}

export async function performCheckOut(reservationId, payload = {}) {
  const response = await apiClient.post(`/reservations/${reservationId}/check-out`, payload);
  return extractData(response);
}
