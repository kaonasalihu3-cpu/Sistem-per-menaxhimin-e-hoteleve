import api from './api';
import { extractData } from './httpUtils';
import { clearAuthTokens, getRefreshToken, setAuthTokens } from './tokenStorage';

export async function register(payload) {
  const response = await api.post('/auth/register', payload);
  return extractData(response);
}

export async function login(payload) {
  const response = await api.post('/auth/login', payload);
  const data = extractData(response);
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
  return extractData(response);
}

export async function revokeRefreshToken(refreshToken) {
  await api.post('/auth/revoke-refresh-token', {
    refresh_token: refreshToken,
  });
}
