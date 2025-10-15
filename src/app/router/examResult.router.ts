import api from '@/lib/axios';
import { ExamResultSchema } from '@/lib/schemas/examResult.schema';
import { handleApiError } from '@/utils/errors/handleApiError';
import { handleSuccessMessage } from '@/utils/success/handleSuccessMessage';
// Static mock data for local preview / testing
import mockExamResult from './mockExamResult.json'


export const getAllExamResults = async (id: number) => {
    try {
    // Use static mock data instead of API response for preview/testing.
    // Keep API call commented for easy revert.
    // const response = await api.get(`/professor-exams/exam-student-grid-view/${id}`);
    const parsed = ExamResultSchema.parse(mockExamResult as any);
    return parsed.data;
    } catch (error) {
        console.log(error,"Error")
        handleApiError(error, 'Failed to fetch exam results');
        return {
            data: [],
        };
    }
};
