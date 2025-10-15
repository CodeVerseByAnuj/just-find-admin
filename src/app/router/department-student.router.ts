import { StudentsByDepartmentResponseSchema } from "@/lib/schemas/departmentStudent.schema"; 
import api from "@/lib/axios";
import { handleApiError } from "@/utils/errors/handleApiError";
import { CreateCourseStudentsPayload, CreateCourseStudentsSchema } from "@/lib/schemas/departmentStudent.schema";


// fetches students (not professors) by department id
export const getStudentsByDepartment = async (id: number) => {
  try {
    const response = await api.get(`students/department-wise/${id}`);
    return StudentsByDepartmentResponseSchema.parse(response.data);
  } catch (error) {
    throw handleApiError(error, "Failed to fetch Students");
  }
};


export const addStudentsToCourse = async (payload: CreateCourseStudentsPayload) => {
  try {
    const body = CreateCourseStudentsSchema.parse(payload);
    const response = await api.post("course-students/create-multiple", body);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to add students to course");
  }
};