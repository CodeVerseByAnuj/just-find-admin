// exam.router.ts

import api from '@/lib/axios';
import { examsResponseSchema, examDetailResponseSchema } from '@/lib/schemas/exam.schema';
import { handleApiError } from '@/utils/errors/handleApiError';
import { handleSuccessMessage } from '@/utils/success/handleSuccessMessage';

type GetAllExamsParams = {
  page: number;
  limit: number;
  search?: string;
};

/**
 * Fetch all exams with pagination and optional search query.
 * @param {GetAllExamsParams} params - Pagination and search options
 * @returns {Promise<{ data: any[]; totalCount: number }>}
 */
export const getAllExams = async ({ page, limit, search }: GetAllExamsParams) => {
  try {
    const response = await api.get('/exams', {
      params: { page, limit, search },
    });

    const parsed = examsResponseSchema.parse(response.data);

    return {
      data: parsed.data.examsList,
    };
  } catch (error) {
    console.log(error, 'errro')
    handleApiError(error, 'Failed to fetch exams');

    return {
      data: [],
      totalCount: 0,
    };
  }
};

export const getQuestionTypes = async () => {
  try {
    const response = await api.get('/questiontype');
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch question types');
    return [];
  }
};

export const getExamTypes = async () => {
  try {
    const response = await api.get('/exams-type');
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch exam types');
    return [];
  }
};

export const createExam = async (examData: any) => {
  try {
    const response = await api.post('/exams', examData);
    handleSuccessMessage('Exam created successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to create exam');
    return null;
  }
}

export const getParticularExam = async (examId: number) => {
  try {
    const response = await api.get(`/exams/${examId}`);
    const parsed = examDetailResponseSchema.parse(response.data);
    return parsed.data;
  } catch (error) {
    console.log(error, 'error fetching exam details');
    handleApiError(error, 'Failed to fetch exam details');
    return null;
  }
}

export const updateExam = async (examId: number, examData: any) => {
  try {
    const response = await api.patch(`/exams/${examId}`, examData);
    handleSuccessMessage('Exam updated successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to update exam');
    return null;
  }
}

export const deleteExam = async (id: number) => {
  try {
    const response = await api.delete(`/exams/${id}`);
    // ✅ Show success toast
    handleSuccessMessage(response, "Exam deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete exam");
  }
};

export const uploadExamFile = async (id: number, file: File, onProgress?: (progress: number) => void) => {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  try {
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("examId", id.toString());
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("fileName", file.name);

      await api.post(`/exams/upload-zip-exam/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
    }
    
    handleSuccessMessage("Exam file uploaded successfully");
    return true;
  } catch (error) {
    handleApiError(error, "Failed to upload exam file");
    return null;
  }
}

export const publishedExams = (id: number) => {
  try {
    const response = api.put(`/professor-exams/publish-exam/${id}`);
    handleSuccessMessage('Exam Published successfully');
    return response;
  } catch (error) {
    handleApiError(error, 'Failed to upload exam file');
    return null;
  }
}