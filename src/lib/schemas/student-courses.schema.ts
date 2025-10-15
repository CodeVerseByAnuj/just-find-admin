import { z } from "zod";

// 🔹 Course schema
const courseSchema = z.object({
  id: z.number(),
  title: z.string(),
  code: z.string(),
  credits: z.number(),
});

// 🔹 Professor schema
const professorSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  middle_name: z.string().nullable().optional(),
  last_name: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

// 🔹 Student Course schema
export const studentCourseSchema = z.object({
  id: z.number(),
  course: courseSchema,
  professor: professorSchema,
  created: z.string(), // ISO date string
  modified: z.string(), // ISO date string
});

// 🔹 Add student course schema
export const addStudentCourseSchema = z.object({
  course_id: z.coerce.number().positive("Course ID must be a positive number"),
  // professor_id: z.coerce.number().positive("Professor ID must be a positive number"),
professor_id: z.coerce.number().min(1, { message: 'Professor is required.' }).optional(),
});

// 🔹 Update student course schema
export const updateStudentCourseSchema = addStudentCourseSchema.partial();

// 👉 Infer types
export type Course = z.infer<typeof courseSchema>;
export type Professor = z.infer<typeof professorSchema>;
export type StudentCourse = z.infer<typeof studentCourseSchema>;
export type AddStudentCourse = z.infer<typeof addStudentCourseSchema>;
export type UpdateStudentCourse = z.infer<typeof updateStudentCourseSchema>;
