import { z } from "zod";

// 🔹 Department schema (nested in student)
const departmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.number(),
  deleted: z.boolean(),
  created: z.string(), // ISO date string
  modified: z.string(), // ISO date string
});

// 🔹 Student schema
export const studentSchema = z.object({
  id: z.number(),
  department: departmentSchema.nullable(),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  enrollment_id: z.number(),
  roll_number: z.number(),
  dob: z.string(), // ISO date string (YYYY-MM-DD)
  entry_year: z.number().nullable(),
  gender: z.enum(["male", "female", "other"]),
  profile_photo: z.string().url("Invalid URL format").optional(),
  deleted: z.boolean(),
  created: z.string(), // ISO date string
  modified: z.string(), // ISO date string
});

// 🔹 Add student schema (for creating new students)
export const addStudentSchema = z.object({
  department_id: z.coerce.number().min(1, "Department is required"),
  first_name: z.string().trim().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").default("Qwerty123"),
  phone: z.string().regex(/^\d{10}$/, "Phone number is required"),
  enrollment_id: z.coerce.number().positive("Enrollment ID is required"),
  roll_number: z
    .coerce
    .number({
      invalid_type_error: "Roll No. is required",
    })
    .int("Roll No. must be an integer")
    .positive("Roll No. must be a positive number")
    .min(1, "Roll No. cannot be zero or negative"),
  dob: z.string().min(10, "Date of birth is required").max(10, "Date of birth must be a valid date"), // ISO date string (YYYY-MM-DD)
  entry_year: z.coerce.number().min(2025, "Entry year must be a valid year"),
  gender: z.enum(["male", "female", "other"]),
});

export const studentExcelUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "File is required" }) // ✅ required
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    }),
});

// 🔹 Update student schema (for updating existing students)
export const updateStudentSchema = addStudentSchema.partial();

// 👉 Infer types
export type Student = z.infer<typeof studentSchema>;
export type AddStudent = z.infer<typeof addStudentSchema>;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;
export type StudentDepartment = z.infer<typeof departmentSchema>;
export type StudentExcelUpload = z.infer<typeof studentExcelUploadSchema>;