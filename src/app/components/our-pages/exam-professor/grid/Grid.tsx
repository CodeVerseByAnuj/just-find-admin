"use client"
import React, { useState } from "react"
import ExamQuestionModal from "../../exam-results/ExamQuestionModal"
import TitleCard from "../../../shared/TitleBorderCard"
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react"
import { useQuery } from "@tanstack/react-query";
import { getAllExamResults } from "@/app/router/examResult.router";
import { StudentResult } from "@/lib/schemas/examResult.schema";
import { Exam } from "@/lib/schemas/examResult.schema";
import { useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query";

function Grid() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('id');
  const queryClient = useQueryClient(); // ✅ Add queryClient hook

  const { data: fetchedData, isLoading, error, refetch } = useQuery({
    queryKey: ['examResults', examId],
    queryFn: () => getAllExamResults(Number(examId)),
    enabled: !!examId,
    staleTime: 0,
  });

  const [modalOpen, setModalOpen] = useState(false)
  const [studentIndex, setStudentIndex] = useState<number | null>(null)
  const [questionIndex, setQuestionIndex] = useState<number | null>(null)
  const [tableData, setTableData] = useState<StudentResult[]>([])
  // ✅ Fixed: Changed from Exam[] to Exam | null since examDetails is a single object
  const [courseData, setCourseData] = useState<Exam | null>(null)

  React.useEffect(() => {
    if (fetchedData && typeof fetchedData === 'object' && 'students' in fetchedData && Array.isArray((fetchedData as any).students)) {
      setTableData((fetchedData as any).students)
      // ✅ Fixed: Set examDetails as a single object, not an array
      setCourseData((fetchedData as any).examDetails)
    }
  }, [fetchedData])

  const maxQuestions = Math.max(...tableData.map((row: { questions: any[] }) => row.questions.length))
  const columns = Array.from({ length: maxQuestions }, (_, i) => `Q${i + 1}`)

  const handleClick = (sIdx: number, qIdx: number) => {
    setStudentIndex(sIdx)
    setQuestionIndex(qIdx)
    setModalOpen(true)
  }

  function handleBack() {
    if (studentIndex === null || questionIndex === null) return;

    const studentsWithThisQuestion = tableData
      .map((student, index) => ({ ...student, index }))
      .filter(student => questionIndex < student.questions.length);

    const currentPosition = studentsWithThisQuestion
      .findIndex(student => student.index === studentIndex);

    if (currentPosition === 0) {
      setModalOpen(false);
      setStudentIndex(null);
      setQuestionIndex(null);
      return;
    }

    const previousStudent = studentsWithThisQuestion[currentPosition - 1];
    setStudentIndex(previousStudent.index);
  }


  const handleNext = (payload: { questionId: number; subQuestionId?: string | number; score: number }) => {
    if (studentIndex === null || questionIndex === null) return
    const nextStudentIndex = studentIndex + 1
    if (nextStudentIndex < tableData.length) {
      setStudentIndex(nextStudentIndex)
    } else {
      setModalOpen(false)
    }
  }

  return (
    <TitleCard title="Student Exam Results">
      <div className="overflow-x-auto">
        <div className="border rounded-md border-ld overflow-x-auto overflow-y-hidden">
          <Table className="min-w-[600px]" hoverable>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableHeadCell className="px-4 py-2 text-left">Student</TableHeadCell>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-center">
                    {col}
                  </th>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, sIdx) => {
                const total = row.questions.reduce((acc, q) => acc + q.score, 0)
                return (
                  <TableRow key={row.id} className="border-b hover:bg-gray-50">
                    <TableCell className="px-4 py-2">{row.student.name}</TableCell>
                    {row.questions.map((q, qIdx) => (
                      <TableCell key={q.id} className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleClick(sIdx, qIdx)}
                          className="px-3 py-1 rounded-md text-sm font-medium transition"
                          style={{
                            backgroundColor: q.status.bg,
                            color: q.status.text,
                          }}
                        >
                          {q.questionNumber}
                        </button>
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {studentIndex !== null && questionIndex !== null && (
          <ExamQuestionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            student={tableData[studentIndex]}
            questionIndex={questionIndex}
            score={tableData[studentIndex].questions[questionIndex].score}
            onNext={handleNext}
            onBack={handleBack}
            tableData={tableData}
            onRefetch={async () => {
              console.log("🔄 Invalidating and refetching exam results...");
              try {
                await queryClient.invalidateQueries({
                  queryKey: ['examResults', examId]
                });
                console.log("✅ Query invalidated and refetched successfully");
              } catch (error) {
                console.error("❌ Refetch failed:", error);
              }
            }}
          />
        )}
      </div>
    </TitleCard>
  )
}

export default Grid