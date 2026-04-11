import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/phong.api';

export const usePhongs = (filters) =>
  useQuery({ queryKey: ['phongs', filters], queryFn: () => api.getPhongs(filters) });

export const usePhongsTrong = (filters) =>
  useQuery({
    queryKey: ['phongsTrong', filters],
    queryFn: () => api.getPhongsTrong(filters),
  });

export const usePhongById = (id) =>
  useQuery({
    queryKey: ['phong', id],
    queryFn: () => api.getPhongById(id),
    enabled: !!id,
  });

export const useLichSuGia = (id) =>
  useQuery({
    queryKey: ['lichSuGia', id],
    queryFn: () => api.getLichSuGia(id),
    enabled: !!id,
  });

export const useCreatePhong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPhong,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['phongs'] });
      qc.invalidateQueries({ queryKey: ['khus'] });
      message.success('Thêm phòng thành công');
    },
  });
};

export const useUpdatePhong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updatePhong(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['phongs'] });
      qc.invalidateQueries({ queryKey: ['phong', id] });
      qc.invalidateQueries({ queryKey: ['lichSuGia', id] });
      message.success('Cập nhật phòng thành công');
    },
  });
};

export const useDeletePhong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deletePhong,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['phongs'] });
      qc.invalidateQueries({ queryKey: ['khus'] });
      message.success('Xóa phòng thành công');
    },
  });
};
