import { useQuery } from '@tanstack/react-query';
import { getParticularExam } from '@/app/router/exam.router';
import { ExamDetailResponse } from '@/lib/schemas/exam.schema';

export const useParticularExam = (examId: number | null) => {
  return useQuery<ExamDetailResponse['data'] | null>({
    queryKey: ['particular-exam', examId],
    queryFn: async () => {
      if (!examId) return null;
      return await getParticularExam(examId);
    },
    enabled: !!examId, // Only run query if examId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};