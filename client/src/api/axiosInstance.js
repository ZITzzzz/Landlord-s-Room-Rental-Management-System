import axios from 'axios';
import { message } from 'antd';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Response interceptor — unwrap envelope and surface errors
axiosInstance.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const msg =
      error.response?.data?.error ||
      error.message ||
      'Có lỗi xảy ra. Vui lòng thử lại.';
    message.error(msg);
    return Promise.reject(new Error(msg));
  }
);

export default axiosInstance;
