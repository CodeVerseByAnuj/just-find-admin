// QuestionItem.tsx
"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/shadcn-ui/Default-Ui/accordion";
import { Button } from "flowbite-react";
import { Flag, Check } from "lucide-react";
import ChatBox from "../UI/ChatBox";
import type { SubQuestion } from "@/lib/schemas/examProfessor.schema";

type PartialMarks = Record<string, number | string> | undefined;

export type QuestionShape = {
  id?: number;
  questionId: number;
  questionNumber?: number;
  questionText: string;
  maxMarks?: number;
  marksObtained?: number | string;
  studentRemarks?: string | null;
  professorRemarks?: string | null;
  rubric?: string | null;
  studentAnswerContent?: string | null;
  partialMarks?: PartialMarks;
  subQuestions: Array<SubQuestion & { id?: number }>;
  // and any other fields you have — kept permissive
};

type Props = {
  q: QuestionShape;
  openChatKeys: Set<string>;
  toggleFlagChat: (qId: number, subId?: number, e?: React.MouseEvent) => void;
  openEvaluateModal: (qId: number, subId?: number, e?: React.MouseEvent) => void;
};

export default function QuestionItem({ q, openChatKeys, toggleFlagChat, openEvaluateModal }: Props) {
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const qKey = `q-${q.questionId}`;

  return (
    <AccordionItem key={q.questionId} value={`question-${q.questionId}`} className="bg-white dark:bg-dark mb-4 border-0">
      <AccordionTrigger className='bg-blue-100 text-[16px] !p-3 rounded-xl mb-3 flex items-center justify-between gap-3'>
        <div className="flex-1 text-left">
          {`Q${q.questionNumber ?? ""}: ${stripHtml(q.questionText)} ${q.maxMarks ? `(Max: ${q.maxMarks})` : ""}`}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={(e) => openEvaluateModal(q.questionId, undefined, e)}
            color={"secondary"}
            size="sm"
          >
            <Check size={16} />
            <span className='ml-2'>Evaluate</span>
          </Button>

          <Button
            onClick={(e) => toggleFlagChat(q.questionId, undefined, e)}
            size="sm"
            color={"red"}
            className='p-2'
            aria-pressed={openChatKeys.has(qKey)}
          >
            <Flag size={16} />
          </Button>
        </div>
      </AccordionTrigger>

      <AccordionContent className='!p-3 bg-gray-100 rounded-xl'>
        <div className="flex flex-col gap-3 mb-3">
          <strong>Marks Obtained:</strong>
          <input type="text" className="p-2 text-[16px]" value={q.marksObtained ?? ''} readOnly />
        </div>

        {openChatKeys.has(qKey) && (
          <ChatBox
            studentRemark={q.studentRemarks ?? ""}
            professorRemarks={q.professorRemarks ?? ""}
          />
        )}

        {q.rubric && <div><strong>Rubric:</strong> {q.rubric}</div>}
        {q.studentAnswerContent && (
          <div className="space-y-4">
            <div>
              <strong className="block text-gray-700 font-semibold mb-2">Answer:</strong>
              <textarea
                className="w-full border resize-none border-gray-200 !bg-white rounded-md p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={5}
                value={q.studentAnswerContent.replace(/\\n/g, '\n')}
                disabled
              />
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-4 py-6 flex gap-6">
              <div className="flex-1 bg-gray-100 p-2 rounded-md">
                <h4 className="text-gray-800 font-semibold mb-3">Partial Marks</h4>
                <div className="space-y-2">
                  {(Object.entries(q.partialMarks ?? {}) as [string, any][]).map(([step, marks]) => (
                    <div
                      key={step}
                      className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-gray-600">{step}</span>
                      <span className="">
                        <input className="p-2" type="text" value={marks as any} readOnly />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-gray-100 p-2 rounded-md">
                <h4 className="text-gray-800 font-semibold mb-3">AI Remarks</h4>
                <div className="space-y-2">
                  <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Suscipit perferendis vitae, culpa consequatur voluptatibus vero atque magnam, nihil, fuga nam numquam. Reiciendis unde esse, dolore at eos laudantium odit voluptates!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {q.subQuestions.length > 0 && (
          <Accordion type="multiple" defaultValue={q.subQuestions.map(s => `sub-${s.subQuestionId}`)} className="w-full mt-4">
            {q.subQuestions.map((sub: SubQuestion & { id?: number }) => {
              const subKey = `q-${q.questionId}-s-${sub.subQuestionId}`;
              return (
                <AccordionItem key={sub.subQuestionId} value={`sub-${sub.subQuestionId}`} className=" dark:bg-dark">
                  <AccordionTrigger className='bg-blue-100 text-[16px] !p-3 rounded-xl mb-3 flex items-center justify-between gap-3'>
                    <div className="flex-1 text-left">
                      {`Q${sub.subQuestionNumber}: ${stripHtml(sub.subQuestionText)} ${sub.maxMarks ? `(Max: ${sub.maxMarks})` : ""}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => openEvaluateModal(q.questionId, sub.subQuestionId, e)}
                        color={"secondary"}
                        size="sm"
                      >
                        <Check size={14} />
                        <span className='ml-2'>Evaluate</span>
                      </Button>

                      <Button
                        onClick={(e) => toggleFlagChat(q.questionId, sub.subQuestionId, e)}
                        size="sm"
                        className='p-2'
                        color={"red"}
                        aria-pressed={openChatKeys.has(subKey)}
                      >
                        <Flag size={14} />
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3 mb-3">
                      <strong>Marks Obtained:</strong>
                      <input type="text" className="p-2 text-[16px]" value={sub.score ?? ''} readOnly />
                    </div>

                    {openChatKeys.has(subKey) && (
                      <ChatBox
                        studentRemark={q.studentRemarks ?? ""}
                        professorRemarks={q.professorRemarks ?? ""}
                      />
                    )}

                    {sub.rubric && <div><strong>Rubric:</strong> {sub.rubric}</div>}
                    {sub.studentAnswerContent && (
                      <div>
                        <strong className="block text-gray-700 font-semibold mb-2">Answer:</strong>
                        <textarea
                          className="w-full border resize-none border-gray-200 !bg-white rounded-md p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          rows={5}
                          value={sub.studentAnswerContent.replace(/\\n/g, '\n')}
                          disabled
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
