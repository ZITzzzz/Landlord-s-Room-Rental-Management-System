import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/hoaDon.api';

export const useHoaDons = (filters) =>
  useQuery({ queryKey: ['hoaDons', filters], queryFn: () => api.getHoaDons(filters) });

export const useChoLap = (params) =>
  useQuery({
    queryKey: ['hoaDonChoLap', params],
    queryFn: () => api.getChoLap(params),
    enabled: !!(params?.thang && params?.nam),
  });

export const useTinhTruoc = (params) =>
  useQuery({
    queryKey: ['tinhTruoc', params],
    queryFn: () => api.tinhTruoc(params),
    enabled: !!(params?.hop_dong_id && params?.thang && params?.nam),
  });

export const useCreateHoaDon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createHoaDon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hoaDons'] });
      qc.invalidateQueries({ queryKey: ['hoaDonChoLap'] });
      qc.invalidateQueries({ queryKey: ['hopDong'] });
      message.success('Lập hóa đơn thành công');
    },
  });
};

export const useThanhToan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.thanhToanHoaDon(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hoaDons'] });
      qc.invalidateQueries({ queryKey: ['hopDong'] });
      message.success('Thanh toán thành công');
    },
  });
};
