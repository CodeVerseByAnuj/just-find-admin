import { z } from "zod";

// Admin profile schema based on API response
export const AdminProfileSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dob: z.string(), // ISO date string
  gender: z.string(),
  profile_photo: z.string().nullable(),
  profile_photo_url: z.string().nullable(),
});

// For updating admin profile
export const updateAdminProfileSchema = z.object({
  first_name: z.string().min(2).max(50).optional(),
  last_name: z.string().min(2).max(50).optional(),
  phone: z.string().min(10).max(10).optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  profile_photo: z.string().nullable().optional(),
});

export const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters").max(100),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

// Types
export type AdminProfile = z.infer<typeof AdminProfileSchema>;
export type UpdateAdminProfile = z.infer<typeof updateAdminProfileSchema>;
export type PasswordForm = z.infer<typeof passwordSchema>;
