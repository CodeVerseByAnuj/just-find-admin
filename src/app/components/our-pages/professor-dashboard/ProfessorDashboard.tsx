"use client"

import React, { useState, useEffect } from "react"
import CardBox from "../../shared/CardBox"
import ProfessorCard from "./ProfessorCard"
import CourseStudentGraph from "./CourseStudentGraph"
import AiInsights from "./AiInsights"
import PerformanceGraph from "./PerformanceGraph"
import { Select } from "flowbite-react"
import { getPropDashboardByProfessorId, fetchProfessorDashboardPerformanceInfo, getProfessorUpcomingExams, getProfessorEvaluation } from "@/app/router/propDashboard.router";
import PropEvaluationGraph from "./PropEvaluationGraph"
import { useQuery } from "@tanstack/react-query"
import UpcomingExams from "./UpcomingExams";
import { useSemesterTypes } from '@/hooks/useSemesterTypes';


function ProfessorDashboard() {
  // Fetch semesters using the custom hook
  const { semesters, loading: semesterLoading, error: semesterError } = useSemesterTypes();
  const [semesterId, setSemesterId] = useState("");
  const viewKey = `sem-${semesterId}`;


  // Set default semesterId to first semester when semesters are loaded
  useEffect(() => {
    if (semesters.length > 0 && !semesterId) {
      setSemesterId(String(semesters[0].id));
    }
  }, [semesters, semesterId]);
  const semesterOptions = semesters.map((semester) => (
    <option key={semester.id} value={semester.id}>
      {semester.title}
    </option>
  ));

  const professorId = 1;
  const semesterIdNum = semesterId ? Number(semesterId) : undefined;

  const { data: res, isLoading, error } = useQuery({
    queryKey: ["propDashboard", professorId, semesterIdNum],
    queryFn: () => {
      if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
      return getPropDashboardByProfessorId(semesterIdNum);
    },
    enabled: !!semesterIdNum,
    staleTime: 1000 * 60 * 2,
  });
  const data = res?.data ?? null;

  const { data: performanceData } = useQuery({
    queryKey: ["professorPerformance", semesterIdNum],
    queryFn: () => {
      if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
      return fetchProfessorDashboardPerformanceInfo(semesterIdNum);
    },
    enabled: !!semesterIdNum,
    staleTime: 1000 * 60 * 2,
  });

  // Fetch upcoming exams for professor
  const { data: upcomingExams, isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ["professorUpcomingExams", semesterIdNum],
    queryFn: () => {
      if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
      return getProfessorUpcomingExams(semesterIdNum);
    },
    enabled: !!semesterIdNum,
    staleTime: 1000 * 60 * 2,
  });

  const { data: evaluationData } = useQuery({
    queryKey: ["professorEvaluation", semesterIdNum],
    queryFn: () => {
      if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
      return getProfessorEvaluation(semesterIdNum);
    },
    enabled: !!semesterIdNum,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <>
      <div className="grid grid-cols-12 gap-6 md:px-0 px-6">
        {/* Professor Section */}
        <div className="col-span-12">
          <CardBox>
            <section className="flex flex-col sm:flex-row sm:justify-between">
              <div className="flex items-center border-ld">
                <h5 className="text-xl font-semibold">Professor</h5>
              </div>
              <div className="my-4 sm:my-0">
                <Select
                  className="min-w-[200px]"
                  id="semesterId"
                  disabled={semesterLoading}
                  value={semesterId}
                  onChange={e => setSemesterId(e.target.value)}
                >
                  {semesterLoading ? (
                    <option value="">Loading semesters...</option>
                  ) : (
                    semesterOptions
                  )}
                </Select>
              </div>
            </section>
            <ProfessorCard key={viewKey} data={data} />
          </CardBox>
        </div>

        {/* Course Graph + Upcoming Exams */}
        <div className="col-span-12 lg:col-span-8">
          <CourseStudentGraph key={viewKey} studentsPerCourse={data?.studentsPerCourse ?? []} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <UpcomingExams
            exams={upcomingExams?.data ?? []}
            isLoading={examsLoading}
            error={examsError}
          />
        </div>

        {/* Performance + AI Insights */}
        <div className="col-span-12 lg:col-span-8">
          <PerformanceGraph key={viewKey} performanceData={performanceData || []} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <AiInsights key={viewKey} aiInsights={data?.aiInsights ?? []} />
        </div>

        {/* Evaluation Graph */}
        <div className="col-span-12">
          <PropEvaluationGraph key={viewKey} evaluationData={evaluationData || []} />
        </div>
      </div>

    </>
  )
}

export default ProfessorDashboard
