import axiosInstance from './axiosInstance';

export const getKPI = () => axiosInstance.get('/dashboard/kpi');
export const getCanhBao = () => axiosInstance.get('/dashboard/canh-bao');
export const markSeen = (loai, id) =>
  axiosInstance.put(`/dashboard/canh-bao/${loai}/${id}/da-xem`);
