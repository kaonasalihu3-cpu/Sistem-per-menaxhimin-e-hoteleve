import axios from 'axios';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
      return;
    }
    item.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;
    const refreshToken = getRefreshToken();
    const isRefreshCall = String(originalRequest?.url || '').includes('/auth/refresh');

    if (status === 401 && refreshToken && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        const nextAccessToken = refreshResponse?.data?.data?.access_token;
        const nextRefreshToken = refreshResponse?.data?.data?.refresh_token;
        setAuthTokens(nextAccessToken, nextRefreshToken);

        processQueue(null, nextAccessToken);
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const validationErrors = error?.response?.data?.errors;
    let firstValidationMessage = '';
    if (validationErrors && typeof validationErrors === 'object') {
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey && Array.isArray(validationErrors[firstKey])) {
        firstValidationMessage = validationErrors[firstKey][0];
      }
    }

    const isNetworkError = !error?.response && Boolean(error?.request);

    const message =
      error?.response?.data?.message ||
      firstValidationMessage ||
      (isNetworkError ? 'Unable to reach API server. Check backend URL/server status.' : '') ||
      error?.message ||
      'Request failed.';

    const errorObject = new Error(message);
    errorObject.response = error?.response;
    return Promise.reject(errorObject);
  }
);

export default api;
