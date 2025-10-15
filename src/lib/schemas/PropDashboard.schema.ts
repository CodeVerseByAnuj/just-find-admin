import { z } from "zod"

// 🔹 Schema for students per course
export const studentsPerCourseSchema = z.object({
	courseId: z.number(),
	courseName: z.string(),
	studentCount: z.number(),
})

// 🔹 Main dashboard schema
export const propDashboardSchema = z.object({
	totalCourses: z.number(),
	totalExams: z.number(),
	timeSaved: z.string(),
	studentsPerCourse: z.array(studentsPerCourseSchema),
	aiInsights: z.array(z.string()),
})

// 🔹 Response wrapper (common pattern in repo)
export const propDashboardResponseSchema = z.object({
	success: z.boolean(),
	data: propDashboardSchema,
})

// 👉 Infer types
export type StudentsPerCourse = z.infer<typeof studentsPerCourseSchema>
export type PropDashboard = z.infer<typeof propDashboardSchema>
export type PropDashboardResponse = z.infer<typeof propDashboardResponseSchema>


// 🔹 Performance stats schema
export const studentStatsSchema = z.object({
	avg: z.number(),
	median: z.number(),
	min: z.number(),
	max: z.number(),
})

export const examPerformanceSchema = z.object({
	examTypeId: z.number(),
	examType: z.string(),
	profStudents: studentStatsSchema,
	otherStudents: studentStatsSchema,
})

export const coursePerformanceSchema = z.object({
	courseId: z.number(),
	courseName: z.string(),
	exams: z.array(examPerformanceSchema),
})

export const dashboardPerformanceSchema = z.object({
	performance: z.array(coursePerformanceSchema),
})

export const dashboardPerformanceResponseSchema = z.object({
	success: z.boolean(),
	data: dashboardPerformanceSchema,
})

// 👉 Infer types for performance
export type StudentStats = z.infer<typeof studentStatsSchema>
export type ExamPerformance = z.infer<typeof examPerformanceSchema>
export type CoursePerformance = z.infer<typeof coursePerformanceSchema>
export type DashboardPerformance = z.infer<typeof dashboardPerformanceSchema>
export type DashboardPerformanceResponse = z.infer<typeof dashboardPerformanceResponseSchema>


// Upcoming Exam Schema for Professor Dashboard
export const examDashboardSchema = z.object({
  id: z.number(),
  course: z.object({
    id: z.number(),
    title: z.string(),
    code: z.string(),
    deleted: z.boolean(),
  }),
  exam_type: z.object({
    id: z.number(),
    title: z.string(),
    deleted: z.boolean(),
  }),
  exam_date: z.string(),
  exam_time: z.string().nullable(),
});

export const professorUpcomingExamsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(examDashboardSchema),
});

export type ExamDashboard = z.infer<typeof examDashboardSchema>;

// 🔹 Professor Evaluation Insights Schema
export const professorEvaluationInsightSchema = z.object({
	examId: z.number(),
	examType: z.string(),
	courseId: z.number(),
	course: z.string(),
	studentsAppeared: z.number(),
	studentFlagged: z.number(),
	aiFlagged: z.number(),
});

export const professorEvaluationInsightsResponseSchema = z.object({
	success: z.boolean(),
	data: z.array(professorEvaluationInsightSchema),
});

export type ProfessorEvaluationInsight = z.infer<typeof professorEvaluationInsightSchema>;
export type ProfessorEvaluationInsightsResponse = z.infer<typeof professorEvaluationInsightsResponseSchema>;

