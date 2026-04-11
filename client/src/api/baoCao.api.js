import axiosInstance from './axiosInstance';

export const getCongSuat = (params) => axiosInstance.get('/bao-cao/cong-suat', { params });
export const getNo = () => axiosInstance.get('/bao-cao/no');
export const getDoanhThuTheoPhong = (params) =>
  axiosInstance.get('/bao-cao/doanh-thu-theo-phong', { params });
