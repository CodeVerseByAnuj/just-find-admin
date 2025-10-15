import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/app/components/shadcn-ui/Default-Ui/accordion";
import { Button } from 'flowbite-react';
import { Flag } from 'lucide-react';
import AnswerSection from './AnswerSection';
import PartialMarksSection from '../../exam-results/components/PartialMarksSection';
import AIRemarksSection from './AIRemarksSection'; // ensure path resolution
import ChatBox from '../../UI/ChatBox';

interface SubQuestion {
    subQuestionId: number;
    subQuestionNumber: string;
    subQuestionText: string;
    maxMarks: number;
    score: number;
    rubric?: string;
    studentAnswerContent?: string;
    studentAnswerURL?: string;
    questionType?: string;
    compilerCode?: string;
    studentFlag: boolean;
    aiFlag: boolean;
    partialMarks?: {
        scores?: Array<{
            instruction_label?: string;
            instruction?: string;
        }>;
    };
    examMarkId?: number;
}

interface SubQuestionItemProps {
    subQuestion: SubQuestion;
    parentQuestionId: number;
    isSubChatOpen: boolean;
    onFlagClick: (e: React.MouseEvent) => void;
    stripHtml: (html: string) => string;
    subPartialMarksData: Record<string, number>;
    onSubPartialMarkChange: (step: string, value: string) => void;
    onSaveSubQuestion: () => void;
    studentRemarks?: string;
    professorRemarks?: string;
    aiInsights?: string;
}

const SubQuestionItem: React.FC<SubQuestionItemProps> = ({
    subQuestion,
    parentQuestionId,
    isSubChatOpen,
    onFlagClick,
    stripHtml,
    subPartialMarksData,
    onSubPartialMarkChange,
    onSaveSubQuestion,
    studentRemarks,
    professorRemarks,
    aiInsights
}) => {
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
                            {stripHtml(subQuestion.subQuestionText)}
                            <span className="ml-2 text-sm font-bold">
                                <span className="flex justify-end text-[10px]"> Max: {subQuestion.maxMarks} marks</span>
                            </span>
                        </>
                    ) : (
                        <span className="text-red-600">Sub-question data incomplete</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {(subQuestion.studentFlag || subQuestion.aiFlag) && (
                        <Button
                            onClick={onFlagClick}
                            size="sm"
                            className='p-2'
                            color="red"
                            aria-pressed={isSubChatOpen}
                        >
                            <Flag size={14} />
                        </Button>
                    )}
                </div>
            </AccordionTrigger>

            <AccordionContent>
                <AnswerSection
                    rubric={subQuestion.rubric}
                    studentAnswerContent={subQuestion.studentAnswerContent}
                    studentAnswerURL={subQuestion.studentAnswerURL}
                    questionType={subQuestion.questionType}
                    compilerCode={subQuestion.compilerCode}
                />

                <div className="rounded-md border border-gray-200 bg-white p-4 py-6 flex gap-6">
                    <PartialMarksSection
                        question={{
                            id: subQuestion.subQuestionId,
                            maxMarks: subQuestion.maxMarks,
                            score: subQuestion.score,
                            aiInsights: aiInsights ?? null,
                            examMarkId: subQuestion.examMarkId ?? null
                        }}
                        scores={{ [`sub-${subQuestion.subQuestionId}`]: subQuestion.score }}
                        partialMarks={subQuestion.partialMarks || {}}
                        onPartialMarksChange={onSubPartialMarkChange}
                        onSavePartialMarks={onSaveSubQuestion}
                        scoreKey={`sub-${subQuestion.subQuestionId}`}
                    />
                    <AIRemarksSection aiInsights={aiInsights} />
                </div>

                {(subQuestion.studentFlag || subQuestion.aiFlag) && isSubChatOpen && (
                    <ChatBox
                        studentRemark={studentRemarks?.replace(/\\n/g, '\n') ?? ""}
                        professorRemarks={professorRemarks?.replace(/\\n/g, '\n') ?? ""}
                    />
                )}
            </AccordionContent>
        </AccordionItem>
    );
};

export default SubQuestionItem;