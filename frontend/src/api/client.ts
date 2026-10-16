import axios from 'axios';

const env = (import.meta as any).env;
let rawApiUrl = env?.VITE_API_URL ? String(env.VITE_API_URL).trim() : '';
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://') && !rawApiUrl.startsWith('/')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const apiBase = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

export const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campus_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Only clear session on 401 when token is invalid/expired and NOT on login endpoints.
    if (status === 401) {
      const url = error.config?.url || '';
      const isAuthUrl = url.includes('/auth/login') || url.includes('/auth/platform-login') || url.includes('/auth/set-password');
      if (!isAuthUrl) {
        localStorage.removeItem('campus_jwt_token');
        localStorage.removeItem('campus_user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
