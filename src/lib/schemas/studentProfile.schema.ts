import { z } from "zod";

export const StudentProfileSchema = z.object({
  first_name: z.string(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  enrollment_id: z.string().optional().nullable(),
  roll_number: z.string().optional().nullable(),
  department: z.object({ name: z.string().optional().nullable() }).optional().nullable(),
  entry_year: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  profile_photo: z.string().nullable().optional(),
  profile_photo_url: z.string().nullable().optional(),
});

export const updateStudentProfileSchema = z.object({
  first_name: z.string().min(2).max(50).optional(),
  middle_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(2).max(50).optional(),
  phone: z.string().min(10).max(15).optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters").max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type UpdateStudentProfile = z.infer<typeof updateStudentProfileSchema>;
export type PasswordForm = z.infer<typeof passwordSchema>;
