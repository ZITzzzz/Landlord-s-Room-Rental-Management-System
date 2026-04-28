import api from './axiosInstance';

export const getDatCocs = (params) => api.get('/dat-coc', { params });
export const getDatCocByPhong = (phong_id) => api.get(`/dat-coc/phong/${phong_id}`);
export const createDatCoc = (data) => api.post('/dat-coc', data);
export const huyDatCoc = (id, data) => api.put(`/dat-coc/${id}/huy`, data);
