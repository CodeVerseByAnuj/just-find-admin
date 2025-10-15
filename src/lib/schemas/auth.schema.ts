import { z } from "zod";

// 🔹 Reusable fields
const emailSchema = z
  .string()
  .nonempty("Email is required")
  .email("Invalid email address")
  .refine((val) => !val.toLowerCase().includes("yopmail"), {
    message: "Disposable email addresses are not allowed",
  });

const passwordSchema = z
  .string()
  .nonempty("Password is required")

// 🔹 Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().optional(),
  // user_role: z.number().default(1),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// 🔹 Signup schema
export const signupSchema = z
  .object({
    name: z.string().nonempty("Name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    user_role: z.number().default(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupFormData = z.infer<typeof signupSchema>;

// 🔹 Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
  // name: z.string().nonempty("Name is required"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// 🔹 Student Forgot password schema
export const studentForgotPasswordSchema = z.object({
  email: emailSchema,
  // name: z.string().nonempty("Name is required"),
});
export type StudentForgotPasswordFormData = z.infer<typeof studentForgotPasswordSchema>;

// 🔹 Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().nonempty("Token is required"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
