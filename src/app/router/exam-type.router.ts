// utils/api/auth.ts
import api from "@/lib/axios";
import { z } from "zod";
import { AddExamType, ExamType, examTypeSchema } from "@/lib/schemas/exam-type.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const createExamType = async (payload: AddExamType) => {
  try {
    const response = await api.post("/exams-type", payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Exam type created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create exam type");
  }
};

export const updateExamType = async (id: number, payload: AddExamType) => {
  try {
    const response = await api.patch(`/exams-type/${id}`, payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Exam type updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update exam type");
  }
};

export const deleteExamType = async (id: number) => {
  try {
    const response = await api.delete(`/exams-type/${id}`);
    // ✅ Show success toast
    handleSuccessMessage(response, "Exam type deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete exam type");
  }
};

export const getExamTypeById = async (id: number) => {
  try {
    const response = await api.get(`/exams-type/${id}`);
    return examTypeSchema.parse(response.data);
    
  } catch (error) {
    throw handleApiError(error, "Failed to fetch exam type");
  }
};

export const getAllExamTypes = async () => {
  try {
    const response = await api.get("/exams-type");

    // 🔍 Check entire response
    console.log("Fetched exam types:", response.data); // not interpolated

    const rawExamTypes = response.data.data;

    // ✅ Defensive check
    if (!Array.isArray(rawExamTypes)) {
      throw new Error("Invalid exam type data format: not an array");
    }

    const examTypes = rawExamTypes.map((exam: any) =>
      examTypeSchema.parse(exam)
    );

    return { data: examTypes };
  } catch (error) {
    console.error("Error fetching exam types:", error);
    throw handleApiError(error, "Failed to fetch exam types");
  }
};

