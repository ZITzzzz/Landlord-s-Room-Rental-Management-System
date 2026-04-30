import axios from 'axios';
import { message } from 'antd';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor — attach JWT token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — unwrap envelope and surface errors
axiosInstance.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Chưa đăng nhập'));
    }
    const msg =
      error.response?.data?.error ||
      error.message ||
      'Có lỗi xảy ra. Vui lòng thử lại.';
    message.error(msg);
    return Promise.reject(new Error(msg));
  }
);

export default axiosInstance;
