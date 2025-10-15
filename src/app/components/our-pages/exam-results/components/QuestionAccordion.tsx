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

interface QuestionAccordionProps {
  question: {
    id: number
    questionNumber?: string
    questionText?: string
    maxMarks?: number
    studentFlag?: boolean
    studentAnswer?: string
    studentAnswerURL?: string
    questionType?: string
    compilerCode?: string
    aiInsights?: string
    studentRemark?: string
    professorRemark?: string
    examMarkId?: number
    // allow nested subQuestions for third-level support
    subQuestions?: Array<{
      subQuestionId: number
      subQuestionNumber?: string
      subQuestionText?: string
      maxMarks?: number
      studentFlag?: boolean
      studentAnswerContent?: string | null
      studentAnswerURL?: string | null
      questionType?: string | null
      compilerCode?: string | null
      aiInsights?: string | null
      studentRemark?: string | null
      professorRemark?: string | null
      examMarkId?: number | null
    }>
  }
  scores: Record<string, number>
  // handlers and partial marks map for nested sub-questions (third level)
  subPartialMarks?: Record<number | string, any>
  onSubPartialMarksChange?: (subId: number | string, stepKey: string, value: string) => void
  onSubSavePartialMarks?: (subQuestionId: number | string) => void
  partialMarks: any
  onPartialMarksChange: (stepKey: string, value: string) => void
  onSavePartialMarks: () => void
  isSubQuestion?: boolean
  questionPrefix?: string
}

export default function QuestionAccordion({
  question,
  scores,
  partialMarks,
  onPartialMarksChange,
  onSavePartialMarks,
  isSubQuestion = false,
  questionPrefix = ""
  ,
  subPartialMarks,
  onSubPartialMarksChange,
  onSubSavePartialMarks
}: QuestionAccordionProps) {
  // Compose a stable score key used by PartialMarksSection. For nested
  // sub-questions the prefix will include parent ids (e.g. "5-10").
  const scoreKey = isSubQuestion ? `sq-${questionPrefix}-${question.id}` : `q-${question.id}`

  // Compute nesting depth to visually indent deeper levels. The questionPrefix
  // uses hyphen-separated parent ids, so depth = number of hyphens + (isSubQuestion ? 1 : 0)
  const depth = questionPrefix ? questionPrefix.split('-').length + (isSubQuestion ? 1 : 0) : (isSubQuestion ? 1 : 0);
  const indentStyle = { marginLeft: depth > 0 ? `${depth * 12}px` : undefined } as React.CSSProperties;
  
  return (
    <AccordionItem
      key={question.id}
      value={isSubQuestion ? `sub-${question.id}` : `question-${question.id}`}
      className={isSubQuestion ? "" : "bg-white mb-4 border-0"}
    >
      <AccordionTrigger style={indentStyle} className={`${isSubQuestion ? 'bg-blue-50' : 'bg-blue-100'} text-[16px] !p-3 rounded-xl mb-3 flex items-center justify-between gap-3`}>
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
          <Button size="sm" color="red" className={`p-2 ${isSubQuestion ? 'ml-auto' : ''}`}>
            <Flag size={16} />
          </Button>
        )}
      </AccordionTrigger>

      <AccordionContent className={isSubQuestion ? "" : "!p-3 bg-gray-100 rounded-xl"}>
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
            scoreKey={scoreKey}
          />
        )}

        {/* Chat Box for flagged questions */}
        {question.studentFlag && (
          <ChatBox
            studentRemark={question.studentRemark ?? null}
            professorRemarks={question.professorRemark ?? null}
          />
        )}

        {/* If this question (which might be a sub-question) contains its own
            nested subQuestions, render them using SubQuestionsAccordion and
            pass down a composed prefix so deeper levels can calculate depth
            and unique keys. */}
        {(() => {
          console.log(`🔍 QuestionAccordion [${question.questionNumber}]: Has subQuestions?`, question.subQuestions?.length || 0);
          return question.subQuestions && question.subQuestions.length > 0;
        })() && (
          <div className="mt-3">
            {/* Compose a prefix that includes the current question id so children
                receive the full parent chain (e.g. "1-11"), enabling depth
                calculations and unique score keys for level 3. */}
            {
              (() => {
                const prefixForChildren = questionPrefix ? `${questionPrefix}-${question.id}` : `${question.id}`;
                return (
                  <SubQuestionsAccordion
                    subQuestions={question.subQuestions as any}
                    questionId={question.id}
                    questionPrefix={prefixForChildren}
                    scores={scores}
                    subPartialMarks={subPartialMarks ?? {}}
                    onSubPartialMarksChange={onSubPartialMarksChange ?? ((id, step, val) => onPartialMarksChange(step, val))}
                    onSubSavePartialMarks={onSubSavePartialMarks ?? (() => onSavePartialMarks())}
                  />
                )
              })()
            }
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

