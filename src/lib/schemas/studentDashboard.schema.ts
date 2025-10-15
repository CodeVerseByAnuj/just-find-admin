import z from "zod";

export const studentDashboardCardSchema = z.object({
    studentFirstName: z.string(),
    studentMiddleName: z.string(),
    studentLastName: z.string(),
    studentRollNo: z.nullable(z.number()),
    studentEnrollmentId: z.number(),
    totalCourses: z.number(),
    totalCredits: z.number(),
    CGPA: z.number().nullable(),
    deptRank: z.number(),
    aiInsights: z.array(z.any()).optional()
});

export const studentDashboardMarksSchema = z.array(
    z.object({
        exam: z.object({
            id: z.number(),
            courseName: z.string(),
            courseCredits: z.number().optional(),
            examType: z.string(),
            examDate: z.string(),
            examTime: z.string()
        }),
        studentMarks:  z.nullable(z.number()),
        averageMarks:  z.nullable(z.number()),
    })
);

export const studentDashboardRankSchema = z.array(
    z.object({
        exam: z.object({
            id: z.number(),
            courseName: z.string(),
            courseCredits: z.number().optional(),
            examType: z.string(),
            examDate: z.string(),
            examTime: z.string()
        }),
        studentResult: z.nullable(z.object({
            marksObtained: z.number(),
            status: z.string(),
            confidenceScore: z.number()
        })),
        totalStudents: z.number(),
        rank: z.nullable(z.number())
    })
);
// 👉 Infer types
export const studentDashboardPercentileSchema = z.array(
    z.object({
        examId: z.number(), // changed from examId to id
        courseName: z.string(),
        examName: z.string().optional(),
        marks: z.number().optional(),
        percentile: z.number()
    })
);

export type StudentDashboardRank = z.infer<typeof studentDashboardRankSchema>;
export type StudentDashboardCard = z.infer<typeof studentDashboardCardSchema>;
export type StudentDashboardPercentile = z.infer<typeof studentDashboardPercentileSchema>;
export type StudentDashboardMarks = z.infer<typeof studentDashboardMarksSchema>;
