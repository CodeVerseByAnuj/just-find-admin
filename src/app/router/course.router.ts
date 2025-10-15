import api from "@/lib/axios"
import { courseListResponseSchema, courseResponseSchema, AddCourseFormData, courseListDepartmentResponseSchema } from "@/lib/schemas/course.schema"
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const getCourses = async () => {
    try {
        const response = await api.get("/courses") // Update this URL accordingly
    const parsed = courseListResponseSchema.parse(response.data)
    return parsed.data.courses
    } catch (error) {
        throw handleApiError(error, "Failed to load courses");
    }
}

export const getDepartmentCourses = async ({ id }: { id: number }) => {
  try {
    const response = await api.get(`/courses/department-wise/${id}`);
    const parsed = courseListDepartmentResponseSchema.parse(response.data);
    return parsed.data; // array of DepartmentWiseCourse
  } catch (error) {
    throw handleApiError(error, "Failed to load courses");
  }
};


export const createCourse = async (courseData: AddCourseFormData) => {
    try {
        const response = await api.post("/courses", courseData) // Update this URL accordingly
        handleSuccessMessage("Course created successfully")
        return response.data
    } catch (error) {
        throw handleApiError(error, "Failed to create course");
    }
}


export const getCourseById = async (id: number) => {
    try {
        const response = await api.get(`/courses/${id}`) // Update this URL accordingly
        return response.data
    } catch (error) {
        throw handleApiError(error, "Failed to fetch course by ID");
    }
};

export const updateCourse = async (id: number, data: any) => {
    try {
        const response = await api.patch(`/courses/${id}`, data)
        handleSuccessMessage("Course updated successfully")
        return response.data
    } catch (error) {
        throw handleApiError(error, "Failed to update course");
    }
};
export const deleteCourse = async (id: number) => {
    try {
        const response = await api.delete(`/courses/${id}`)
        handleSuccessMessage("Course deleted successfully")
        return response.data
    } catch (error) {
        throw handleApiError(error, "Failed to delete course");
    }
};

export const getSemesterTypes = async () => {
    try {
        const response = await api.get("/semester")
        return response.data.data
    } catch (error) {
        handleApiError(error, "Failed to fetch semester types");
        return [];
    }
}