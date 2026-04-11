import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/datCoc.api';

export const useCreateDatCoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDatCoc,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['phongs'] });
      qc.invalidateQueries({ queryKey: ['phongsTrong'] });
      qc.invalidateQueries({ queryKey: ['khachHang', variables.khach_hang_id] });
      message.success('Đặt cọc thành công');
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
      message.success('Hủy đặt cọc thành công');
    },
  });
};
