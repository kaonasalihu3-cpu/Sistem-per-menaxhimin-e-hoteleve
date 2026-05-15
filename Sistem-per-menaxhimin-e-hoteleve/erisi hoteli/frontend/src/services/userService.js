import api from './api';

export async function getUsers() {
  const response = await api.get('/users');
  return response.data.data ?? [];
}

export async function getUser(id) {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
}

export async function createUser(payload) {
  const response = await api.post('/users', payload);
  return response.data.data;
}

export async function updateUser(id, payload) {
  const response = await api.put(`/users/${id}`, payload);
  return response.data.data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}

export async function activateUser(id) {
  const response = await api.patch(`/users/${id}/activate`);
  return response.data.data;
}

export async function deactivateUser(id) {
  const response = await api.patch(`/users/${id}/deactivate`);
  return response.data.data;
}

export async function getUserRoles(userId) {
  const response = await api.get(`/users/${userId}/roles`);
  return response.data.data ?? [];
}

export async function assignRole(userId, roleId) {
  const response = await api.post(`/users/${userId}/roles`, { role_id: roleId });
  return response.data.data ?? [];
}

export async function removeRole(userId, roleId) {
  const response = await api.delete(`/users/${userId}/roles/${roleId}`);
  return response.data.data ?? [];
}

