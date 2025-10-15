"use client"
import React from "react"
import Link from "next/link"
import { Button, Textarea } from "flowbite-react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/shadcn-ui/Default-Ui/accordion"
import { Flag } from "lucide-react"
import Compiler from "../../comiler/Compiler"
import ChatBox from "../../UI/ChatBox"
import PartialMarksSection from "./PartialMarksSection"
import SubQuestionsAccordion from "./SubQuestionsAccordion"
import { Question, PartialMarks } from "@/lib/schemas/examResult.schema"

type MainQuestionAccordionProps = {
  question: Question
  scores: Record<string, number>
  partialMarks?: PartialMarks | null
  subPartialMarks?: Record<number | string, PartialMarks | null>
  onPartialMarksChange: (stepKey: string, value: string) => void
  onSavePartialMarks: () => void
  onSubPartialMarksChange: (subId: number | string, stepKey: string, value: string) => void
  onSubSavePartialMarks: (subQuestionId: number | string) => void
}

export default function MainQuestionAccordion({
  question,
  scores,
  partialMarks,
  subPartialMarks,
  onPartialMarksChange,
  onSavePartialMarks,
  onSubPartialMarksChange,
  onSubSavePartialMarks
}: MainQuestionAccordionProps) {
  return (
    <AccordionItem
      key={question.id}
      value={`question-${question.id}`}
      className="bg-white mb-4 border-0"
    >
      <AccordionTrigger className="bg-blue-100 text-[16px] !p-3 rounded-xl mb-3 flex items-center justify-between gap-3">
        <div className="flex-1 text-left whitespace-pre-wrap">
          {question.questionNumber && question.questionText && question.maxMarks ? (
            <>
              {`${question.questionNumber}`}:
              {question.questionText.replace(/<[^>]+>/g, "").replace(/\\n/g, '\n')}
              <br />
              <div className="flex text-[11px] justify-end">
                {question.maxMarks && (`Max: ${question.maxMarks}`)}
              </div>
            </>
          ) : ""}
        </div>
        {question.studentFlag && (
          <Button size="sm" color="red" className="p-2">
            <Flag size={16} />
          </Button>
        )}
      </AccordionTrigger>

      <AccordionContent className="!p-3 bg-gray-100 rounded-xl">
        {/* Answer Section */}
        {question.studentAnswer && (
          <div className="mb-4 bg-white p-3 rounded-md">
            <div className="flex justify-between items-end mb-4">
              <span className="text-normal font-semibold">Answer:</span>
              <div className="flex items-center gap-2">
                {question.studentAnswerURL && (
                  <Link target="_blank" href={`${question.studentAnswerURL}`}>
                    <Button className="">Download PDF</Button>
                  </Link>
                )}
                {question.questionType === 'code' && (
                  <Compiler language_id={50} stdin="" source_code={question.compilerCode ?? ""} />
                )}
              </div>
            </div>
            <Textarea
              className="w-full border resize-none bg-white rounded-md p-3 text-sm"
              rows={5}
              value={question.studentAnswer?.replace(/\\n/g, '\n') ?? "No answer provided"}
              disabled
            />
          </div>
        )}

        {/* Partial Marks and AI Insights Section */}
        {(partialMarks || question.aiInsights) && (
          <PartialMarksSection
            question={question}
            scores={scores}
            partialMarks={partialMarks}
            onPartialMarksChange={onPartialMarksChange}
            onSavePartialMarks={onSavePartialMarks}
            scoreKey={`q-${question.id}`}
          />
        )}

        {/* Chat Box for flagged questions */}
        {question.studentFlag && (
          <ChatBox
            studentRemark={question.studentRemark ?? null}
            professorRemarks={question.professorRemark ?? null}
          />
        )}

        {/* Sub-questions */}
        {question.subQuestions && question.subQuestions.length > 0 && (
          <SubQuestionsAccordion
            subQuestions={question.subQuestions.map(sub => ({
              ...sub,
              studentFlag: sub.studentFlag ?? null,
              studentAnswerContent: sub.studentAnswerContent ?? null,
              studentAnswerURL: sub.studentAnswerURL ?? null,
              questionType: sub.questionType ?? null,
              compilerCode: sub.compilerCode ?? null,
              aiInsights: sub.aiInsights ?? null,
              studentRemark: sub.studentRemark ?? null,
              professorRemark: sub.professorRemark ?? null,
              examMarkId: sub.examMarkId ?? null,
              subQuestionNumber: sub.subQuestionNumber ?? null,
              subQuestionText: sub.subQuestionText ?? null,
              maxMarks: sub.maxMarks ?? 0,
              score: sub.score ?? 0,
              // ✅ CRITICAL: Include nested subQuestions for 3rd level support
              subQuestions: sub.subQuestions ?? []
            }))}
            questionId={question.id}
            scores={scores}
            subPartialMarks={subPartialMarks ?? {}}
            onSubPartialMarksChange={onSubPartialMarksChange}
            onSubSavePartialMarks={onSubSavePartialMarks}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  )
}