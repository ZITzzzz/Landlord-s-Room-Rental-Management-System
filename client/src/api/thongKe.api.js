import axiosInstance from './axiosInstance';

export const getThongKe = (params) => axiosInstance.get('/thong-ke', { params });
export const getHoaDonKy = (ky) => axiosInstance.get(`/thong-ke/${ky}/hoa-don`);
