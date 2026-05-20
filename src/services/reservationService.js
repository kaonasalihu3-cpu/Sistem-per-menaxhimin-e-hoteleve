import apiClient from '../api/client';

export async function getReservations(filters = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const response = await apiClient.get('/reservations', { params: cleaned });
  return {
    items: response.data.data ?? [],
    meta: response.data.meta ?? {},
  };
}

export async function getReservation(id) {
  const response = await apiClient.get(`/reservations/${id}`);
  return response.data.data;
}

export async function createReservation(payload) {
  const response = await apiClient.post('/reservations', payload);
  return response.data.data;
}

export async function updateReservation(id, payload) {
  const response = await apiClient.put(`/reservations/${id}`, payload);
  return response.data.data;
}

export async function deleteReservation(id) {
  await apiClient.delete(`/reservations/${id}`);
}

export async function checkReservationAvailability(params) {
  const response = await apiClient.get('/reservations/availability', { params });
  return response.data.data;
}

export async function performCheckIn(reservationId, payload = {}) {
  const response = await apiClient.post(`/reservations/${reservationId}/check-in`, payload);
  return response.data.data;
}

export async function performCheckOut(reservationId, payload = {}) {
  const response = await apiClient.post(`/reservations/${reservationId}/check-out`, payload);
  return response.data.data;
}