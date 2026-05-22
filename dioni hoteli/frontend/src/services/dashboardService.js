import api from './api';

export async function getDashboardSummary() {
  const response = await api.get('/dashboard/summary');
  return response.data.data;
}

export async function getRecentReservations() {
  const response = await api.get('/dashboard/recent-reservations');
  return response.data.data ?? [];
}

export async function getRevenueChart() {
  const response = await api.get('/dashboard/revenue-chart');
  return response.data.data ?? [];
}

export async function getOccupancyChart() {
  const response = await api.get('/dashboard/occupancy-chart');
  return response.data.data ?? [];
}
