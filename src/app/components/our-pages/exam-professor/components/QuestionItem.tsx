import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent, Accordion } from "@/app/components/shadcn-ui/Default-Ui/accordion";
import { Button } from 'flowbite-react';
import { Flag } from 'lucide-react';
import AnswerSection from './AnswerSection';
import PartialMarksSection from '../../exam-results/components/PartialMarksSection';
import AIRemarksSection from './AIRemarksSection';
import ChatBox from '../../UI/ChatBox';
import SubQuestionItem from './SubQuestionItem';

interface Question {
    questionId: number;
    questionNumber: string;
    questionText: string;
    maxMarks: number;
    score: number;
    rubric?: string;
    studentAnswerContent?: string;
    studentAnswerURL?: string;
    questionType?: string;
    compilerCode?: string;
    studentFlag: boolean;
    aiFlag: boolean;
    aiInsights?: string;
    studentRemarks?: string;
    professorRemarks?: string;
    examMarkId?: number;
    subQuestions: SubQuestion[];
}

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

interface PartialMark {
    marks: number;
    score: number;
    instruction: string;
    instruction_label: string | null;
}

interface QuestionItemProps {
    question: Question;
    isQuestionChatOpen: boolean;
    onQuestionFlagClick: (e: React.MouseEvent) => void;
    stripHtml: (html: string) => string;
    partialMarksData: Record<string, PartialMark[]>;
    onPartialMarkChange: (stepKey: string, value: string) => void;
    onSaveQuestion: () => void;
    subPartialMarksState: Record<number, Record<string, number>>;
    onSubPartialMarkChange: (subId: number, step: string, value: string) => void;
    onSaveSubQuestion: (subId: number) => void;
    openChatKeys: Set<string>;
    onSubFlagClick: (subId: number, e: React.MouseEvent) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
    question,
    isQuestionChatOpen,
    onQuestionFlagClick,
    stripHtml,
    partialMarksData,
    onPartialMarkChange,
    onSaveQuestion,
    subPartialMarksState,
    onSubPartialMarkChange,
    onSaveSubQuestion,
    openChatKeys,
    onSubFlagClick
}) => {
    const hasMarksOrInsights = (question.score !== undefined && question.score !== null) ||
        Object.keys(partialMarksData).length > 0 ||
        question.aiInsights;

    return (
        <AccordionItem
            key={question.questionId}
            value={`question-${question.questionId}`}
            className="bg-white dark:bg-dark mb-4 border-0"
        >
            <AccordionTrigger className='bg-blue-100 text-[16px] !p-3 rounded-xl mb-3 flex items-center justify-between gap-3'>
                <div className="flex-1 text-left whitespace-pre-wrap">
                    <span className="font-semibold">{question.questionNumber}:</span>
                    {question.questionText && question.maxMarks ? (
                        <>
                            {stripHtml(question.questionText)}
                            <span className="flex justify-end text-[11px]">
                                Max: {question.maxMarks} marks
                            </span>
                        </>
                    ) : ''}
                </div>

                <div className="flex items-center gap-2">
                    {(question.studentFlag || question.aiFlag) && (
                        <Button
                            onClick={onQuestionFlagClick}
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
                <AnswerSection
                    rubric={question.rubric}
                    studentAnswerContent={question.studentAnswerContent}
                    studentAnswerURL={question.studentAnswerURL}
                    questionType={question.questionType}
                    compilerCode={question.compilerCode}
                />

                {question.questionNumber && question.questionText && question.maxMarks && (
                    <div>
                        {hasMarksOrInsights && (
                            <div className="rounded-md border border-gray-200 bg-white p-4 py-6 flex gap-6">
                                <PartialMarksSection
                                    question={{
                                        id: question.questionId,
                                        maxMarks: question.maxMarks,
                                        score: question.score,
                                        aiInsights: question.aiInsights ?? null,
                                        examMarkId: question.examMarkId ?? null
                                    }}
                                    scores={{ [`q-${question.questionId}`]: question.score }}
                                    partialMarks={partialMarksData}
                                    onPartialMarksChange={onPartialMarkChange}
                                    onSavePartialMarks={onSaveQuestion}
                                    scoreKey={`q-${question.questionId}`}
                                />

                                {question.aiInsights && (
                                    <AIRemarksSection aiInsights={question.aiInsights} />
                                )}
                            </div>
                        )}

                        {(question.studentFlag || question.aiFlag) && isQuestionChatOpen && (
                            <div>
                                <ChatBox
                                    studentRemark={question.studentRemarks?.replace(/\\n/g, '\n') ?? ""}
                                    professorRemarks={question.professorRemarks?.replace(/\\n/g, '\n') ?? ""}
                                />
                            </div>
                        )}
                    </div>
                )}

                {question.subQuestions.length > 0 && (
                    <Accordion type="multiple" defaultValue={[]} className="w-full mt-4">
                        {question.subQuestions.map((subQuestion) => {
                            const subKey = `q-${question.questionId}-s-${subQuestion.subQuestionId}`;
                            const isSubChatOpen = openChatKeys.has(subKey);

                            return (
                                <SubQuestionItem
                                    key={subQuestion.subQuestionId}
                                    subQuestion={subQuestion}
                                    parentQuestionId={question.questionId}
                                    isSubChatOpen={isSubChatOpen}
                                    onFlagClick={(e) => onSubFlagClick(subQuestion.subQuestionId, e)}
                                    stripHtml={stripHtml}
                                    subPartialMarksData={subPartialMarksState[subQuestion.subQuestionId] ?? {}}
                                    onSubPartialMarkChange={(step, value) => onSubPartialMarkChange(subQuestion.subQuestionId, step, value)}
                                    onSaveSubQuestion={() => onSaveSubQuestion(subQuestion.subQuestionId)}
                                    studentRemarks={question.studentRemarks}
                                    professorRemarks={question.professorRemarks}
                                    aiInsights={question.aiInsights}
                                />
                            );
                        })}
                    </Accordion>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};

export default QuestionItem;