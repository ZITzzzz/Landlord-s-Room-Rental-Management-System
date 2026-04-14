import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/chiPhi.api';

export const useChiPhis = (filters = {}) =>
  useQuery({
    queryKey: ['chiPhis', filters],
    queryFn: () => api.getChiPhis(filters),
  });

export const useCreateChiPhi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createChiPhi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chiPhis'] });
      message.success('Thêm chi phí thành công');
    },
  });
};

export const useUpdateChiPhi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateChiPhi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chiPhis'] });
      message.success('Cập nhật chi phí thành công');
    },
  });
};

export const useDeleteChiPhi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteChiPhi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chiPhis'] });
      message.success('Xóa chi phí thành công');
    },
  });
};
