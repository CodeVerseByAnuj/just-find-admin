import { z } from "zod";

export const examProfessorSchema = z.object({
  id: z.number(),
  title: z.string(),   // this should come from course.title
  code: z.string(),    // this should come from course.code
  exam_date: z.string(),
  exam_type: z.object({
    title: z.string(),
  }),
  max_marks: z.number(),
  published: z.boolean(),
})

export const examStudentResultSchema = z.object({
  id: z.number(),
  student: z.object({
    id: z.number(),
    first_name: z.string(),
    middle_name: z.string(),
    last_name: z.string(),
    enrollment_id: z.number().optional(),
    roll_number: z.number().nullable().optional(),
    gender: z.string().optional(),
  }),
  marks_obtained: z.number(),
  confidence_score: z.number(),
  status: z.string(),
  created: z.string(),
  modified: z.string(),
});

export const examSchema = z.object({
  exam_date: z.string(),
  max_marks: z.number(),
  course: z.string(),
  courseCode: z.string().nullable(),
});

export const statsSchema = z.object({
  studentsAppeared: z.number(),
  averageScore: z.number(),
  topScore: z.number().nullable(),
  bottomScrore: z.number().nullable(),
  pendingEvaluations: z.number(),
  flaggedEvaluations: z.number(),
  medianScore: z.number().nullable(),
});

export const examResultResponseSchema = z.object({
  examStudentResults: z.array(examStudentResultSchema),
  exam: examSchema,
  stats: statsSchema,
  
});

/* ------------------ NEW SCHEMA ------------------ */

// ✅ StudentDetails (similar to examStudentResult.student but with extra field)
export const studentDetailsSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  middle_name: z.string(),
  last_name: z.string(),
  enrollment_id: z.number(),
  roll_number: z.number(),
  entry_year: z.number(),
});

// ✅ CourseDetails (reusing examProfessorSchema and extending it)
export const courseDetailsSchema = examProfessorSchema.extend({
  credits: z.number(),
  deleted: z.boolean(),
  created: z.string(),
  modified: z.string(),
});

// ✅ Score schema for individual partial marks
export const scoreSchema = z.object({
  marks: z.number(),
  score: z.number(),
  instruction: z.string(),
  instruction_label: z.string().nullable(),
});

// ✅ PartialMarks with scores array (matching examResult.schema.ts)
export const partialMarksSchema = z.object({
  scores: z.array(scoreSchema),
}).nullable();

// ✅ SubQuestion
export const subQuestionSchema = z.object({
  subQuestionId: z.number(),
  subQuestionNumber: z.string(),
  examMarkId:z.number().nullable(),
  subQuestionText: z.string(),
  questionType: z.string().nullable(),
  maxMarks: z.number(),
  rubric: z.string(),
  studentFlag: z.boolean(),
  aiFlag: z.boolean(),
  studentAnswerURL: z.string().nullable(),
  studentAnswerContent: z.string(),
  score: z.number(),
  partialMarks: partialMarksSchema.optional(),
  compilerCode: z.string().optional().nullable(), // ✅ added for code questions
  id: z.number(),
});

// ✅ Question (with nested SubQuestions)
export const questionSchema = z.object({
  questionId: z.number(),
  questionNumber: z.string(),
  questionText: z.string(),
  questionType: z.string().nullable(),
  examMarkId:z.number().nullable(),
  maxMarks: z.number(),
  professorRemarks: z.string(),
  aiInsights: z.string().nullable(),
  studentRemarks: z.string().nullable(),
  studentFlag:z.boolean(),
  aiFlag: z.boolean(),
  rubric: z.string(),
  subQuestions: z.array(subQuestionSchema),
  studentAnswerURL: z.string().nullable(),
  studentAnswerContent: z.string().nullable(),
  score: z.number(),
  compilerCode: z.string().optional().nullable(),
  partialMarks: partialMarksSchema,
  id: z.number(),
});

// ✅ Final Response
export const studentExamResponseSchema = z.object({
   StudentDetails: studentDetailsSchema,
    courseDetails: courseDetailsSchema,
    StudentMarks: z.array(questionSchema),
});


export const ProfessorFlagSchema = z.object({
  examStudentMarks_id: z.number(),
  professor_remarks: z.string(),
  marks_obtained: z.number(),
  partial_marks_json: partialMarksSchema,
  total_score: z.number().optional(),
});


export const UpdatePartialMarksSchema = z.object({
  examStudentMarks_id: z.number(),
  partial_marks_json: partialMarksSchema,
});

/* ------------------ TYPES ------------------ */

export type ExamStudentResult = z.infer<typeof examStudentResultSchema>;
export type Exam = z.infer<typeof examSchema>;
export type Stats = z.infer<typeof statsSchema>;
export type ExamResultResponse = z.infer<typeof examResultResponseSchema>;

export type ExamProfessor = z.infer<typeof examProfessorSchema>;

export type Score = z.infer<typeof scoreSchema>;
export type PartialMarks = z.infer<typeof partialMarksSchema>;
export type StudentDetails = z.infer<typeof studentDetailsSchema>;
export type CourseDetails = z.infer<typeof courseDetailsSchema>;
export type SubQuestion = z.infer<typeof subQuestionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type StudentExamResponse = z.infer<typeof studentExamResponseSchema>;

export type ProfessorFlag = z.infer<typeof ProfessorFlagSchema>;
export type UpdatePartialMarks = z.infer<typeof UpdatePartialMarksSchema>;