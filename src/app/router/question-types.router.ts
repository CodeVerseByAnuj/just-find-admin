// utils/api/auth.ts
import api from "@/lib/axios";
import { z } from "zod";
// import { AddExamType, ExamType, examTypeSchema } from "@/lib/schemas/exam-type.schema";
import { AddQuestionType, questionTypeSchema } from "@/lib/schemas/question-type.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const createQuestionType = async (payload: AddQuestionType) => {
  try {
    const response = await api.post("/questiontype", payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Question type created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to create question type");
  }
};

export const updateQuestionType = async (id: number, payload: AddQuestionType) => {
  try {
    const response = await api.patch(`/questiontype/${id}`, payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Question type updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to update question type");
  }
};

export const deleteQuestionType = async (id: number) => {
  try {
    const response = await api.delete(`/questiontype/${id}`);
    // ✅ Show success toast
    handleSuccessMessage(response, "Question type deleted successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Failed to delete question type");
  }
};

export const getQuestionTypeById = async (id: number) => {
  try {
    const response = await api.get(`/questiontype/${id}`);
    return questionTypeSchema.parse(response.data);

  } catch (error) {
    throw handleApiError(error, "Failed to fetch question type");
  }
};

export const getAllQuestionTypes = async () => {
  try {
    const response = await api.get("/questiontype");

    // 🔍 Check entire response
    console.log("Fetched question types:", response.data); // not interpolated

    const rawQuestionTypes = response.data.data;

    // ✅ Defensive check
    if (!Array.isArray(rawQuestionTypes)) {
      throw new Error("Invalid question type data format: not an array");
    }

    const questionTypes = rawQuestionTypes.map((question: any) =>
      questionTypeSchema.parse(question)
    );

    return { data: questionTypes };
  } catch (error) {
    console.error("Error fetching exam types:", error);
    throw handleApiError(error, "Failed to fetch exam types");
  }
};