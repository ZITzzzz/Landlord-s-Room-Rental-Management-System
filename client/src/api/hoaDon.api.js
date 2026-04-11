import api from './axiosInstance';

export const getHoaDons = (params) => api.get('/hoa-don', { params });
export const getChoLap = (params) => api.get('/hoa-don/cho-lap', { params });
export const tinhTruoc = (params) => api.get('/hoa-don/tinh-truoc', { params });
export const createHoaDon = (data) => api.post('/hoa-don', data);
export const thanhToanHoaDon = (id, data) => api.put(`/hoa-don/${id}/thanh-toan`, data);
