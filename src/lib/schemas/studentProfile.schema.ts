import { z } from "zod";

export const DepartmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  deleted: z.boolean(),
  created: z.string(), // ISO date string
  modified: z.string(), // ISO date string
});

export const StudentProfileSchema = z.object({
  id: z.number(),
  department: DepartmentSchema,
  first_name: z.string(),
  middle_name: z.string().optional(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  enrollment_id: z.number(),
  roll_number: z.number().nullable(),
  dob: z.string(), // ISO date string
  entry_year: z.number(),
  gender: z.string(),
  profile_photo: z.string().nullable(),
});

export const updateStudentProfileSchema = z.object({
  first_name: z.string().min(2).max(50),
  middle_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(2).max(50),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\+?\d{10,15}$/, {
      message: "phone must be 10 to 15 digits and may start with +",
    }),
  dob: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), {
      message: "dob must be a valid ISO date string",
    }),
  gender: z.enum(["male", "female", "other"]),
  profile_photo: z.string().url().nullable().optional(),
});

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z
      .string()
      .min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordForm = z.infer<typeof passwordSchema>;
export type UpdateStudentProfile = z.infer<typeof updateStudentProfileSchema>;