import api from './axiosInstance';

export const getHopDongs = (params) => api.get('/hop-dong', { params });
export const getHopDongById = (id) => api.get(`/hop-dong/${id}`);
export const createHopDong = (data) => api.post('/hop-dong', data);
export const giaHanHopDong = (id, data) => api.put(`/hop-dong/${id}/gia-han`, data);
export const getLichSuGiaHan = (id) => api.get(`/hop-dong/${id}/lich-su-gia-han`);
export const getNguoiO = (id) => api.get(`/hop-dong/${id}/nguoi-o`);
export const addNguoiO = (id, data) => api.post(`/hop-dong/${id}/nguoi-o`, data);
export const updateNguoiO = (id, data) => api.put(`/nguoi-o/${id}`, data);
export const deleteNguoiO = (id) => api.delete(`/nguoi-o/${id}`);
export const thanhLyHopDong = (id, data) => api.post(`/hop-dong/${id}/thanh-ly`, data);
export const huyHopDong = (id, data) => api.post(`/hop-dong/${id}/huy`, data);
