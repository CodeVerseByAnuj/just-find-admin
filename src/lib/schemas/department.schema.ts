import { z } from "zod";

// 🔹 Department schema
export const departmentSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Department name is required"),
  type: z.enum(['department', 'center'], {
    errorMap: () => ({ message: "Department type is required" })
  }),
  code: z.string().nullable(),
  created: z.string(), // ISO date string
});

export const addDepartmentSchema = z.object({
  name: z
    .string()
    .trim() // Removes leading/trailing spaces
    .min(1, "Name is required"),
  type: z.enum(['department', 'center'], {
    errorMap: () => ({ message: "Type is required" })
  }),
  code: z.string().min(1, "Code is required"),
});


// 👉 Infer type
export type Department = z.infer<typeof departmentSchema>;
export type AddDepartment = z.infer<typeof addDepartmentSchema>;
