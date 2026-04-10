import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as api from '../api/loaiPhong.api';

const QUERY_KEY = ['loaiPhongs'];

export const useLoaiPhongs = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: api.getLoaiPhongs });

export const useCreateLoaiPhong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createLoaiPhong,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      message.success('Thêm loại phòng thành công');
    },
  });
};

export const useUpdateLoaiPhong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateLoaiPhong(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      message.success('Cập nhật loại phòng thành công');
    },
  });
};

export const useDeleteLoaiPhong = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteLoaiPhong,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      message.success('Xóa loại phòng thành công');
    },
  });
};
