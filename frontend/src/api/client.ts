import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
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
    if (status === 401 || status === 403) {
      // If token is invalid or expired, clear local storage and prompt re-login
      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('campus_jwt_token');
        localStorage.removeItem('campus_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
