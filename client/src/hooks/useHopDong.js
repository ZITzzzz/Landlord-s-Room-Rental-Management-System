import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/hopDong.api';

export const useHopDongs = (filters) =>
  useQuery({ queryKey: ['hopDongs', filters], queryFn: () => api.getHopDongs(filters) });

export const useHopDongById = (id) =>
  useQuery({ queryKey: ['hopDong', id], queryFn: () => api.getHopDongById(id), enabled: !!id });

export const useCreateHopDong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createHopDong,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hopDongs'] });
      qc.invalidateQueries({ queryKey: ['phongs'] });
      qc.invalidateQueries({ queryKey: ['phongsTrong'] });
      message.success('Tạo hợp đồng thành công');
    },
  });
};

export const useGiaHanHopDong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.giaHanHopDong(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['hopDong', id] });
      message.success('Gia hạn thành công');
    },
  });
};

export const useAddNguoiO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hop_dong_id, data }) => api.addNguoiO(hop_dong_id, data),
    onSuccess: (_, { hop_dong_id }) => {
      qc.invalidateQueries({ queryKey: ['hopDong', hop_dong_id] });
      message.success('Thêm người ở thành công');
    },
  });
};

export const useUpdateNguoiO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, hop_dong_id }) => api.updateNguoiO(id, data),
    onSuccess: (_, { hop_dong_id }) => {
      qc.invalidateQueries({ queryKey: ['hopDong', hop_dong_id] });
      message.success('Cập nhật người ở thành công');
    },
  });
};

export const useDeleteNguoiO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.deleteNguoiO(id),
    onSuccess: (_, { hop_dong_id }) => {
      qc.invalidateQueries({ queryKey: ['hopDong', hop_dong_id] });
      message.success('Xóa người ở thành công');
    },
  });
};

export const useThanhLy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.thanhLyHopDong(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['hopDongs'] });
      qc.invalidateQueries({ queryKey: ['hopDong', id] });
      qc.invalidateQueries({ queryKey: ['phongs'] });
      message.success('Thanh lý hợp đồng thành công');
    },
  });
};

export const useHuyHopDong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.huyHopDong(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['hopDongs'] });
      qc.invalidateQueries({ queryKey: ['hopDong', id] });
      qc.invalidateQueries({ queryKey: ['phongs'] });
      message.success('Hủy hợp đồng thành công');
    },
  });
};
