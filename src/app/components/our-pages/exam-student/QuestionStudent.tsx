"use client";

import React, { useState } from "react";
import TitleCard from '../../shared/TitleBorderCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/shadcn-ui/Default-Ui/accordion";
import { fetchStudentExamMarks } from '@/app/router/examStudent.router';
import { raiseExamFlag } from "@/app/router/examStudent.router";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { StudentExamResponse, SubQuestion } from '@/lib/schemas/examStudent.schema';
import { Flag } from 'lucide-react';
import { Button, Label, Modal, ModalBody, ModalHeader } from 'flowbite-react';
import ChatBox from "../UI/ChatBox";
import { ZodError } from "zod";
import { studentFlagSchema } from "@/lib/schemas/examStudent.schema";

function QuestionStudent() {
    const params = useParams();
    const examId = Number(params.slug);

    const { data: studentData, isLoading, error, refetch } = useQuery<StudentExamResponse["data"]>({
        queryKey: ['studentData', examId],
        queryFn: () => fetchStudentExamMarks(examId),
    });

    // Flag modal state
    const [activeQuestion, setActiveQuestion] = useState<{ type: 'question' | 'sub'; examStudentMarks_id: number } | null>(null);
    const [openFlag, setOpenFlag] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [instructionModal, setInstructionModal] = useState<{ open: boolean, instruction?: string }>({
        open: false,
    });



    const stripHtml = (html: string | null | undefined) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    const openFlagModal = (examStudentMarks_id: number, type: 'question' | 'sub', e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        setActiveQuestion({ type, examStudentMarks_id });
        setOpenFlag(true);
    };

    const handleSubmitFlag = async () => {
        if (!activeQuestion) return;

        try {
            setValidationError(null);

            const parsed = studentFlagSchema.parse({
                examStudentMarks_id: activeQuestion.examStudentMarks_id,
                student_remarks: typeof flagReason === "string" ? flagReason.trim() : flagReason,
            });

            setLoading(true);
            await raiseExamFlag(parsed);
            setFlagReason("");
            setOpenFlag(false);
            refetch();
        } catch (err: any) {
            if (err instanceof ZodError) {
                const flat = err.flatten();
                const firstField = Object.keys(flat.fieldErrors)[0];
                const friendly =
                    (firstField && flat.fieldErrors[firstField]?.[0]) ||
                    err.errors?.[0]?.message ||
                    "Invalid input";
                console.error("Validation error:", err.errors);
                setValidationError(friendly);
                return;
            }

            console.error("Error submitting flag", err);
        } finally {
            setLoading(false);
        }
    };


    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching student data</div>;

    // Build default expanded values using actual ids from schema
    const allQuestionValues = studentData?.StudentMarks?.map(q => `question-${q.id}`) || [];
    const allSubQuestionValues: { [key: number]: string[] } = {};
    studentData?.StudentMarks?.forEach(q => {
        if (Array.isArray(q.subQuestions) && q.subQuestions.length > 0) {
            allSubQuestionValues[q.id] = q.subQuestions.map(sub => `sub-${sub.subQuestionId ?? sub.examMarkId ?? sub.subQuestionId}`);
        }
    });

    return (
        <>
            <TitleCard title={`${studentData?.courseDetails?.code ?? ""} - ${studentData?.courseDetails?.title ?? ""}`}>
                <div className='mb-2'>
                    <strong>Roll Number:</strong> {studentData?.StudentDetails?.roll_number ?? 'N/A'} <br />
                    <strong>Name:</strong> {`${studentData?.StudentDetails?.first_name ?? ''} ${studentData?.StudentDetails?.middle_name ?? ""} ${studentData?.StudentDetails?.last_name ?? ''}`}
                </div>

                <div className="bg-white rounded-tw dark:bg-darkgray">
                    {(studentData?.StudentMarks && studentData.StudentMarks.length > 0) ? (
                        <Accordion type="multiple" defaultValue={allQuestionValues} className="w-full">
                            {studentData.StudentMarks.map((q) => (
                                <AccordionItem key={q.id} value={`question-${q.id}`} className="bg-white dark:bg-dark mb-4 border-0">
                                    <AccordionTrigger className='bg-blue-100 text-[16px] !p-3 rounded-xl mb-3 flex items-start justify-between gap-3 accordion-trigger'>
                                        <div className="flex-1 text-left">
                                            <div>
                                                {q.questionNumber}
                                                {q.questionText && q.maxMarks ? ` (Max: ${q.maxMarks})` : ''}
                                            </div>
                                            {q.questionText && (
                                                <div className="mt-2 space-y-1">
                                                    {stripHtml(q.questionText).split('\n').map((line, idx) => (
                                                        <div key={idx} className="text-sm text-gray-700">{line}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {q.studentFlag ? (
                                                <span className="px-3 py-1 text-sm font-medium text-white bg-orange-500 rounded-md">
                                                    Flagged
                                                </span>
                                            ) : q.professorRemark ? (
                                                <span className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md">
                                                    Resolved
                                                </span>
                                            ) : q.questionText ? (
                                                <Button
                                                    onClick={(e) => {
                                                        const examStudentMarksId = q.examMarkId ?? q.id;
                                                        openFlagModal(examStudentMarksId, "question", e);
                                                    }}
                                                    size="sm"
                                                    className="p-2"
                                                    color="red"
                                                >
                                                    <Flag size={16} />
                                                </Button>
                                            ) : null}
                                        </div>

                                    </AccordionTrigger>

                                    <AccordionContent className='!p-3 bg-gray-100 rounded-xl'>
                                        <div className="flex flex-col gap-3 mb-3">
                                            <strong>Marks Obtained:</strong>
                                            <input type="text" className="p-2 text-[16px]" value={q.score ?? q.marksObtained ?? ''} readOnly />
                                        </div>

                                        {Boolean(q.studentFlag) && (
                                            <ChatBox
                                                studentRemark={q.studentRemark ?? ""}
                                                professorRemarks={q.professorRemark ?? ""}
                                            />
                                        )}

                                        {/* {q.rubric && <div><strong>Rubric:</strong> {q.rubric}</div>} */}

                                        {q.studentAnswer && (
                                            <div className="space-y-4">
                                                <div>
                                                    <strong className="block text-gray-700 font-semibold mb-2">Answer:</strong>
                                                    <textarea
                                                        className="w-full border resize-none border-gray-200 !bg-white rounded-md p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                        rows={5}
                                                        value={(q.studentAnswer ?? '').replace(/\\n/g, '\n')}
                                                        disabled
                                                    />
                                                </div>

                                                <div className="rounded-md border border-gray-200 bg-white p-4 py-6 flex gap-6">
                                                    <div className="flex-1 bg-gray-100 p-2 rounded-md">
                                                        <h4 className="text-gray-800 font-semibold mb-3">Partial Marks</h4>
                                                        <div className="space-y-2">
                                                            {Array.isArray(q.partialMarks?.scores) && q.partialMarks.scores.length > 0 ? (
                                                                q.partialMarks.scores.map((step, idx) => (

                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="flex gap-2 items-center">
                                                                            <span className="font-medium text-gray-700">Score</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setInstructionModal({ open: true, instruction: step.instruction ?? undefined })}
                                                                                className="cursor-pointer inline-flex items-center justify-center w-5 h-5 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                title="Click to view instruction"
                                                                            >
                                                                                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                type="number"
                                                                                min={0}
                                                                                value={step.score === 0 ? '' : (step.score ?? '')}
                                                                                max={step?.marks ?? undefined}
                                                                                readOnly
                                                                                placeholder="0"
                                                                            />
                                                                            <span className="font-medium text-gray-500 text-xs">/ {step?.marks}</span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm text-gray-500 ps-1">No partial marks available.</div>
                                                            )}
                                                            {/* Totals */}
                                                            {q.partialMarks && (
                                                                <div className="mt-2 text-sm">
                                                                    <div><strong>Total:</strong> {q.partialMarks.total_score} / {q.partialMarks.total_max}</div>
                                                                    {/* <div><strong>Grade:</strong> {q.partialMarks.grade_letter} ({Math.round(q.partialMarks.grade_percentage ?? 0)}%)</div> */}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 bg-gray-100 p-2 rounded-md">
                                                        <h4 className="text-gray-800 font-semibold mb-3">AI Remarks</h4>
                                                        <div className="space-y-2">
                                                            {q.aiInsights ? (
                                                                q.aiInsights.split('\n').map((line, idx) => (
                                                                    <p key={idx} className="text-gray-700">{line}</p>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500">No AI insights available.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {q.subQuestions && q.subQuestions.length > 0 && (
                                            <Accordion type="multiple" defaultValue={allSubQuestionValues[q.id] || []} className="w-full mt-4">
                                                {q.subQuestions.map((sub: SubQuestion) => {
                                                    const subKey = sub.subQuestionId ?? sub.examMarkId ?? Math.random();
                                                    return (
                                                        <AccordionItem key={subKey} value={`sub-${subKey}`} className=" dark:bg-dark">
                                                            <AccordionTrigger className='bg-primary-100 text-[16px] !p-3 rounded-xl mb-3 flex items-start justify-between gap-3 accordion-trigger'>
                                                                <div className="flex-1 text-left">
                                                                    <div>
                                                                        {sub.subQuestionNumber && `${sub.subQuestionNumber}: `}
                                                                        {sub.maxMarks && `(Max: ${sub.maxMarks})`}
                                                                    </div>
                                                                    {sub.subQuestionText && (
                                                                        <div className="mt-2 space-y-1">
                                                                            {stripHtml(sub.subQuestionText).split('\n').map((line, idx) => (
                                                                                <div key={idx} className="text-sm text-gray-700">{line}</div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {sub.studentFlag ? (
                                                                        <span className="px-3 py-1 text-sm font-medium text-white bg-orange-500 rounded-md">
                                                                            Flagged
                                                                        </span>
                                                                    ) : (
                                                                        <Button
                                                                            onClick={(e) => {
                                                                                const examStudentMarksId = sub.examMarkId ?? sub.subQuestionId ?? subKey;
                                                                                openFlagModal(examStudentMarksId, 'sub', e);
                                                                            }}
                                                                            size="sm"
                                                                            className='p-2'
                                                                            color="red"
                                                                        >
                                                                            <Flag size={14} />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="flex flex-col gap-3 mb-3">
                                                                    <strong>Marks Obtained:</strong>
                                                                    <input type="text" className="p-2 text-[16px]" value={sub.score ?? sub.marksObtained ?? ''} readOnly />
                                                                </div>

                                                                {Boolean(sub.studentFlag) && (
                                                                    <ChatBox
                                                                        studentRemark={sub.studentRemark ?? ''}
                                                                        professorRemarks={sub.professorRemark ?? ''}
                                                                    />
                                                                )}

                                                                {/* {sub.rubric && <div><strong>Rubric:</strong> {sub.rubric}</div>} */}
                                                                {sub.studentAnswerContent && (
                                                                    <div>
                                                                        <strong>Answer:</strong>
                                                                        <textarea
                                                                            rows={5}
                                                                            className="w-full border resize-none border-gray-200 !bg-white rounded-md p-3 text-sm"
                                                                            value={(sub.studentAnswerContent ?? '').replace(/\\n/g, '\n')}
                                                                            disabled
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* show partial marks for sub if available */}
                                                                {/* {sub.partialMarks && (
                                                                    <div className="mt-3">
                                                                        <h5 className="font-medium">Partial Marks</h5>
                                                                        {Array.isArray(sub.partialMarks.scores) && sub.partialMarks.scores.map((s, i) => (
                                                                            <div key={i} className="flex justify-between text-sm py-1">
                                                                                <div>{s.instruction}</div>
                                                                                <div>{`${s.score} / ${s.marks}`}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )} */}
                                                                <div className="space-y-4 ">
                                                                    <h5 className="font-semibold ps-1 mt-4">Partial Marks</h5>
                                                                    <div className="bg-white rounded-md p-3">
                                                                        {Array.isArray(sub.partialMarks?.scores) && sub.partialMarks.scores.length > 0 ? (
                                                                            sub.partialMarks.scores.map((step, idx) => (
                                                                                <div className="flex items-center justify-between mt-2">
                                                                                    <div className="flex gap-2 items-center ">
                                                                                        <span className="font-medium text-gray-700">Score</span>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setInstructionModal({ open: true, instruction: step.instruction ?? undefined })}
                                                                                            className="cursor-pointer inline-flex items-center justify-center w-5 h-5 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                            title="Click to view instruction"
                                                                                        >
                                                                                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                                                            </svg>
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <input
                                                                                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                            type="number"
                                                                                            min={0}
                                                                                            value={step.score === 0 ? '' : (step.score ?? '')}
                                                                                            max={step?.marks ?? undefined}
                                                                                            readOnly
                                                                                            placeholder="0"
                                                                                        />
                                                                                        <span className="font-medium text-gray-500 text-xs">/ {step?.marks}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="text-sm text-gray-500 ps-1">No partial marks available.</div>
                                                                        )}
                                                                    </div>
                                                                    {/* Totals */}
                                                                    {sub.partialMarks && (
                                                                        <div className="mt-2 text-sm ps-1">
                                                                            <div><strong>Total:</strong> {sub.partialMarks.total_score} / {sub.partialMarks.total_max}</div>
                                                                            {/* <div><strong>Grade:</strong> {sub.partialMarks.grade_letter} ({Math.round(sub.partialMarks.grade_percentage ?? 0)}%)</div> */}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    );
                                                })}
                                            </Accordion>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-300">No questions available.</div>
                    )}
                </div>
            </TitleCard>

            {/* Flag Modal */}
            <Modal show={openFlag} size='md' onClose={() => setOpenFlag(false)} popup>
                <ModalHeader className="px-6 py-3">
                    {`Flag ${activeQuestion?.type === 'sub' ? 'Sub-question' : 'Question'}`}
                </ModalHeader>
                <ModalBody>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='reason' className='mb-2'>Reason <span className="text-red-500">*</span></Label>
                            <textarea
                                id='reason'
                                value={flagReason}
                                onChange={(e) => setFlagReason(e.target.value)}
                                className='mt-1 w-full rounded-md border px-3 py-2'
                                rows={4}
                                placeholder='Why are you flagging this answer?'
                            />
                            {validationError && <p className='text-red-500 text-sm'>{validationError}</p>}
                        </div>
                        <div className='flex justify-end gap-2'>
                            <Button color='gray' onClick={() => setOpenFlag(false)}>Cancel</Button>
                            <Button color='primary' onClick={handleSubmitFlag} disabled={loading}>
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
            {/* Instruction Modal */}
            <Modal show={instructionModal.open} onClose={() => setInstructionModal({ open: false, instruction: "" })}>
                <ModalHeader>
                    Instruction Details
                </ModalHeader>
                <ModalBody>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Marking Instruction:</h4>
                        <div className="space-y-2">
                            {instructionModal.instruction ? (
                                instructionModal.instruction.split('\n').map((line, idx) => (
                                    <p key={idx} className="text-gray-700 leading-relaxed">{line}</p>
                                ))
                            ) : (
                                <p className="text-gray-500">No instruction available.</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setInstructionModal({ open: false, instruction: "" })}>
                            Close
                        </Button>
                    </div>
                </ModalBody>
            </Modal>

        </>
    );
}

export default QuestionStudent;
