import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/khachHang.api';

export const useKhachHangs = (q) =>
  useQuery({
    queryKey: ['khachHangs', q],
    queryFn: () => api.getKhachHangs({ q }),
    staleTime: 10_000,
  });

// Alias for wizard contexts — same hook, descriptive name
export const useKhachHangSearch = useKhachHangs;

export const useKhachHangById = (id) =>
  useQuery({
    queryKey: ['khachHang', id],
    queryFn: () => api.getKhachHangById(id),
    enabled: !!id,
  });

export const useCreateKhachHang = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createKhachHang,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['khachHangs'] });
      message.success('Thêm khách hàng thành công');
    },
  });
};

export const useUpdateKhachHang = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateKhachHang(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['khachHangs'] });
      qc.invalidateQueries({ queryKey: ['khachHang', id] });
      message.success('Cập nhật thông tin thành công');
    },
  });
};
