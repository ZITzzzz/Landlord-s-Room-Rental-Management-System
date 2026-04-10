import api from './axiosInstance';

export const getLoaiPhongs = () => api.get('/loai-phong');
export const createLoaiPhong = (data) => api.post('/loai-phong', data);
export const updateLoaiPhong = (id, data) => api.put(`/loai-phong/${id}`, data);
export const deleteLoaiPhong = (id) => api.delete(`/loai-phong/${id}`);
