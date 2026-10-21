import axios from 'axios';

const env = (import.meta as any).env;
let rawApiUrl = String(env?.VITE_API_URL || env?.VITE_API_BASE_URL || '').trim();

// If in browser and no explicit URL is provided
if (!rawApiUrl && typeof window !== 'undefined') {
  if (window.location.hostname.includes('onrender.com')) {
    rawApiUrl = 'https://nexus-backend-p63s.onrender.com';
  } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    rawApiUrl = 'http://localhost:8080';
  }
}

// If Render blueprint passed internal service name like "nexus-backend-p63s" (no dot, no protocol, no slash)
if (
  rawApiUrl &&
  !rawApiUrl.includes('.') &&
  !rawApiUrl.startsWith('/') &&
  !rawApiUrl.startsWith('localhost') &&
  !rawApiUrl.startsWith('http://') &&
  !rawApiUrl.startsWith('https://')
) {
  rawApiUrl = `${rawApiUrl}.onrender.com`;
}

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
