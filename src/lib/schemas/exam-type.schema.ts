import { z } from "zod";

// 🔹 Exam Type schema
export const examTypeSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  created: z.string(),
});


export const addExamTypeSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

// 👉 Infer type
export type ExamType = z.infer<typeof examTypeSchema>;
export type AddExamType = z.infer<typeof addExamTypeSchema>;
