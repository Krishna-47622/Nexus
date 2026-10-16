import axios from 'axios';

const env = (import.meta as any).env;
const apiBase = env?.VITE_API_URL
  ? `${env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`
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
    // Only clear session on 401 (Unauthorized / expired token).
    // Do NOT clear on 403 — that's a permission issue, not an auth issue.
    if (status === 401) {
      localStorage.removeItem('campus_jwt_token');
      localStorage.removeItem('campus_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
