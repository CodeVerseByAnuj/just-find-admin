import api from '@/lib/axios';
import { examProfessorSchema, ExamProfessor, ExamResultResponse, examResultResponseSchema,ProfessorFlag,UpdatePartialMarks } from '@/lib/schemas/examProfessor.schema';
import { handleApiError } from '@/utils/errors/handleApiError';
import { handleSuccessMessage } from '@/utils/success/handleSuccessMessage';

/**
 * Fetch all professors for exams.
 * @returns {Promise<ExamProfessor[]>}
 */

export const fetchExamProfessors = async (): Promise<ExamProfessor[]> => {
  try {
    const response = await api.get('/professor-exams');
    // Only keep id, course.title, and exam_type.title
    const filtered = response.data.data.map((item: any) => ({
      id: item.id,
      title: item.course?.title || '',
      code: item.course?.code || '',
      exam_date: item.exam_date,
      exam_type: { title: item.exam_type?.title || '' },
      max_marks: item.max_marks,
      published: item.published,
    }));
    return examProfessorSchema.array().parse(filtered);
  } catch (error) {
    handleApiError(error);
    return [];
  }
};


/**
 * Fetch student list for a professor exam by id.
 * @param {number} id - The exam professor id
 * @returns {ExamResultResponse} - The student list response
 */


export const fetchProfessorExamStudentList = async (id: number): Promise<ExamResultResponse | null> => {
  try {
    const response = await api.get(`/professor-exams/student-list/${id}`);
    console.log(response.data.data, 'response data from exam students');
    return examResultResponseSchema.parse(response.data.data);
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Fetch marks for a student in a specific professor exam.
 * @param {number} examId - The exam professor id
 * @param {number} studentId - The student id
 * @returns {Promise<any>} - The marks data for the student
 */
export const fetchStudentExamMarks = async (examId: number, studentId: number): Promise<any> => {
  try {
    const response = await api.get(`/professor-exams/student-exam-marks/${examId}/student/${studentId}`);
    console.log(response.data.data, 'response data from student exam marks');
    return response.data.data;
  } catch (error) {
    console.log(error , 'error in fetchStudentExamMarks');
    handleApiError(error);
    return null;
  }
};


export const raiseExamFlag = async (data: ProfessorFlag) => {
  console.log("🚀 raiseExamFlag called with data:", data);
  try {
    console.log("📡 Making API call to /professor-exams/reevaluate-student-exam");
    const response = await api.put(`/professor-exams/reevaluate-student-exam`, data);
    console.log("✅ API response:", response.data);
    handleSuccessMessage("Flag Request Sent Successfully");
    return response.data;
  } catch (error) {
    console.error("❌ API call failed:", error);
    handleApiError(error);
  }
};


export const partialMarks = async (data: UpdatePartialMarks) => {
  try {
    const response = await api.put(`/professor-exams/update-partial-json`, data);
    handleSuccessMessage("Partial Marks Updated Successfully");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};