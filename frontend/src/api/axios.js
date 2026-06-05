import axios from 'axios';

const BACKEND_URL = (typeof __BACKEND_URL__ !== 'undefined' && __BACKEND_URL__) 
  ? __BACKEND_URL__ 
  : (import.meta.env.VITE_API_URL || 'https://sharehub-c57o.onrender.com');

const API = axios.create({
  baseURL: `${BACKEND_URL}/api/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outgoing Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Incoming Response Interceptor (Handles Auto JWT Token Renewal)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const response = await axios.post(`${BACKEND_URL}/api/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
