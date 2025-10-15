import { id } from "date-fns/locale";
import { z } from "zod";

export const examStudentSchema = z.object({
  exam_id: z.number(),
  exam_type: z.string(),
  exam_date: z.string(),
  course_name: z.string(),
  course_code: z.string(),
  max_marks: z.number(),
  marks_obtained: z.number().nullable(),
  status: z.string().nullable(),
  published: z.boolean(),
});


export const examStudentResultSchema = z.object({
  id: z.number(),
  student: z.object({
    id: z.number(),
    first_name: z.string(),
    middle_name: z.string(),
    last_name: z.string(),
    enrollment_id: z.number().optional(),
    roll_number: z.number(),
    gender: z.string().optional(),
  }),
  marks_obtained: z.number().nullable(),
  confidence_score: z.number(),
  status: z.string(),
  created: z.string(),
  modified: z.string(),
});

export const examSchema = z.object({
  exam_date: z.string(),
  max_marks: z.number(),
  course: z.string(),
});

export const statsSchema = z.object({
  studentsAppeared: z.number(),
  averageScore: z.number(),
  topScore: z.number(),
  bottomScrore: z.number(),
  pendingEvaluations: z.number(),
  reviewedEvaluations: z.number(),
  medianScore: z.number(),
});

export const examResultResponseSchema = z.object({
  examStudentResults: z.array(examStudentResultSchema),
  exam: examSchema,
  stats: statsSchema,
});


/**
 * Reusable partialMarks schema (the API key is `partialMarks`)
 */
export const partialMarksSchema = z
  .object({
      scores: z.array(
        z.object({
          marks: z.number().optional().nullable(),     // allow missing marks or partial objects
          score: z.number().optional().nullable(),
          instruction: z.string().optional().nullable(),
        })
      ).optional(),
    total_max: z.number().optional().nullable(),
    total_score: z.number().optional().nullable(),
    grade_letter: z.string().optional().nullable(),
    grade_percentage: z.number().optional().nullable(),
    overall_feedback: z.string().optional().nullable(),
  })
  .partial(); // makes any remaining keys optional too if you add more later


/**
 * Sub-question schema — matches API keys like `subQuestionId`, includes nullable/optional fields
 */
export const subQuestionSchema = z.object({
  // API: examMarkId (nullable in sample), subQuestionId etc.
  examMarkId: z.number().nullable().optional(),
  subQuestionId: z.number().nullable().optional(),
  subQuestionNumber: z.string().nullable().optional(),
  subQuestionText: z.string().nullable().optional(),
  maxMarks: z.number().nullable().optional(),
  // student answer fields
  studentAnswerURL: z.string().nullable().optional(),
  studentAnswerContent: z.string().nullable().optional(),
  // score/marks
  score: z.number().nullable().optional(),            // API uses `score`
  marksObtained: z.number().nullable().optional(),    // keep if you also use this name
  // partial marks object is named partialMarks in the API
  partialMarks: partialMarksSchema.nullable().optional(),
  // flags and remarks
  studentFlag: z.boolean().nullable().optional(),
  aiFlag: z.boolean().nullable().optional(),
  studentRemark: z.string().nullable().optional(),
  professorRemark: z.string().nullable().optional(),
  aiInsights: z.string().nullable().optional(),
});

/**
 * Top-level StudentMarks entry
 * Matches the payload: id, examMarkId, questionNumber, score, partialMarks, subQuestions[], etc.
 */
export const studentMarkSchema = z.object({
  id: z.number(),
  examMarkId: z.number().nullable().optional(),      // present in sample as nullable
  questionText: z.string().nullable().optional(),
  questionNumber: z.string().nullable().optional(),
  maxMarks: z.number().nullable().optional(),
  // student answer fields at top-level
  studentAnswer: z.string().nullable().optional(),
  studentAnswerURL: z.string().nullable().optional(),
  // score/marks
  score: z.number().nullable().optional(),            // API uses `score`
  marksObtained: z.number().nullable().optional(),    // keep if you also use this name
  // partial marks object (use the proper key name the API sends)
  partialMarks: partialMarksSchema.nullable().optional(),
  // flags and remarks
  studentFlag: z.boolean().nullable().optional(),
  aiFlag: z.boolean().nullable().optional(),
  studentRemark: z.string().nullable().optional(),
  professorRemark: z.string().nullable().optional(),
  aiInsights: z.string().nullable().optional(),
  status: z
    .object({
      bg: z.string().nullable().optional(),
      text: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  subQuestions: z.array(subQuestionSchema).nullable().optional(),
});

/**
 * Student details and course details (tolerant to null/missing fields)
 */
export const studentDetailsSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  middle_name: z.string().nullable().optional(),
  last_name: z.string(),
  enrollment_id: z.number().nullable().optional(),
  roll_number: z.number().nullable().optional(),
  entry_year: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
});

export const courseDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  code: z.string(),
  credits: z.number().nullable().optional(),
  deleted: z.boolean().nullable().optional(),
  created: z.string().nullable().optional(),
  modified: z.string().nullable().optional(),
});

/**
 * Full response schema
 */
export const studentExamResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    StudentDetails: studentDetailsSchema,
    courseDetails: courseDetailsSchema,
    StudentMarks: z.array(studentMarkSchema),
    totalScore: z.number().nullable().optional(),
  }),
});

/**
 * Student flag input schema (unchanged)
 */
export const studentFlagSchema = z.object({
  examStudentMarks_id: z.number(),
  student_remarks: z
    .string({
      required_error: "Reason is required",
      invalid_type_error: "Reason must be text",
    })
    .min(1, "Reason cannot be empty"),
});

// Types
export type StudentExamResponse = z.infer<typeof studentExamResponseSchema>;
export type StudentMark = z.infer<typeof studentMarkSchema>;
export type SubQuestion = z.infer<typeof subQuestionSchema>;
export type PartialMarks = z.infer<typeof partialMarksSchema>;


/* ------------------ TYPES ------------------ */

export type ExamStudentResult = z.infer<typeof examStudentResultSchema>;
export type Exam = z.infer<typeof examSchema>;
export type Stats = z.infer<typeof statsSchema>;
export type ExamResultResponse = z.infer<typeof examResultResponseSchema>;

export type ExamStudent = z.infer<typeof examStudentSchema>;

export type StudentDetails = z.infer<typeof studentDetailsSchema>;
export type CourseDetails = z.infer<typeof courseDetailsSchema>;

export type StudentFlag = z.infer<typeof studentFlagSchema>;
