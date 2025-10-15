import { z } from "zod";

// 🔹 Question Type schema
export const questionTypeSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Question type title is required"),
  created: z.string(),
});


export const addQuestionTypeSchema = z.object({
  title: z
    .string()
    .trim() // 🔹 removes leading/trailing spaces
    .min(1, "Type is required"), // 🔸 after trimming, ensures at least 1 character
});


// 👉 Infer type
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type AddQuestionType = z.infer<typeof addQuestionTypeSchema>;
