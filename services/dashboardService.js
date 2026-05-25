import api from './api';
import { extractData } from './httpUtils';

export async function getDashboardSummary() {
  const response = await api.get('/dashboard/summary');
  return extractData(response);
}

export async function getRecentReservations() {
  const response = await api.get('/dashboard/recent-reservations');
  return extractData(response, []);
}

export async function getRecentPayments() {
  const response = await api.get('/dashboard/recent-payments');
  return extractData(response, []);
}

export async function getRevenueChart() {
  const response = await api.get('/dashboard/revenue-chart');
  return extractData(response, []);
}

export async function getOccupancyChart() {
  const response = await api.get('/dashboard/occupancy-chart');
  return extractData(response, []);
}
