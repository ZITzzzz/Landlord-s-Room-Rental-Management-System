import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/suaChua.api';

export const useSuaChuas = (filters = {}) =>
  useQuery({
    queryKey: ['suaChuas', filters],
    queryFn: () => api.getSuaChuas(filters),
  });

export const useCreateSuaChua = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSuaChua,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suaChuas'] });
      qc.invalidateQueries({ queryKey: ['phongs'] });
      message.success('Tạo yêu cầu sửa chữa thành công');
    },
  });
};

export const useUpdateSuaChua = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateSuaChua(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suaChuas'] });
      qc.invalidateQueries({ queryKey: ['phongs'] });
      message.success('Cập nhật thành công');
    },
  });
};
