import { z } from "zod";

// 🔹 Department schema (nested in professor)
const departmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.number(),
  deleted: z.boolean(),
  created: z.string(), // ISO date string
  modified: z.string(), // ISO date string
});

// 🔹 User role schema (nested in professor)
const userRoleSchema = z.object({
  id: z.number(),
  title: z.string(),
  identifier: z.string(),
  status: z.boolean(),
  created: z.string(), // ISO date string
  modified: z.string(), // ISO date string
});

// 🔹 Course schema (nested in professor)
const courseSchema = z.object({
  id: z.number(),
  title: z.string(),
  code: z.string(),
  credits: z.number(),
  created: z.string(), // ISO date string
  modified: z.string(), // ISO date string
});

// 🔹 Professor schema
export const professorSchema = z.object({
  id: z.number(),
  department: departmentSchema.nullable(),
  course: courseSchema.nullable(),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().nullable(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  dob: z.string()
    .min(1, "Date of birth is required")
    .min(10, "Date of birth must be a valid date")
    .max(10, "Date of birth must be a valid date"),
  gender: z.enum(["male", "female", "other"]),
  designation: z.string().nullable(),
  profile_photo: z.string().url("Invalid URL format").nullable(),
  deleted: z.boolean(),
  user_role: userRoleSchema,
  created: z.string(),
  modified: z.string(),
});

// 🔹 Add professor schema (for creating new professors)
export const addProfessorSchema = z.object({
  department_id: z.coerce.number().min(1, "Department is required"),
  course_ids: z.array(z.coerce.number().min(1, "Course is required")),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").default("Qwerty123"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  dob: z.string()
    .min(1, "Date of birth is required")
    .min(10, "Date of birth must be a valid date")
    .max(10, "Date of birth must be a valid date"),
  employee_id: z.string().min(1, "Employee Id is required"),
  gender: z.enum(["male", "female", "other"]),
  designation: z.string().min(1, "Designation is required"),
  profile_photo: z.string().url("Invalid URL format").optional(),
  user_role_id: z.coerce.number().min(1, "User role ID must be a positive number").default(2),
  course_prof_id: z.coerce.number().min(1, "Course professor ID must be a positive number").optional()
});

// 🔹 Update professor schema (for updating existing professors)
export const updateProfessorSchema = z.object({
  department_id: z.coerce.number().min(1, "Department is required"),
  course_ids: z.array(z.coerce.number().min(1, "Course is required")),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  dob: z.string()
    .min(1, "Date of birth is required")
    .min(10, "Date of birth must be a valid date")
    .max(10, "Date of birth must be a valid date"),
  employee_id: z.string().min(1, "Employee Id is required"),
  gender: z.enum(["male", "female", "other"]),
  designation: z.string().min(1, "Designation is required"),
  profile_photo: z.string().url("Invalid URL format").optional(),
  user_role_id: z.coerce.number().min(1, "User role ID must be a positive number").default(2),
  course_prof_id: z.coerce.number().min(1, "Course professor ID must be a positive number").optional()
});

export const professorExcelUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "A file is required" }) // ✅ required
    .refine((file) => {
      const validTypes = [".xls", ".xlsx"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      return validTypes.includes(`.${fileExtension}`);
    }, { message: "Invalid file type. Only .xls or .xlsx files are allowed" }) // ✅ clearer message
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than or equal to 10 MB",
    }),
});



// 👉 Infer types
export type Professor = z.infer<typeof professorSchema>;
export type AddProfessor = z.infer<typeof addProfessorSchema>;
export type UpdateProfessor = z.infer<typeof updateProfessorSchema>;
export type ProfessorDepartment = z.infer<typeof departmentSchema>;
export type ProfessorUserRole = z.infer<typeof userRoleSchema>;
export type ProfessorCourse = z.infer<typeof courseSchema>;
export type ProfessorExcelUpload = z.infer<typeof professorExcelUploadSchema>;
