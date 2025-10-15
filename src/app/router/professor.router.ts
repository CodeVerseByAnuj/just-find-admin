// utils/api/professor.ts
import api from "@/lib/axios";
import { AddProfessor, UpdateProfessor } from "@/lib/schemas/professor.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

// 🔹 Get all professors
export const getProfessors = async () => {
  try {
    const response = await api.get("/professors");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch professors");
  }
};

// 🔹 Get professor by ID
export const getProfessorById = async (id: number) => {
  try {
    const response = await api.get(`/professors/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to fetch professor");
  }
};

// 🔹 Create new professor
export const createProfessor = async (payload: AddProfessor) => {
  try {
    const response = await api.post("/professors", payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Professor created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create professor");
  }
};

// 🔹 Update professor
export const updateProfessor = async (id: number, payload: UpdateProfessor) => {
  try {
    const response = await api.patch(`/professors/${id}`, payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Professor updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update professor");
  }
};

// 🔹 Delete professor (soft delete)
export const deleteProfessor = async (id: number) => {
  try {
    const response = await api.delete(`/professors/${id}`);
    // ✅ Show success toast
    handleSuccessMessage(response, "Professor deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete professor");
  }
};

export const importProfessors = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/professors/import-professors", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    skipErrorToast: true, // <-- not in headers
  });

  return data;
};
