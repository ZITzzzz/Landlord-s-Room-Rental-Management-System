import api from './axiosInstance';

export const getKhus = () => api.get('/khu');
export const createKhu = (data) => api.post('/khu', data);
export const updateKhu = (id, data) => api.put(`/khu/${id}`, data);
export const deleteKhu = (id) => api.delete(`/khu/${id}`);
