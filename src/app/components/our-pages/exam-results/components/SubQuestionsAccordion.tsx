"use client"
import React from "react"
import { Accordion } from "@/app/components/shadcn-ui/Default-Ui/accordion"
import QuestionAccordion from "./QuestionAccordion"
import { SubQuestion, PartialMarks } from "@/lib/schemas/examResult.schema"

interface SubQuestionsAccordionProps {
  subQuestions: SubQuestion[]
  questionId: number
  questionPrefix?: string
  scores: Record<string, number>
  subPartialMarks: Record<number | string, PartialMarks | null>
  onSubPartialMarksChange: (subId: number | string, stepKey: string, value: string) => void
  onSubSavePartialMarks: (subQuestionId: number | string) => void
}

export default function SubQuestionsAccordion({
  subQuestions,
  questionId,
  questionPrefix,
  scores,
  subPartialMarks,
  onSubPartialMarksChange,
  onSubSavePartialMarks
}: SubQuestionsAccordionProps) {
  // Build a prefix that represents the parent chain. If a questionPrefix was
  // provided (from a higher-level parent), include it so nested children will
  // receive a combined prefix like "parentId-childId".
  const prefixForChildren = questionPrefix ? `${questionPrefix}-${questionId}` : `${questionId}`;
  
  console.log(`🔍 SubQuestionsAccordion [${questionId}]: Processing ${subQuestions.length} subQuestions`);
  subQuestions.forEach((sub, idx) => {
    console.log(`  - Sub ${idx}: ${sub.subQuestionNumber} has ${(sub as any).subQuestions?.length || 0} nested subQuestions`);
  });
  return (
    <Accordion
      type="multiple"
      className="w-full mt-4 bg-white p-3 rounded-md"
      defaultValue={subQuestions.map((sub) => `sub-${sub.subQuestionId}`)}
    >
      {subQuestions.map((sub) => (
        <QuestionAccordion
          key={sub.subQuestionId}
          question={{
            id: sub.subQuestionId as number,
            questionNumber: sub.subQuestionNumber ?? undefined,
            questionText: sub.subQuestionText ?? undefined,
            maxMarks: sub.maxMarks ?? undefined,
            studentFlag: sub.studentFlag ?? undefined,
            studentAnswer: sub.studentAnswerContent ?? undefined,
            studentAnswerURL: sub.studentAnswerURL ?? undefined,
            questionType: sub.questionType ?? undefined,
            compilerCode: sub.compilerCode ?? undefined,
            aiInsights: sub.aiInsights ?? undefined,
            studentRemark: sub.studentRemark ?? undefined,
            professorRemark: sub.professorRemark ?? undefined,
            examMarkId: sub.examMarkId ?? undefined,
            // ✅ CRITICAL: Pass nested subQuestions for 3rd level support
            subQuestions: (sub as any).subQuestions ?? []
          }}
          scores={scores}
          partialMarks={subPartialMarks[sub.subQuestionId]}
          onPartialMarksChange={(stepKey, value) => 
            onSubPartialMarksChange(sub.subQuestionId, stepKey, value)
          }
          onSavePartialMarks={() => onSubSavePartialMarks(sub.subQuestionId)}
          isSubQuestion={true}
          // Pass down the composed prefix so deeper levels can compute depth
          // and unique score keys properly. e.g. "10" for level-2 subquestions
          // or "5-10" for level-3 nested subquestions.
          questionPrefix={prefixForChildren}
          // Allow the nested QuestionAccordion to render its own nested
          // SubQuestions by providing the handlers and partial marks map
          onSubPartialMarksChange={onSubPartialMarksChange}
          onSubSavePartialMarks={onSubSavePartialMarks}
          subPartialMarks={subPartialMarks}
        />
      ))}
    </Accordion>
  )
}