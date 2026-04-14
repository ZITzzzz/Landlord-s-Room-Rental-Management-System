import api from './axiosInstance';

export const getChiPhis = (params) => api.get('/chi-phi', { params });
export const createChiPhi = (data) => api.post('/chi-phi', data);
export const updateChiPhi = (id, data) => api.put(`/chi-phi/${id}`, data);
export const deleteChiPhi = (id) => api.delete(`/chi-phi/${id}`);
