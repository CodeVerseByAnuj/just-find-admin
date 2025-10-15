// schemas/exam.schema.ts
import { z } from "zod";

const semesterSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
});

const departmentSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  code: z.string().nullable(),
});

export const examTypeSchema = z.object({
  id: z.number(),
  title: z.string(),
});

export const courseSchema = z.object({
  title: z.string().nullable(),
  code: z.string().nullable(),
  semester: semesterSchema.nullable(),
  department: departmentSchema.optional().nullable(),
});

export const examSchema = z.object({
  id: z.number(),
  course: courseSchema,
  exam_type: examTypeSchema,
  questionsCount: z.number().min(0).optional(),
  max_marks: z.number(),
  exam_date: z.string(),
  exam_time: z.string().nullable(),
  published: z.boolean(),
  department: departmentSchema.optional().nullable(),
});

export const examsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    examsList: z.array(examSchema),
  }),
});

export const subQuestionSchema = z.object({
  id: z
    .union([z.number(), z.string(), z.undefined()])
    .transform((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .optional(), // Optional for create, required for update
  has_sub_question: z.literal(false),
  sub_question_number: z.string().min(1, 'Sub question number is required'),
  question: z.string().min(1, 'Sub question is required'),
  question_type_id: z.string(),
  max_marks: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'number') return val >= 1;
      return /^\d+(\.\d+)?$/.test(val);
    }, { message: 'Max marks must be a valid number' })
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((num) => num >= 1, { message: 'Max marks must be at least 1' }),
  rubric_json: z
    .string()
    .optional(),

});

export const questionSchema = z.object({
  id: z
    .union([z.number(), z.string(), z.undefined()])
    .transform((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .optional(), // Optional for create, required for update
  question_number: z.string().nullable(),


  question: z.string()
    .optional()
    .refine(val => {
      if (val === undefined) return true; // allow optional
      // Remove HTML tags and check for non-whitespace
      return val.replace(/<[^>]*>/g, '').trim().length > 0;
    }, {
      message: 'Question is required',
    }),
  has_sub_question: z.boolean(),
  max_marks: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'number') return val >= 1;
      return /^\d+(\.\d+)?$/.test(val);
    }, { message: 'Max marks must be a valid number' })
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((num) => num >= 1, { message: 'Max marks must be at least 1' }),
  rubric_json: z
    .string()
    .optional(),
  question_type_id: z
    .union([z.number(), z.string(), z.undefined(), z.null()])
    .transform((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .optional(),
  sub_questions: z.array(subQuestionSchema).default([]),
}).refine((data) => {
  if (!data.has_sub_question) {
    return data.question && data.question.trim().length > 0;
  }
  return true;
}, {
  message: 'Question text is required when there are no sub-questions',
  path: ['question'],
}).refine((data) => {
  if (!data.has_sub_question) {
    return data.question_type_id && data.question_type_id > 0;
  }
  return true;
}, {
  message: 'Question type is required when there are no sub-questions',
  path: ['question_type_id'],
}).refine((data) => {
  // Validate that sub-question marks don't exceed parent question marks
  if (data.has_sub_question && data.sub_questions && data.sub_questions.length > 0) {
    const parentMarks = data.max_marks;
    if (parentMarks === undefined || isNaN(parentMarks)) return true; // Let other validation handle invalid parent marks

    let totalSubMarks = 0;
    for (let i = 0; i < data.sub_questions.length; i++) {
      const subQuestion = data.sub_questions[i];
      const subMarks = subQuestion.max_marks;
      if (subMarks !== undefined && !isNaN(subMarks)) {
        if (subMarks > parentMarks) {
          return false;
        }
        totalSubMarks += subMarks;
      }
    }
    if (totalSubMarks > parentMarks) {
      return false;
    }
  }
  return true;
}, {
  message: `Sub-question marks cannot exceed the parent question's marks`,
  path: ['sub_questions'],
});

export const examCreateSchema = z.object({
  id: z
    .union([z.number(), z.string(), z.undefined()])
    .transform((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .optional(), // Optional for create, required for update
  course_id: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val !== undefined && val > 0, { message: 'Course is required' }),
  department_id: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val !== undefined && val > 0, { message: 'Course is required' }),

  exam_type_id: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val !== undefined && val > 0, { message: 'Exam type is required' }),

  max_marks: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'number') return val >= 1;
      return /^\d+(\.\d+)?$/.test(val);
    }, { message: 'Max marks must be a valid number' })
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((num) => num >= 1, { message: 'Max marks must be at least 1' }),

  exam_date: z
    .string()
    .refine((val) => {
      if (!val || val.trim() === '') return false;
      return /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, { message: 'Exam date is required and must be in YYYY-MM-DD format' }),

  exam_time: z
    .string()
    .transform(val => {
      // If user enters only HH:MM, append ':00'
      if (/^\d{2}:\d{2}$/.test(val)) {
        return val + ':00';
      }
      return val;
    }),

rubric_url: z.string().min(1, { message: "Rubric file is required" }),

  published: z.boolean().optional(),
  exam_question_file: z.string()
    .nullable()
    .refine(
      (val) => val === null || val === undefined || val.toLowerCase().endsWith('.pdf'),
      { message: 'Only PDF files are allowed' }
    ),

  questions: z
    .array(questionSchema)
    .optional()
    .refine((val) => val && val.length >= 1, { message: 'Add at least one question' }),
});

export const examUpdateSchema = z.object({
  id: z
    .union([z.number(), z.string(), z.undefined()])
    .transform((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .optional(), // Optional for create, required for update
  course_id: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val !== undefined && val > 0, { message: 'Course is required' }),
  department_id: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val !== undefined && val > 0, { message: 'Department is required' }),

  exam_type_id: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val !== undefined && val > 0, { message: 'Exam type is required' }),

  max_marks: z
    .union([z.number(), z.string()])

    .refine((val) => {
      if (typeof val === 'number') return val >= 1;
      return /^\d+(\.\d+)?$/.test(val);
    }, { message: 'Max marks must be a valid number' })
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((num) => num >= 1, { message: 'Max marks must be at least 1' }),

  exam_date: z
    .string()
    .refine((val) => {
      if (!val || val.trim() === '') return false;
      return /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, { message: 'Exam date is required and must be in DD-MM-YYYY format' }),

  exam_time: z
    .string()
    .min(1, { message: "Exam time is required" }) // ✅ required validation
    .transform(val => {
      // If user enters only HH:MM, append ':00'
      if (/^\d{2}:\d{2}$/.test(val)) {
        return val + ':00';
      }
      return val;
    }),


  rubric_url: z
    .string()
    .min(1, { message: "Rubric file is required" }),

  published: z.boolean().optional(),
  exam_question_file: z.string()
    .min(1, { message: "File is required" }) // required check
    .refine((val) => val.toLowerCase().endsWith(".pdf"), {
      message: "Only PDF files are allowed",
    })

});

export const examQuestionSchema = z.object({
  id: z.number(),
  has_sub_question: z.boolean(),
  question: z.string().nullable(),
  sub_questions: z.array(z.any()).default([]),
  question_number: z.string().nullable(),
  sub_question_number: z.string().nullable(),
  question_type: z.string().nullable(),
  max_marks: z.number()
    .nullable(),
  created: z.string(),
  modified: z.string(),
});

export const examDetailSchema = z.object({
  id: z.number(),
  course: z.object({
    id: z.number(),
    title: z.string(),
    code: z.string(),
    credits: z.number(),
    semester: z.any().nullable(),
    created: z.string(),
  }),
  department: z.object({
    id: z.number(),
    name: z.string(),
  }),
  exam_type: examTypeSchema,
  exam_question_file: z.string().nullable(),
  max_marks: z
    .number({ invalid_type_error: 'Max marks must be a valid number' })
    .min(1, { message: 'Max marks must be at least 1' }),
  exam_date: z.string(),
  exam_time: z.string().nullable(),
  rubric_url: z
    .string()
    .nullable(),

  published: z.boolean(),
  created: z.string(),
  modified: z.string(),
});

export const examDetailResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    exam: examDetailSchema,
    question: z.array(examQuestionSchema),
  }),
});

export const UploadExamFileSchema = z.object({
  file: z
    .any()
    .refine((file) => file != null, {
      message: "File is required",
    })
    .refine(
      (file) =>
        file &&
        typeof file === "object" &&
        (
          (file.type && file.type === "application/zip") ||
          (file.name && file.name.endsWith(".zip"))
        ),
      {
        message: "Only ZIP files are allowed",
      }
    ),
});


export type SubQuestion = z.infer<typeof subQuestionSchema>;
export type Question = z.infer<typeof subQuestionSchema>;
export type ExamQuestion = z.infer<typeof examQuestionSchema>;
export type ExamDetail = z.infer<typeof examDetailSchema>;
export type ExamDetailResponse = z.infer<typeof examDetailResponseSchema>;
// 👉 Infer types
export type Exam = z.infer<typeof examSchema>;
export type ExamsResponse = z.infer<typeof examsResponseSchema>;
export type ExamCreateInput = z.infer<typeof examCreateSchema>;
