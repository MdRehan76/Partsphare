import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
