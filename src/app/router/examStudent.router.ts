import api from '@/lib/axios';
import { examProfessorSchema, ExamProfessor, ExamResultResponse, examResultResponseSchema } from '@/lib/schemas/examProfessor.schema';
import { handleApiError } from '@/utils/errors/handleApiError';
import { handleSuccessMessage } from '@/utils/success/handleSuccessMessage';
import ExamStudent from '../components/our-pages/exam-student/ExamStudents';
import { examStudentSchema, StudentFlag } from '@/lib/schemas/examStudent.schema';
import { studentExamResponseSchema,StudentExamResponse } from '@/lib/schemas/examStudent.schema';


export const fetchStudentExam = async (): Promise<ExamStudent[]> => {
  try {
    const response = await api.get('/student-exams');
    const filtered = response.data.data.map((item: any) => ({
      exam_id: item.exam_id,
      exam_type: item.exam_type || '',
      exam_date: item.exam_date || '',
      course_name: item.course_name || '',
      course_code: item.course_code || '',
      max_marks: item.max_marks ?? 0,
      marks_obtained: item.marks_obtained,
      status: item.status ?? null,
      published: item.published ?? false,
    }));
    return examStudentSchema.array().parse(filtered);
  } catch (error) {
    handleApiError(error);
    return [];
  }
};


// Student Exam Details by examId
export const fetchStudentExamMarks = async (
  examId: number
): Promise<StudentExamResponse["data"]> => {
  try {
    const response = await api.get(`/student-exams/student-exam-details/${examId}`);
    // Sanitize StudentMarks before parsing
    if (response.data?.data?.StudentMarks) {
      response.data.data.StudentMarks = response.data.data.StudentMarks.map((mark: any) => ({
        ...mark,
        questionId: typeof mark.questionId === 'number' ? mark.questionId : 0, // fallback to 0
        studentFlag: typeof mark.studentFlag === 'boolean' ? mark.studentFlag : false, // fallback to false
      }));
    }
    const parsed = studentExamResponseSchema.parse(response.data);
    return parsed.data;
  } catch (error) {
    console.log(error,"error")
    handleApiError(error);
    throw error;
  }
};


export const raiseExamFlag = async (data: StudentFlag) => {
  try {
    const response = await api.put(`/student-exams/raise-exam-flag`, data);
    handleSuccessMessage("Flag Request Sent Successfully");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

