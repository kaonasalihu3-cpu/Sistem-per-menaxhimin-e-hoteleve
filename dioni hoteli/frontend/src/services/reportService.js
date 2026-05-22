import api from './api';

function cleanParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
}

export async function getReservationReport(filters = {}) {
  const response = await api.get('/reports/reservations', { params: cleanParams(filters) });
  return response.data.data ?? { items: [], total: 0 };
}

export async function getIncomeSummary(filters = {}) {
  const response = await api.get('/reports/income-summary', { params: cleanParams(filters) });
  return response.data.data;
}

export async function getServiceUsageReport(filters = {}) {
  const response = await api.get('/reports/service-usage', { params: cleanParams(filters) });
  return response.data.data ?? { items: [], total_services: 0 };
}

export async function getOccupancyRateReport(filters = {}) {
  const response = await api.get('/reports/occupancy-rate', { params: cleanParams(filters) });
  return response.data.data;
}
