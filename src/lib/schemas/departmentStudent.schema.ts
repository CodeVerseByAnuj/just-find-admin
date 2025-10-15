import { z } from "zod";

/** Department object nested inside each student */
export const StudentDepartmentSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  code: z.string(),
  type: z.literal("department"), // matches your payload exactly
  deleted: z.boolean(),
  // requires Zod ≥ 3.22 for .datetime(); otherwise use z.string()
  created: z.string().datetime().or(z.string()),
  modified: z.string().datetime().or(z.string()),
});

/** One student row */
export const DepartmentStudentSchema = z.object({
  id: z.number().int().positive(),
  department: StudentDepartmentSchema,
  first_name: z.string(),
  middle_name: z.string(), // can be "" like in your example
  last_name: z.string(),
  email: z.string().email(),
  enrollment_id: z.number().int(),
  roll_number: z.number().nullable(),
});

/** Full API response */
export const StudentsByDepartmentResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DepartmentStudentSchema),
});

export const CreateCourseStudentsSchema = z.object({
  course_id: z
    .number({ required_error: "course_id is required" })
    .int("course_id must be an integer")
    .positive("course_id must be > 0"),

  professor_id: z
    .number({ required_error: "professor_id is required" })
    .int("professor_id must be an integer")
    .positive("professor_id must be > 0"),

  student_ids: z
    .array(
      z.number().int("student_ids must be integers").positive("id must be > 0"),
      { required_error: "student_ids is required" }
    )
    .min(1, "Select at least one student")
    .max(500, "Calm down. Max 500 students at once")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate student IDs are not allowed"
    ),
});

export type CreateCourseStudentsPayload = z.infer<typeof CreateCourseStudentsSchema>;

// Inferred TS types if you actually enjoy type safety
export type Department = z.infer<typeof StudentDepartmentSchema>;
export type Student = z.infer<typeof DepartmentStudentSchema>;
export type StudentsByDepartmentResponse = z.infer<typeof StudentsByDepartmentResponseSchema>;
