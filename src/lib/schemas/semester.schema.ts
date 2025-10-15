import { z } from "zod";

// 🔹 Exam Type schema
export const semesterTypeSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  created: z.string(),
});


export const addsemesterTypeSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

// 👉 Infer type
export type SemesterType = z.infer<typeof semesterTypeSchema>;
export type AddSemesterType = z.infer<typeof addsemesterTypeSchema>;
