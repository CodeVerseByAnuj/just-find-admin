import { z } from "zod";

export const adminCourseSchema = z.object({
  data: z.record(
    z.string(), // key (e.g. "Programming For Problem Solving")
    z.record(
      z.string(), // key (e.g. "sem1", "sem2")
      z.number()  // value (marks or count)
    )
  ),
});


// ✅ One alert inside "alerts" array
export const examAlertSchema = z.object({
  examId: z.number(),
  examDate: z.string(), // you can refine with regex if you want strict dates
  course: z.string(),
  courseCode: z.string(),
  examType: z.string(),
  message: z.string(),
});

// ✅ Department bucket (value of each department key)
export const departmentBucketSchema = z.object({
  departmentCode: z.string(),
  totalCourses: z.number(),
  alerts: z.array(examAlertSchema),
});

// ✅ Whole API response (dynamic keys: departmentName -> bucket)
export const adminDashboardSchema = z.record(z.string(), departmentBucketSchema);

// Types for convenience
export type ExamAlert = z.infer<typeof examAlertSchema>;
export type DepartmentBucket = z.infer<typeof departmentBucketSchema>;
export type AdminDashboard = z.infer<typeof adminDashboardSchema>;

