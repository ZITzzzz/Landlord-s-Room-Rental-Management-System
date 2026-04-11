import api from './axiosInstance';

export const getKhachHangs = (params) => api.get('/khach-hang', { params });
export const getKhachHangById = (id) => api.get(`/khach-hang/${id}`);
export const createKhachHang = (data) => api.post('/khach-hang', data);
export const updateKhachHang = (id, data) => api.put(`/khach-hang/${id}`, data);
