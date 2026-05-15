import api from './api';
import { clearAuthTokens, getRefreshToken, setAuthTokens } from './tokenStorage';

export async function register(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data.data;
}

export async function login(payload) {
  const response = await api.post('/auth/login', payload);
  const data = response.data.data;
  setAuthTokens(data.access_token, data.refresh_token);
  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    await api.post('/auth/logout', {
      refresh_token: refreshToken,
    });
  } finally {
    clearAuthTokens();
  }
}

export async function getMyProfile() {
  const response = await api.get('/auth/me');
  return response.data.data;
}

export async function revokeRefreshToken(refreshToken) {
  await api.post('/auth/revoke-refresh-token', {
    refresh_token: refreshToken,
  });
}

