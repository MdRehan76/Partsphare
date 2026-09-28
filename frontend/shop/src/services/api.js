import axios from 'axios';

const getBaseURL = () => {
  // In production (not localhost), always point to the deployed backend
  if (typeof window !== 'undefined' && window.location.hostname && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'https://partnexa-api.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on portal route, redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('shop_token');
        localStorage.removeItem('shop_user');
        localStorage.removeItem('shop_data');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
