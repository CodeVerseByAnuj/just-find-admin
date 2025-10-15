import { z } from "zod";

/**
 * Single professor object
 */
export const ProfessorSchema = z.object({
  id: z.number(),
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  designation: z.string().min(1),
});

/**
 * Item tying a professor to a department listing entry
 * (Your payload doesn’t include department fields; assuming this
 * is already “scoped by department” at the endpoint.)
 */
export const DepartmentProfessorItemSchema = z.object({
  id: z.number(),
  professor: ProfessorSchema,
  created: z.string().datetime({ offset: true }),
  modified: z.string().datetime({ offset: true }),
});

/**
 * Top-level API response
 */
export const DepartmentProfessorsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(DepartmentProfessorItemSchema),
});

export const CreateCourseProfessorsSchema = z.object({
  course_id: z
    .number({ required_error: "course_id is required" })
    .int("course_id must be an integer")
    .positive("course_id must be > 0"),

  professor_ids: z
    .array(
      z.number().int("professor_ids must be integers").positive("id must be > 0")
    , { required_error: "professor_ids is required" })
    .min(1, "Select at least one professor")
    .max(100, "Calm down. Max 100 professors at once")
    .refine(
      ids => new Set(ids).size === ids.length,
      "Duplicate professor IDs are not allowed"
    ),
});


// ---------- Types ----------
export type Professor = z.infer<typeof ProfessorSchema>;
export type DepartmentProfessorItem = z.infer<typeof DepartmentProfessorItemSchema>;
export type DepartmentProfessorsResponse = z.infer<typeof DepartmentProfessorsResponseSchema>;
export type CreateCourseProfessorsPayload = z.infer<typeof CreateCourseProfessorsSchema>;

