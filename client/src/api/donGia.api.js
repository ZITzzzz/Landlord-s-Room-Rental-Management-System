import api from './axiosInstance';

export const getDonGiaCurrent = (params) => api.get('/don-gia', { params });
export const getDonGiaLichSu = (params) => api.get('/don-gia/lich-su', { params });
export const createDonGia = (data) => api.post('/don-gia', data);
