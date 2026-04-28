import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/datCoc.api';

export const useDatCocs = (params) =>
  useQuery({
    queryKey: ['datCocs', params],
    queryFn: () => api.getDatCocs(params),
  });

export const useDatCocByPhong = (phong_id) =>
  useQuery({
    queryKey: ['datCoc', 'phong', phong_id],
    queryFn: () => api.getDatCocByPhong(phong_id),
    enabled: !!phong_id,
    retry: false,
  });

export const useCreateDatCoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDatCoc,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['phongs'] });
      qc.invalidateQueries({ queryKey: ['phongsTrong'] });
      qc.invalidateQueries({ queryKey: ['khachHang', variables.khach_hang_id] });
      qc.invalidateQueries({ queryKey: ['datCocs'] });
    },
  });
};

export const useHuyDatCoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.huyDatCoc(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['phongs'] });
      qc.invalidateQueries({ queryKey: ['phongsTrong'] });
      qc.invalidateQueries({ queryKey: ['khachHangs'] });
      qc.invalidateQueries({ queryKey: ['datCocs'] });
      message.success('Hủy đặt cọc thành công');
    },
  });
};
