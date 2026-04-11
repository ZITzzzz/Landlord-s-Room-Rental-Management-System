import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/donGia.api';

export const useDonGiaCurrent = (loai_phong_id) =>
  useQuery({
    queryKey: ['donGia', loai_phong_id],
    queryFn: () => api.getDonGiaCurrent({ loai_phong_id }),
    enabled: !!loai_phong_id,
  });

export const useDonGiaLichSu = (params) =>
  useQuery({
    queryKey: ['donGiaLichSu', params],
    queryFn: () => api.getDonGiaLichSu(params),
  });

export const useCreateDonGia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDonGia,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['donGia', variables.loai_phong_id] });
      qc.invalidateQueries({ queryKey: ['donGiaLichSu'] });
      message.success('Cập nhật đơn giá thành công');
    },
  });
};
