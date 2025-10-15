import { z } from "zod"

export const addCourseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  code: z.string().trim().min(1, 'Code is required'),
  credits: z.coerce.number().min(1, 'Credits must be at least 1'),
  department_id: z.coerce.number().min(1, 'Department is required'),
  semesterId: z.coerce.number().min(1, 'Semester is required'),
});

// 🔹 Department schema
const departmentSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  code: z.string().nullable(),
  type: z.string().optional(),
  deleted: z.boolean().optional(),
});

export const semesterSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  deleted: z.boolean().optional(),
});

export const courseSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  code: z.string().nullable(),
  department: departmentSchema.nullable().optional(),
  semester: semesterSchema.nullable().optional(),
  credits: z.number(),
  created: z.string(),
  modified: z.string(),
})

// single course response
export const courseResponseSchema = z.object({
  success: z.boolean(),
  data: courseSchema,
})

// list response (courses array + pagination)
export const courseListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    courses: z.array(courseSchema),
  }),
})

export type Course = z.infer<typeof courseSchema>
export type CourseResponse = z.infer<typeof courseResponseSchema>
export type CourseListResponse = z.infer<typeof courseListResponseSchema>
export type AddCourseFormData = z.infer<typeof addCourseSchema>;




// Department Wise Course Schema
export const departmentWiseCourseSchema = z.object({
  id: z.number(),
  title: z.string(),
  code: z.string(),
  credits: z.number(),
  deleted: z.boolean(),
  created: z.string(),
  modified: z.string(),
});

export type DepartmentWiseCourse = z.infer<typeof departmentWiseCourseSchema>;

export const courseListDepartmentResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(departmentWiseCourseSchema),
});



