"use client"
import React, { useState, useEffect } from "react"
import { Modal, ModalHeader, ModalBody } from "flowbite-react"
import { StudentResult, Score } from "@/lib/schemas/examResult.schema"
import { Accordion } from "@/app/components/shadcn-ui/Default-Ui/accordion"
import RemarkModal from "@/app/components/our-pages/exam-professor/grid/RemarkModal"
import MainQuestionAccordion from "./components/MainQuestionAccordion"
import ModalActions from "./components/ModalActions"

interface ExamQuestionModalProps {
  open: boolean
  onClose: () => void
  student: { id: number } | null
  questionIndex: number | null
  score: number | null
  onNext: (payload: { questionId: number; score: number }) => void
  onBack: (payload: { questionId: number; score: number }) => void
  tableData: StudentResult[]
  onRefetch?: () => void // ✅ Add refetch callback
}



export default function ExamQuestionModal({
  open,
  onClose,
  student,
  questionIndex,
  score,
  onNext,
  onBack,
  tableData,
  onRefetch,
}: ExamQuestionModalProps) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [remarkModalOpen, setRemarkModalOpen] = useState(false)
  // Partial value shape accepted by RemarkModal - reuse Score type which allows nulls
  type PartialValueLocal = number | Score;

  const [remarkModalData, setRemarkModalData] = useState<{
    examStudentMarks_id: number;
    // RemarkModal accepts old-number format OR richer objects.
    partialMarks: Record<string, PartialValueLocal>;
  } | undefined>(undefined);

  useEffect(() => {
    if (score !== null && questionIndex !== null && student) {
      const studentData = tableData.find((s) => s.id === student.id)
      const question = studentData?.questions[questionIndex]
      if (question) {
        setScores((prev) => ({
          ...prev,
          [`q-${question.id}`]: score ?? 0,
          ...Object.fromEntries(
            (question.subQuestions || []).map((sq) => [
              `sq-${question.id}-${sq.subQuestionId}`,
              sq.score ?? 0,
            ])
          ),
        }))
      }
    }
  }, [score, questionIndex, student, tableData])

  if (!student || questionIndex === null) return null

  const studentData = tableData.find((s) => s.id === student.id)
  const question = studentData?.questions[questionIndex]

  const [partialMarks, setPartialMarks] = useState<Record<string, Score[]>>({});
  const [subPartialMarks, setSubPartialMarks] = useState<Record<number | string, { scores: Score[] }>>({});

  // input change handle for main question partial marks
  const handleChange = (stepKey: string, value: string) => {
    const [step, idxStr] = stepKey.split('-');
    const idx = parseInt(idxStr);
    // Allow empty string, otherwise convert to number
    const numValue = value === '' ? 0 : Number(value);

    setPartialMarks((prev) => ({
      ...prev,
      [step]: prev[step]?.map((mark, i) => {
        if (i === idx) {
          // Score should not exceed max marks
          const newScore = Math.min(numValue, mark.marks ?? 0);
          return { ...mark, score: newScore };
        }
        return mark;
      }) || []
    }));
  };

  useEffect(() => {
    if (question?.partialMarks) {
      // Handle different partialMarks formats from API
      if (question.partialMarks && typeof question.partialMarks === 'object') {
        // If it's the new format with scores array
        if ('scores' in question.partialMarks && Array.isArray(question.partialMarks.scores)) {
          // Convert scores array to Record<string, PartialMark[]> format
          const converted: Record<string, Score[]> = {
            'step1': question.partialMarks.scores.map((score: any) => ({
              marks: score.marks,
              score: score.score,
              instruction: score.instruction,
              instruction_label: score.instruction_label
            }))
          };
          setPartialMarks(converted);
        }
        // If it's the old Record<string, number> format, convert it
        else if (!('scores' in question.partialMarks)) {
          const oldFormat = question.partialMarks as Record<string, number>;
          const converted: Record<string, Score[]> = {};
          Object.entries(oldFormat).forEach(([key, value]) => {
            converted[key] = [{
              marks: 0, // Default marks since not available in old format
              score: value,
              instruction: `Step ${key}`, // Default instruction
              instruction_label: null
            }];
          });
          setPartialMarks(converted);
        }
      }
    } else {
      // Initialize empty if no partialMarks
      setPartialMarks({});
    }
  }, [question]);

  useEffect(() => {
    if (question?.subQuestions) {
      const initial: Record<number | string, { scores: Score[] }> = {};
      question.subQuestions.forEach((sub) => {
        if (sub.partialMarks && typeof sub.partialMarks === 'object') {
          if ('scores' in sub.partialMarks && Array.isArray(sub.partialMarks.scores)) {
            initial[sub.subQuestionId] = {
              scores: sub.partialMarks.scores.map((score: any) => ({
                score: score.score || 0,
                instruction: score.instruction || '',
                instruction_label: score.instruction_label || `Step ${score.step || ''}`,
                marks: score.marks || sub.maxMarks
              }))
            };
          }
        }
      });
      setSubPartialMarks(initial);
    }
  }, [question]);

  const handleSubChange = (subId: number | string, stepKey: string, value: string) => {
    const [step, idxStr] = stepKey.split('-');
    const idx = parseInt(idxStr);
    const numValue = value === '' ? 0 : Number(value);

    // Find the sub-question to get max marks for validation
    const subQuestion = question?.subQuestions?.find(sq => sq.subQuestionId === subId);
    const maxMarks = subQuestion?.maxMarks || 0;

    setSubPartialMarks((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        scores: prev[subId]?.scores?.map((mark: any, i: number) => {
          if (i === idx) {
            return { ...mark, score: Math.min(numValue, mark.marks ?? 0) };
          }
          return mark;
        }) || []
      }
    }));
  };

  const handleMainQuestionSave = () => {
    // Convert partialMarks format for RemarkModal
    // Use Score | number to match RemarkModal's PartialValue type
    const flattenedPartialMarks: Record<string, number | Score> = {};
    Object.entries(partialMarks).forEach(([key, marks]) => {
      if (Array.isArray(marks)) {
        marks.forEach((mark, idx) => {
          // send richer object so RemarkModal can include instruction and label
          flattenedPartialMarks[`${key}-${idx}`] = {
            score: mark.score || 0,
            marks: mark.marks || 0,
            instruction: mark.instruction,
            instruction_label: mark.instruction_label,
          } as any;
        });
      }
    });

    const modalData = {
      examStudentMarks_id: question?.examMarkId ?? 0,
      partialMarks: flattenedPartialMarks,
    };

    console.log("💾 Opening RemarkModal for main question with data:", modalData);
    setRemarkModalData(modalData);
    setRemarkModalOpen(true);
  };

  const handleSubQuestionSave = (subQuestionId: number | string) => {
    // Flatten the scores array to Record<string, number>
    const scoresArr = subPartialMarks[subQuestionId]?.scores ?? [];
    const flattenedPartialMarks: Record<string, number | Score> = {};
    scoresArr.forEach((mark: any, idx: number) => {
      flattenedPartialMarks[`score${idx}`] = {
        score: mark.score || 0,
        marks: mark.marks || 0,
        instruction: mark.instruction,
        instruction_label: mark.instruction_label,
      } as any;
    });

    const sub = question?.subQuestions?.find(sq => sq.subQuestionId === subQuestionId);
    const modalData = {
      examStudentMarks_id: sub?.examMarkId ?? 0,
      partialMarks: flattenedPartialMarks,
    };

    console.log("💾 Opening RemarkModal for sub-question with data:", modalData);
    setRemarkModalData(modalData);
    setRemarkModalOpen(true);
  };

  if (!question) return null

  return (
    <Modal show={open} onClose={onClose} size="7xl">
      <ModalHeader>
        {studentData?.student?.name ?? "Unknown Student"} :{" "}
        {studentData?.student?.rollnumber}
        <p> Question {question.questionNumber ?? question.id}</p>
      </ModalHeader>
      <ModalBody>
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={[`question-${question.id}`]}
        >
          <MainQuestionAccordion
            question={{
              id: question.id,
              questionNumber: question.questionNumber ?? null,
              questionText: question.questionText ?? null,
              maxMarks: question.maxMarks ?? null,
              // zod schema requires these fields on Question
              status: question.status ?? { bg: '', text: '' },
              score: question.score ?? 0,
              aiFlag: question.aiFlag ?? null,
              partialMarks: question.partialMarks ?? null,
              studentFlag: question.studentFlag ?? null,
              studentAnswer: question.studentAnswer ?? null,
              studentAnswerURL: question.studentAnswerURL ?? null,
              questionType: question.questionType ?? null,
              compilerCode: question.compilerCode ?? null,
              aiInsights: question.aiInsights ?? null,
              studentRemark: question.studentRemark ?? null,
              professorRemark: question.professorRemark ?? null,
              examMarkId: question.examMarkId ?? null,
              subQuestions: question.subQuestions?.map(sub => ({
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
                maxMarks: sub.maxMarks ?? null
              }))
            }}
            scores={scores}
            partialMarks={partialMarks}
            subPartialMarks={subPartialMarks}
            onPartialMarksChange={handleChange}
            onSavePartialMarks={handleMainQuestionSave}
            onSubPartialMarksChange={handleSubChange}
            onSubSavePartialMarks={handleSubQuestionSave}
          />

        </Accordion>

        {/* Action buttons */}
        <ModalActions
          onBack={() => onBack({ questionId: question.id, score: scores[`q-${question.id}`] ?? 0 })}
          onNext={() => onNext({ questionId: question.id, score: scores[`q-${question.id}`] ?? 0 })}
        />

        <RemarkModal
          show={remarkModalOpen}
          onClose={() => setRemarkModalOpen(false)}
          remarkModalData={remarkModalData}
          onSuccess={onRefetch} // ✅ Pass refetch callback
        />

      </ModalBody>
    </Modal>
  )
}
