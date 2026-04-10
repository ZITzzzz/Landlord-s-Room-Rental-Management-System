import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/khu.api';

const QUERY_KEY = ['khus'];

export const useKhus = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: api.getKhus });

export const useCreateKhu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createKhu,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      message.success('Thêm khu thành công');
    },
  });
};

export const useUpdateKhu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateKhu(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      message.success('Cập nhật khu thành công');
    },
  });
};

export const useDeleteKhu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteKhu,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      message.success('Xóa khu thành công');
    },
  });
};
