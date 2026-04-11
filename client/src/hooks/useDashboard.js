import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKPI, getCanhBao, markSeen } from '../api/dashboard.api';

export const useKPI = () =>
  useQuery({ queryKey: ['dashboardKPI'], queryFn: getKPI, staleTime: 60_000 });

export const useCanhBao = () =>
  useQuery({ queryKey: ['canhBao'], queryFn: getCanhBao, staleTime: 30_000 });

export const useMarkSeen = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ loai, id }) => markSeen(loai, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['canhBao'] }),
  });
};
