"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import { Button, Textarea, Modal, ModalBody, ModalHeader, Tooltip } from 'flowbite-react';
import Link from 'next/link';
import TitleCard from '../../shared/TitleBorderCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/shadcn-ui/Default-Ui/accordion";
import ChatBox from "../UI/ChatBox";
import RemarkModal from "./grid/RemarkModal";
import { fetchStudentExamMarks, partialMarks } from '@/app/router/examProfessor.router';

// Types
import { StudentExamResponse, SubQuestion, Question } from "@/lib/schemas/examProfessor.schema";
import Compiler from "../comiler/Compiler";

// Types for component state

interface PartialMark {
    marks: number;
    score: number;
    instruction: string;
    instruction_label: string | null;
}

interface PartialMarksState {
    [questionId: number]: Record<string, PartialMark[]>;
}

interface SubPartialMarksState {
    [subQuestionId: number]: Record<string, number>;
}

function QuestionProfessor() {
    // URL parameters
    const params = useParams();
    const examId = Number(params.slug);
    const studentId = Number(params.innerSlug);

    const queryClient = useQueryClient();

    // Data fetching
    const { data: studentData, isLoading, error } = useQuery<StudentExamResponse>({
        queryKey: ['studentData', examId, studentId],
        queryFn: () => fetchStudentExamMarks(examId, studentId),
    });

    // UI State
    const [openChatKeys, setOpenChatKeys] = useState<Set<string>>(new Set());
    // Controlled accordion states to prevent unintended mass-closing
    const [openQuestionAccordions, setOpenQuestionAccordions] = useState<string[]>([]);
    const [openSubAccordions, setOpenSubAccordions] = useState<Record<number, string[]>>({});


    // Partial marks state
    const [partialMarksState, setPartialMarksState] = useState<PartialMarksState>({});
    const [subPartialMarksState, setSubPartialMarksState] = useState<SubPartialMarksState>({});

    // RemarkModal state
    const [remarkModalOpen, setRemarkModalOpen] = useState(false); // still kept if needed later
    const [remarkModalData, setRemarkModalData] = useState<{
        examStudentMarks_id: number;
        partialMarks: Record<string, number>;
    } | undefined>(undefined);

    // Saving state for partial marks (question & sub-question)
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

    const [instructionModal, setInstructionModal] = useState<{ open: boolean, instruction?: string }>({
        open: false,
    });

    // Initialize state when data loads
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!studentData?.StudentMarks) return;
        // Avoid re-initializing after first successful load to preserve user edits / optimistic updates
        if (initializedRef.current) return;

        const initialChatKeys = new Set<string>();
        const initialPartialMarks: PartialMarksState = {};
        const initialSubPartialMarks: SubPartialMarksState = {};

        studentData.StudentMarks.forEach(question => {
            // Question chat
            initialChatKeys.add(`q-${question.questionId}`);

            // Question partial marks - handle different formats from API
            initialPartialMarks[question.questionId] = {};
            if (question.partialMarks && typeof question.partialMarks === 'object') {
                // If it's the new format with scores array
                if ('scores' in question.partialMarks && Array.isArray(question.partialMarks.scores)) {
                    initialPartialMarks[question.questionId]['step1'] = question.partialMarks.scores.map((score: any) => ({
                        marks: score.marks,
                        score: score.score,
                        instruction: score.instruction,
                        instruction_label: score.instruction_label,
                    }));
                }
                // If it's the old Record<string, number> format, convert it
                else if (!('scores' in question.partialMarks)) {
                    const oldFormat = question.partialMarks as any;
                    Object.entries(oldFormat).forEach(([key, value]) => {
                        // Derive instruction & label for legacy (Record<string, number|string>) partial marks format
                        const numericValue = typeof value === 'number' ? value : 0;
                        const derivedInstructionLabel = key; // use the key (e.g., step name) as label
                        const derivedInstruction = typeof value === 'string'
                            ? value // if legacy stored a string, treat it as the instruction text
                            : `Marks allocated for ${key}`; // fallback descriptive instruction

                        initialPartialMarks[question.questionId][key] = [{
                            marks: numericValue,
                            score: numericValue,
                            instruction: derivedInstruction,
                            instruction_label: derivedInstructionLabel,
                        }];
                    });
                }
            }

            // Sub-questions
            question.subQuestions.forEach(sub => {
                initialChatKeys.add(`q-${question.questionId}-s-${sub.subQuestionId}`);

                // Sub-question partial marks
                initialSubPartialMarks[sub.subQuestionId] = {};
                if (sub.partialMarks && typeof sub.partialMarks === 'object') {
                    // If it's the new format with scores array
                    if ('scores' in sub.partialMarks && Array.isArray(sub.partialMarks.scores)) {
                        sub.partialMarks.scores.forEach((score: any, idx: number) => {
                            initialSubPartialMarks[sub.subQuestionId][`step-${idx}`] = score.score || 0;
                        });
                    }
                    // If it's the old Record<string, PartialMark[]> format
                    else if (!('scores' in sub.partialMarks)) {
                        const oldFormat = sub.partialMarks as any;
                        Object.entries(oldFormat).forEach(([key, value]) => {
                            if (typeof value === 'number') {
                                initialSubPartialMarks[sub.subQuestionId][key] = value;
                            }
                        });
                    }
                }
            });
        });

        setOpenChatKeys(initialChatKeys);
        setPartialMarksState(initialPartialMarks);
        setSubPartialMarksState(initialSubPartialMarks);
        initializedRef.current = true;

        // Initialize accordions to open by default (can be adjusted). Only do this once.
        const questionVals = studentData.StudentMarks.map(q => `question-${q.questionId}`);
        setOpenQuestionAccordions(questionVals);
        const subMap: Record<number, string[]> = {};
        studentData.StudentMarks.forEach(q => {
            if (q.subQuestions?.length) {
                subMap[q.questionId] = q.subQuestions.map(sq => `sub-${sq.subQuestionId}`);
            }
        });
        setOpenSubAccordions(subMap);
    }, [studentData]);


    // Utility functions
    const stripHtml = (html: string): string => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const textContent = doc.body.textContent || "";
        // Preserve newlines while stripping HTML
        return textContent.replace(/\\n/g, '\n');
    };

    // Handle main question partial marks change
    const handlePartialMarkChange = (questionId: number, stepKey: string, value: string) => {
        const [step, idxStr] = stepKey.split('-');
        const idx = parseInt(idxStr);
        const numValue = value === '' ? 0 : Number(value);

        setPartialMarksState((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [step]: prev[questionId]?.[step]?.map((mark, i) => {
                    if (i === idx) {
                        const newScore = Math.min(numValue, mark.marks);
                        return { ...mark, score: newScore };
                    }
                    return mark;
                }) || []
            }
        }));
    };

    // Handle sub-question partial marks change
    const handleSubPartialMarkChange = (subId: number, step: string, value: string) => {
        const numValue = Number(value) || 0;
        setSubPartialMarksState((prev) => ({
            ...prev,
            [subId]: {
                ...prev[subId],
                [step]: numValue,
            },
        }));
    };

    const toggleFlagChat = (qId: number, subId?: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        const key = subId ? `q-${qId}-s-${subId}` : `q-${qId}`;
        setOpenChatKeys(prev => {
            const updated = new Set(prev);
            updated.has(key) ? updated.delete(key) : updated.add(key);
            return updated;
        });
    };

    // ----------------------------------------
    // Save Partial Marks Handlers
    // ----------------------------------------
    const handleSaveQuestionPartialMarks = (question: Question) => {
        const partialSteps = partialMarksState[question.questionId] || {};
        const scores: any[] = [];
        Object.values(partialSteps).forEach((arr) => {
            if (Array.isArray(arr)) {
                arr.forEach(mark => {
                    scores.push({
                        marks: mark.marks || 0,
                        score: mark.score || 0,
                        instruction: mark.instruction || '',
                        instruction_label: mark.instruction_label || mark.instruction || '',
                    });
                });
            }
        });
        // Optimistically update cache so new values persist immediately
        try {
            const total = scores.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
            queryClient.setQueryData(['studentData', examId, studentId], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    StudentMarks: (oldData.StudentMarks || []).map((q: any) =>
                        q.questionId === question.questionId
                            ? { ...q, score: total, partialMarks: { scores } }
                            : q
                    )
                };
            });
        } catch (e) {
            console.warn('Optimistic update for question failed', e);
        }
        setRemarkModalData({
            examStudentMarks_id: question.examMarkId ?? question.questionId,
            partialMarksJson: { scores }
        } as any);
        setRemarkModalOpen(true);
    };

    const handleSaveSubQuestionPartialMarks = (_question: Question, subQuestion: SubQuestion) => {
        const updatedScores = (subQuestion.partialMarks?.scores || []).map((s, idx) => {
            const stateScore = subPartialMarksState[subQuestion.subQuestionId]?.[`step-${idx}`];
            return {
                marks: s.marks,
                score: stateScore === undefined ? s.score : stateScore,
                instruction: s.instruction,
                instruction_label: s.instruction_label,
            };
        });
        if (updatedScores.length === 0) {
            const stateMap = subPartialMarksState[subQuestion.subQuestionId] || {};
            Object.entries(stateMap).forEach(([stepKey, score]) => {
                updatedScores.push({
                    marks: Number(score) || 0,
                    score: Number(score) || 0,
                    instruction: stepKey,
                    instruction_label: stepKey,
                });
            });
        }
        // Optimistic update for sub-question
        try {
            const total = updatedScores.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
            queryClient.setQueryData(['studentData', examId, studentId], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    StudentMarks: (oldData.StudentMarks || []).map((q: any) => {
                        if (q.questionId !== _question.questionId) return q;
                        return {
                            ...q,
                            subQuestions: (q.subQuestions || []).map((sq: any) =>
                                sq.subQuestionId === subQuestion.subQuestionId
                                    ? { ...sq, score: total, partialMarks: { scores: updatedScores } }
                                    : sq
                            )
                        };
                    })
                };
            });
        } catch (e) {
            console.warn('Optimistic update for sub-question failed', e);
        }
        setRemarkModalData({
            examStudentMarks_id: subQuestion.examMarkId ?? subQuestion.subQuestionId,
            partialMarksJson: { scores: updatedScores }
        } as any);
        setRemarkModalOpen(true);
    };



    // Loading and error states
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching student data</div>;

    // Accordion default values
    const allQuestionValues = studentData?.StudentMarks?.map(q => `question-${q.questionId}`) || [];
    const allSubQuestionValues: Record<number, string[]> = {};
    studentData?.StudentMarks?.forEach(q => {
        if (q.subQuestions.length > 0) {
            allSubQuestionValues[q.questionId] = q.subQuestions.map(sub => `sub-${sub.subQuestionId}`);
        }
    });
    return (
        <>
            <TitleCard title={`${studentData?.courseDetails.code} - ${studentData?.courseDetails.title}`}>
                <div className='mb-2'>
                    <strong>Roll No. :</strong> {studentData?.StudentDetails?.roll_number} <br />
                    <strong>Name:</strong> {`${studentData?.StudentDetails?.first_name} ${studentData?.StudentDetails?.middle_name ?? ''} ${studentData?.StudentDetails?.last_name}`}
                </div>

                <div className="bg-white rounded-tw dark:bg-darkgray">
                    {(studentData?.StudentMarks?.length ?? 0) === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-300">
                            No questions available.
                        </div>
                    ) : (
                        <Accordion
                            type="multiple"
                            value={openQuestionAccordions}
                            onValueChange={(vals) => setOpenQuestionAccordions(vals as string[])}
                            className="w-full"
                        >
                            {(studentData?.StudentMarks ?? []).map((question) => {
                                const questionKey = `q-${question.questionId}`;
                                const isQuestionChatOpen = openChatKeys.has(questionKey);

                                return (
                                    <AccordionItem
                                        key={question.questionId}
                                        value={`question-${question.questionId}`}
                                        className="bg-white dark:bg-dark mb-4 border-0"
                                    >
                                        <AccordionTrigger className='bg-blue-100 text-[16px] !p-3 rounded-xl mb-3 flex items-center justify-between gap-3'>
                                            <div className="flex-1 text-left whitespace-pre-wrap">
                                                <span className="font-semibold">{question.questionNumber}:</span>

                                                {question.questionText && question.maxMarks
                                                    ? <>{stripHtml(question.questionText)}
                                                        <span className="flex justify-end text-[11px]">
                                                            {question.maxMarks && (<> Max: {question.maxMarks} marks</>)}
                                                        </span>
                                                    </>
                                                    : ''}
                                            </div>


                                            <div className="flex items-center gap-2">
                                                {(question.studentFlag || question.aiFlag) && (
                                                    <Button
                                                        onClick={(e) => toggleFlagChat(question.questionId, undefined, e)}
                                                        size="sm"
                                                        color="red"
                                                        className='p-2'
                                                        aria-pressed={isQuestionChatOpen}
                                                    >
                                                        <Flag size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className='!p-3 bg-gray-100 rounded-xl'>

                                            {question.rubric && (
                                                <div><strong>Rubric:</strong>
                                                    <Textarea
                                                        rows={4}
                                                        value={question.rubric?.replace(/\\n/g, '\n')}
                                                        readOnly
                                                    />
                                                </div>
                                            )}


                                            <div className="space-y-4">
                                                {(question.studentAnswerContent || question.studentAnswerURL) && (
                                                    <div>
                                                        <div className="flex justify-between items-end mb-4">

                                                            <span className="text-normal font-semibold">Answer:</span>
                                                            {question.studentAnswerURL &&
                                                                <div className="flex items-center gap-2">
                                                                    <Link target="_blank" href={`${question.studentAnswerURL}`}>
                                                                        <Button className="">Download PDF</Button>
                                                                    </Link>
                                                                </div>
                                                            }
                                                            {
                                                                // Compiler Component for code questions
                                                                question.questionType === 'code' && (
                                                                    <Compiler language_id={50} stdin="" source_code={question.compilerCode ?? ""} />
                                                                )
                                                            }

                                                        </div>
                                                        <textarea
                                                            className="w-full border resize-none border-gray-200 !bg-white rounded-md p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            rows={5}
                                                            value={question.studentAnswerContent?.replace(/\\n/g, '\n')}
                                                            disabled
                                                        />
                                                    </div>
                                                )}

                                                {question.questionNumber && question.questionText && question.maxMarks && <div>
                                                    {(question.score !== undefined && question.score !== null) ||
                                                        Object.keys(partialMarksState[question.questionId] || {}).length > 0 ||
                                                        question.aiInsights ? (
                                                        <div className="rounded-md border border-gray-200 bg-white p-4 py-6 flex gap-6">
                                                            <div className="flex-1 bg-gray-100 p-2 rounded-md">
                                                                <div className="flex justify-between items-center">
                                                                    <strong>Marks Obtained:</strong>
                                                                    <input
                                                                        type="text"
                                                                        className="p-2 w-24 text-right rounded border border-gray-200 bg-white"
                                                                        value={question.score}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <h4 className="text-gray-800 font-semibold mb-3">Partial Marks</h4>
                                                                <div className="space-y-2">
                                                                    {Object.keys(partialMarksState[question.questionId] || {}).length === 0 ? (
                                                                        <div className="text-sm text-gray-500">
                                                                            No partial mark steps defined.
                                                                        </div>
                                                                    ) : (
                                                                        Object.entries(partialMarksState[question.questionId] || {}).map(([step, marksArr]) =>
                                                                            (Array.isArray(marksArr) ? marksArr : []).map((mark, idx) => (
                                                                                <div
                                                                                    key={`${step}-${idx}`}
                                                                                    className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm hover:bg-blue-50 transition-colors duration-200"
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="font-medium text-gray-700">{mark.instruction_label}</span>
                                                                                        <Tooltip content={
                                                                                            <div className="max-w-xs break-words p-2 radius-sm">
                                                                                                {mark.instruction}
                                                                                            </div>
                                                                                        } trigger="hover"><span>
                                                                                                <svg
                                                                                                    className="w-4 h-4 text-primary"
                                                                                                    fill="currentColor"
                                                                                                    viewBox="0 0 24 24"
                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                >
                                                                                                    <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                                                                                </svg>

                                                                                            </span>
                                                                                        </Tooltip>

                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <input
                                                                                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                            type="number"
                                                                                            min={0}
                                                                                            // Mirror sub-question behavior: show blank when 0
                                                                                            value={mark.score === 0 ? '' : mark.score}
                                                                                            max={mark.marks}
                                                                                            onChange={(e) => handlePartialMarkChange(question.questionId, `${step}-${idx}`, e.target.value)}
                                                                                            placeholder="0"
                                                                                        />
                                                                                        <span className="font-medium text-gray-500 text-xs">/ {mark.marks}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        )
                                                                    )}
                                                                    <div className="flex justify-end">
                                                                        <Button
                                                                            className="relative z-9"
                                                                            onClick={() => handleSaveQuestionPartialMarks(question)}
                                                                            size="sm"
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                            </div>

                                                            {question.aiInsights && (
                                                                <div className="flex-1 bg-gray-100 p-2 rounded-md">
                                                                    <h4 className="text-gray-800 font-semibold mb-3">AI Remarks</h4>
                                                                    <div className="space-y-2">
                                                                        <p className="whitespace-pre-wrap">{question.aiInsights?.replace(/\\n/g, '\n')}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                    ) : null}
                                                    {(question.studentFlag || question.aiFlag) && <div>
                                                        {isQuestionChatOpen && (
                                                            <ChatBox
                                                                studentRemark={question.studentRemarks?.replace(/\\n/g, '\n') ?? ""}
                                                                professorRemarks={question.professorRemarks?.replace(/\\n/g, '\n') ?? ""}
                                                            />
                                                        )}
                                                    </div>
                                                    }
                                                </div>}
                                            </div>


                                            {question.subQuestions.length > 0 && (
                                                <Accordion
                                                    type="multiple"
                                                    value={openSubAccordions[question.questionId] || []}
                                                    onValueChange={(vals) => setOpenSubAccordions(prev => ({ ...prev, [question.questionId]: vals as string[] }))}
                                                    className="w-full mt-4"
                                                >
                                                    {question.subQuestions.map((subQuestion: SubQuestion) => {
                                                        const subKey = `q-${question.questionId}-s-${subQuestion.subQuestionId}`;
                                                        const isSubChatOpen = openChatKeys.has(subKey);

                                                        return (
                                                            <AccordionItem
                                                                key={subQuestion.subQuestionId}
                                                                value={`sub-${subQuestion.subQuestionId}`}
                                                                className="dark:bg-dark"
                                                            >
                                                                <AccordionTrigger className='bg-blue-100 text-[16px] !p-3 rounded-xl mb-3 flex items-center justify-between gap-3'>
                                                                    <div className="flex-1 text-left whitespace-pre-wrap">
                                                                        {subQuestion.subQuestionNumber && subQuestion.subQuestionText && subQuestion.maxMarks ? (
                                                                            <>
                                                                                <span>{subQuestion.subQuestionNumber}</span>:
                                                                                {stripHtml(subQuestion.subQuestionText)}                                                                                                                                                                <span className="ml-2 text-sm font-bold">
                                                                                    {subQuestion.maxMarks && (<span className="flex justify-end text-[10px]"> Max: {subQuestion.maxMarks} marks</span>)}
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-red-600">Sub-question data incomplete</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">

                                                                        {(subQuestion.studentFlag || subQuestion.aiFlag) && <Button
                                                                            onClick={(e) => toggleFlagChat(question.questionId, subQuestion.subQuestionId, e)}
                                                                            size="sm"
                                                                            className='p-2'
                                                                            color="red"
                                                                            aria-pressed={isSubChatOpen}
                                                                        >
                                                                            <Flag size={14} />
                                                                        </Button>}

                                                                    </div>
                                                                </AccordionTrigger>

                                                                <AccordionContent>

                                                                    {subQuestion.rubric && (
                                                                        <div><strong>Rubric:</strong> <span className="whitespace-pre-wrap">{subQuestion.rubric?.replace(/\\n/g, '\n')}</span></div>
                                                                    )}                                                                    {subQuestion.studentAnswerContent && (
                                                                        <div>

                                                                            <div className="flex justify-between items-end mb-4">
                                                                                <span className="text-normal font-semibold">Answer:</span>

                                                                                <div className="flex items-center gap-2">
                                                                                    {subQuestion.studentAnswerURL && (
                                                                                        <Link target="_blank" href={`${subQuestion.studentAnswerURL}`}>
                                                                                            <Button className="">Download PDF</Button>
                                                                                        </Link>
                                                                                    )}
                                                                                    {
                                                                                        subQuestion.questionType === 'code' && (
                                                                                            <Compiler language_id={50} stdin="" source_code={subQuestion.compilerCode ?? ""} />
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            </div>

                                                                            <textarea
                                                                                className="w-full border resize-none border-gray-200 !bg-white rounded-md p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                                                rows={5}
                                                                                value={subQuestion.studentAnswerContent.replace(/\\n/g, '\n')}
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    <div className="rounded-md border border-gray-200 bg-white p-4 py-6 flex gap-6">
                                                                        <div className="flex-1 bg-gray-100 p-2 rounded-md">
                                                                            <div className="flex justify-between items-center">
                                                                                <strong>Marks Obtained:</strong>
                                                                                <input
                                                                                    type="text"
                                                                                    className="p-2 w-24 text-right rounded border border-gray-200 bg-white"
                                                                                    value={subQuestion.score}
                                                                                    readOnly
                                                                                />
                                                                            </div>
                                                                            <h4 className="text-gray-800 font-semibold mb-3">Partial Marks</h4>
                                                                            <div className="space-y-2">
                                                                                {Object.entries(subPartialMarksState[subQuestion.subQuestionId] ?? {}).length === 0 ? (
                                                                                    <div className="text-sm text-gray-500">
                                                                                        No partial mark steps defined.
                                                                                    </div>
                                                                                ) : (
                                                                                    Object.entries(subPartialMarksState[subQuestion.subQuestionId] ?? {}).map(([step], index) => (
                                                                                        <div
                                                                                            key={step}
                                                                                            className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm hover:bg-blue-50 transition-colors duration-200"
                                                                                        >
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="font-medium text-gray-700">
                                                                                                    {subQuestion.partialMarks?.scores?.[index]?.instruction_label || `Step-${index}`}
                                                                                                </span>
                                                                                                <Tooltip content={
                                                                                                    <div className="max-w-xs break-words p-2 radius-sm">
                                                                                                        {subQuestion.partialMarks?.scores?.[index]?.instruction || "No instruction available"}
                                                                                                    </div>
                                                                                                } trigger="hover"><span>
                                                                                                        <svg
                                                                                                            className="w-4 h-4 text-primary"
                                                                                                            fill="currentColor"
                                                                                                            viewBox="0 0 24 24"
                                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                                        >
                                                                                                            <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                                                                                        </svg>

                                                                                                    </span>
                                                                                                </Tooltip>

                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <input
                                                                                                    className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                    type="number"
                                                                                                    min={0}
                                                                                                    value={subPartialMarksState[subQuestion.subQuestionId]?.[step] === 0 ? '' : subPartialMarksState[subQuestion.subQuestionId]?.[step]}
                                                                                                    max={subQuestion.maxMarks}
                                                                                                    onChange={(e) => handleSubPartialMarkChange(subQuestion.subQuestionId, step, e.target.value)}
                                                                                                    placeholder="0"
                                                                                                />
                                                                                                <span className="font-medium text-gray-500 text-xs">/ {subQuestion.maxMarks}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))
                                                                                )}
                                                                            </div>

                                                                            <div className="flex justify-end">
                                                                                <Button
                                                                                    onClick={() => handleSaveSubQuestionPartialMarks(question, subQuestion)}
                                                                                    size="sm"
                                                                                >
                                                                                    Save
                                                                                </Button>
                                                                            </div>

                                                                        </div>

                                                                        <div className="flex-1 bg-gray-100 p-2 rounded-md">
                                                                            <h4 className="text-gray-800 font-semibold mb-3">AI Remarks</h4>
                                                                            <div className="space-y-2">
                                                                                <p className="whitespace-pre-wrap">{(question.aiInsights || "No AI Insights Available")?.replace(/\\n/g, '\n')}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {(subQuestion.studentFlag || subQuestion.aiFlag) && isSubChatOpen && (
                                                                        <ChatBox
                                                                            studentRemark={question.studentRemarks?.replace(/\\n/g, '\n') ?? ""}
                                                                            professorRemarks={question.professorRemarks?.replace(/\\n/g, '\n') ?? ""}
                                                                        />
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
                            })}
                        </Accordion>
                    )}
                </div>
            </TitleCard>

            <RemarkModal
                show={remarkModalOpen}
                onClose={() => setRemarkModalOpen(false)}
                remarkModalData={remarkModalData}
                onSuccess={() => {
                    // Refetch data after successful save
                    queryClient.invalidateQueries({
                        queryKey: ['studentData', examId, studentId]
                    });
                }}
            />
            {/* Instruction Modal */}
            <Modal show={instructionModal.open} onClose={() => setInstructionModal({ open: false, instruction: "" })}>
                <ModalHeader>
                    Instruction Details
                </ModalHeader>
                <ModalBody>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Marking Instruction:</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{instructionModal.instruction?.replace(/\\n/g, '\n')}</p>
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

export default QuestionProfessor;