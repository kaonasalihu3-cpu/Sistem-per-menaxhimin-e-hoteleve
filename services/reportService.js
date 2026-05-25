import api from './api';
import { cleanQueryParams, extractData } from './httpUtils';

export async function getReservationReport(filters = {}) {
  const response = await api.get('/reports/reservations', { params: cleanQueryParams(filters) });
  return extractData(response, { items: [], total: 0 });
}

export async function getIncomeSummary(filters = {}) {
  const response = await api.get('/reports/income-summary', { params: cleanQueryParams(filters) });
  return extractData(response);
}

export async function getServiceUsageReport(filters = {}) {
  const response = await api.get('/reports/service-usage', { params: cleanQueryParams(filters) });
  return extractData(response, { items: [], total_services: 0 });
}

export async function getOccupancyRateReport(filters = {}) {
  const response = await api.get('/reports/occupancy-rate', { params: cleanQueryParams(filters) });
  return extractData(response);
}
