// utils/api/student.ts
import api from "@/lib/axios";
import { AddStudent, UpdateStudent } from "@/lib/schemas/student.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

// 🔹 Get all students
export const getStudents = async () => {
  try {
    const response = await api.get("/students");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch students");
  }
};

// 🔹 Get student by ID
export const getStudentById = async (id: number) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch student");
  }
};

// 🔹 Create new student
export const createStudent = async (payload: AddStudent) => {
  try {
    const response = await api.post("/students", payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Student created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create student");
  }
};

// 🔹 Update student
export const updateStudent = async (id: number, payload: UpdateStudent) => {
  try {
    const response = await api.patch(`/students/${id}`, payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Student updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update student");
  }
};

// 🔹 Delete student (soft delete)
export const deleteStudent = async (id: number) => {
  try {
    const response = await api.delete(`/students/${id}`);
    handleSuccessMessage(response, "Student deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete student");
  }
};


// cleanest: no try/catch here; let the component own the UX
export const importStudents = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("students/import-students", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    skipErrorToast: true,
  });

  return data;
};
