import api from './axiosInstance';

export const getPhongs = (params) => api.get('/phong', { params });
export const getPhongsTrong = (params) => api.get('/phong/trong', { params });
export const getPhongById = (id) => api.get(`/phong/${id}`);
export const getLichSuGia = (id) => api.get(`/phong/${id}/lich-su-gia`);
export const createPhong = (data) => api.post('/phong', data);
export const updatePhong = (id, data) => api.put(`/phong/${id}`, data);
export const deletePhong = (id) => api.delete(`/phong/${id}`);
