"use client";
import { useParams } from "next/navigation";
import StatusCard from "./exam/StatusCard";
import StatusTable from "./exam/StatusTable";
import TitleCard from "../../shared/TitleBorderCard";
import { useQuery } from "@tanstack/react-query";
import { fetchProfessorExamStudentList } from "@/app/router/examProfessor.router";
import type { ExamResultResponse } from "@/lib/schemas/examProfessor.schema";

function ViewExam() {
    const params = useParams();
    const examId = Number(params?.slug);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['examStudents', examId],
        queryFn: () => fetchProfessorExamStudentList(examId),
    });

    // Ensure examStudents is never null and matches ExamResultResponse type
    const examStudents: ExamResultResponse = data ?? { examStudentResults: [], exam: { exam_date: '', max_marks: 0, course: '', courseCode: '' }, stats: { studentsAppeared: 0, averageScore: 0, topScore: 0, bottomScrore: 0, pendingEvaluations: 0, flaggedEvaluations: 0, medianScore: 0 } };

    return (
        <div>
            <TitleCard title={`${examStudents.exam.course} - ${examStudents.exam.courseCode || ""}`}>
                    <div className="mb-6">
                        <StatusCard
                            examStudents={examStudents}
                            isLoading={isLoading}
                            isError={isError}
                        />
                    </div>
                <StatusTable
                    examStudents={examStudents}
                    isLoading={isLoading}
                    isError={isError}
                    examId={examId}
                />
            </TitleCard>
        </div>
    );
}

export default ViewExam;