import { useQuery } from '@tanstack/react-query';
import { getCongSuat, getNo, getDoanhThuTheoPhong } from '../api/baoCao.api';

export const useCongSuat = (params) =>
  useQuery({ queryKey: ['baoCaoCongSuat', params], queryFn: () => getCongSuat(params) });

export const useNo = () =>
  useQuery({ queryKey: ['baoCaoNo'], queryFn: getNo });

export const useDoanhThuTheoPhong = (params) =>
  useQuery({
    queryKey: ['baoCaoDoanhThuTheoPhong', params],
    queryFn: () => getDoanhThuTheoPhong(params),
    enabled: !!(params?.tu && params?.den),
  });
