import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('partsphere_delivery_token');
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
      // Clear token on authentication expiry
      localStorage.removeItem('partsphere_delivery_token');
      localStorage.removeItem('partsphere_delivery_user');
      localStorage.removeItem('partsphere_delivery_partner');
    }
    return Promise.reject(error);
  }
);

export default api;
