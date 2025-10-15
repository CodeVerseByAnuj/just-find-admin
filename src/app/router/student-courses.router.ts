import api from "@/lib/axios";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";
import { AddStudentCourse, UpdateStudentCourse } from "@/lib/schemas/student-courses.schema";

export const getStudentCourses = async (id: number) => {
  try {
    const response = await api.get(`/course-students/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch student courses");
  }
};


export const getStudentParticularCourse = async (id: number) => {
  try {
    const response = await api.get(`/course-students/particular/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch student courses");
  }
};

export const getProfessorList = async (id : number) => {
  try {
    const response = await api.get(`/course-professor/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch professors");
  }
}

export const createStudentCourse = async (payload: AddStudentCourse) => {
  try {
    const response = await api.post("/course-students", payload);
    // ✅ Show success toast
          handleSuccessMessage(response, "Student Course created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create student course");
  }
};

export const updateStudentCourse = async (payload: UpdateStudentCourse, studentId: number ) => {
  try {
    const response = await api.patch(`/course-students/${studentId}`, payload);
    // ✅ Show success toast
          handleSuccessMessage(response, "Student Course updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update student course");
  }
};

export const deleteStudentCourse = async (id: number) => {
  try {
    const response = await api.delete(`/course-students/${id}`);
    // ✅ Show success toast
    handleSuccessMessage(response, "Student Course deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete student course");
  }
};