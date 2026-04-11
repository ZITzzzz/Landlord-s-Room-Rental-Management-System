import { useQuery } from '@tanstack/react-query';
import { getThongKe, getHoaDonKy } from '../api/thongKe.api';

export const useThongKe = (params) =>
  useQuery({
    queryKey: ['thongKe', params],
    queryFn: () => getThongKe(params),
    enabled: !!(params?.tu && params?.den),
  });

export const useHoaDonKy = (ky) =>
  useQuery({
    queryKey: ['hoaDonKy', ky],
    queryFn: () => getHoaDonKy(ky),
    enabled: !!ky,
  });
