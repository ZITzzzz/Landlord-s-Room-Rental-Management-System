import api from './axiosInstance';

export const getSuaChuas = (params) => api.get('/sua-chua', { params });
export const createSuaChua = (data) => api.post('/sua-chua', data);
export const updateSuaChua = (id, data) => api.put(`/sua-chua/${id}`, data);
