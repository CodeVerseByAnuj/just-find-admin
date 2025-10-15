// utils/api/auth.ts
import api from "@/lib/axios";
import { SemesterType, AddSemesterType, semesterTypeSchema } from "@/lib/schemas/semester.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const createSemester = async (payload: AddSemesterType) => {
  try {
    const response = await api.post("/semester", payload);
    handleSuccessMessage(response, "Semester created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create Semester");
  }
};

export const updateSemester = async (id: number, payload: AddSemesterType) => {
  try {
    const response = await api.patch(`/semester/${id}`, payload);
    handleSuccessMessage(response, "Semester updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update Semester");
  }
};

export const deleteSemester = async (id: number) => {
  try {
    const response = await api.delete(`/semester/${id}`);
    handleSuccessMessage(response, "Semester deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete Semester");
  }
};

export const getSemesterById = async (id: number) => {
  try {
    const response = await api.get(`/semester/${id}`);
    return semesterTypeSchema.parse(response.data);
    
  } catch (error) {
    throw handleApiError(error, "Failed to fetch Semester");
  }
};

export const getAllSemesters = async () => {
  try {
    const response = await api.get("/semester");

    console.log("Fetched Semester:", response.data);

    const rawSemester = response.data.data;

    if (!Array.isArray(rawSemester)) {
      throw new Error("Invalid Semester data format: not an array");
    }

    const semesterTypes = rawSemester.map((semester: any) =>
      semesterTypeSchema.parse(semester)
    );

    return { data: semesterTypes };
  } catch (error) {
    console.error("Error fetching Semester:", error);
    throw handleApiError(error, "Failed to fetch Semester");
  }
};

