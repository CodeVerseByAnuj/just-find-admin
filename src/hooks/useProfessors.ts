import { useQuery } from '@tanstack/react-query';
import { getProfessors } from '@/app/router/professor.router';

export const useProfessors = () => {
  return useQuery({
    queryKey: ['all-professors'],
    queryFn: async () => {
      const res = await getProfessors();
      return res || { data: [] };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
