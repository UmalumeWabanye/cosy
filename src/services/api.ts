import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    return isLocalHost ? 'http://localhost:5000/api' : 'https://cosy-backend.onrender.com/api';
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://cosy-backend.onrender.com/api'
    : 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const makeCorrelationId = () => {
  const rand = Math.random().toString(36).slice(2, 10);
  return `web-${Date.now()}-${rand}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-correlation-id'] = makeCorrelationId();
  return config;
});

export default api;
