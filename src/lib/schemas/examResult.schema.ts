import { nullable, z } from "zod";

const StatusSchema = z.object({
  bg: z.string(),
  text: z.string(),
  status: z.string().optional().nullable(),
});

const StudentSchema = z.object({
  id: z.number(),
  name: z.string(),
  rollnumber: z.number().nullable(),
});

// Schema for individual score entries in partialMarks
// Make every field optional/nullable because the API returns partial objects in some cases
const ScoreSchema = z.object({
  marks: z.number().optional().nullable(),
  score: z.number().optional().nullable(),
  instruction: z.string().optional().nullable(),
  instruction_label: z.string().optional().nullable(),
});

// ✅ flexible partialMarks schema to handle various API response formats
// Accept these shapes:
// - { scores: [{...score objects...}], total_max, total_score, ... }
// - { scores: [number, number, ...] }
// - { scores: number } (single aggregate value used by some endpoints)
// - an array of score objects directly
// - null / undefined
const PartialMarksSchema = z.union([
  z.object({
    scores: z.union([z.array(ScoreSchema), z.array(z.number()), z.number()]).optional(),
    total_max: z.number().optional().nullable(),
    total_score: z.number().optional().nullable(),
    grade_letter: z.string().optional().nullable(),
    grade_percentage: z.number().optional().nullable(),
    overall_feedback: z.string().optional().nullable(),
  }),
  z.array(ScoreSchema),
  z.number(),
  z.null(),
  z.undefined(),
]).optional().default(null);

const SubQuestionSchema: z.ZodType<any> = z.lazy(() => z.object({
  subQuestionId: z.number(),
  subQuestionNumber: z.string(),
  examMarkId: z.number().nullable(),
  aiInsights: z.string().nullable(),
  subQuestionText: z.string(),
  questionType: z.string().nullable(),
  maxMarks: z.number(),
  score: z.number(), // ✅ present in your JSON
  studentAnswerContent: z.string().nullable(),
  studentAnswerURL: z.string().nullable(),
  studentFlag: z.boolean().nullable(),
  aiFlag: z.boolean().nullable(), // ✅ added
  studentRemark: z.string().optional().nullable(),
  professorRemark: z.string().optional().nullable(),
  partialMarks: PartialMarksSchema,
  compilerCode: z.string().optional().nullable(), // ✅ added for code questions
  subQuestions: z.array(SubQuestionSchema).optional(), // ✅ recursive nesting support
}));

const QuestionSchema = z.object({
  id: z.number(),
  questionText: z.string().nullable(), // ✅ allow null values
  maxMarks: z.number().nullable(), // ✅ allow null values
  aiInsights: z.string().nullable(),
  examMarkId: z.number().nullable(),
  questionNumber: z.string(),
  questionType: z.string().nullable(),
  score: z.number(),
  studentAnswer: z.string().nullable(),
  studentAnswerURL: z.string().nullable(),
  studentFlag: z.boolean().nullable(),
  aiFlag: z.boolean().nullable(), // ✅ added
  studentRemark: z.string().optional().nullable(),
  professorRemark: z.string().optional().nullable(),
  partialMarks: PartialMarksSchema,
  status: z.object({
    bg: z.string(),
    text: z.string(),
  }),
  subQuestions: z.array(SubQuestionSchema),
  compilerCode: z.string().optional().nullable(), // ✅ added for code questions
});

const StudentResultSchema = z.object({
  id: z.number(),
  student: StudentSchema,
  questions: z.array(QuestionSchema),
  totalScore: z.number(),
  status: StatusSchema.optional().nullable(), // ✅ sometimes missing in JSON
});

const ExamDetailsSchema = z.object({
  id: z.number(),
  examType: z.string(),
  code: z.string(),
  course: z.string(),
});

const ExamResultDataSchema = z.object({
  examDetails: ExamDetailsSchema,
  students: z.array(StudentResultSchema),
});

export const ExamResultSchema = z.object({
  data: ExamResultDataSchema,
});



export const ExamSchema = z.object({
  id: z.number({
    required_error: "id is required",
    invalid_type_error: "id must be a number",
  }).int("id must be an integer").positive("id must be > 0"),

  examType: z.string({
    required_error: "examType is required",
    invalid_type_error: "examType must be a string",
  }).min(1, "examType cannot be empty"),

  code: z.string({
    required_error: "code is required",
    invalid_type_error: "code must be a string",
  }).min(1, "code cannot be empty"),

  course: z.string({
    required_error: "course is required",
    invalid_type_error: "course must be a string",
  }).min(1, "course cannot be empty"),
});

export type Exam = z.infer<typeof ExamSchema>;


export type Status = z.infer<typeof StatusSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type Score = z.infer<typeof ScoreSchema>;
export type PartialMarks = z.infer<typeof PartialMarksSchema>;
export type SubQuestion = z.infer<typeof SubQuestionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type StudentResult = z.infer<typeof StudentResultSchema>;
export type ExamDetails = z.infer<typeof ExamDetailsSchema>;
export type ExamResultData = z.infer<typeof ExamResultDataSchema>;
export type ExamResult = z.infer<typeof ExamResultSchema>;
