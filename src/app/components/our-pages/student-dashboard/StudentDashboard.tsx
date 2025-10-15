"use client"

import React, { useState, useEffect } from "react"
import CardBox from "../../shared/CardBox"
import StudentCard from "./StudentCard"
import StudentTable from "./StudentTable"
import StudentColumnChart from "./StudentColumnChart"
import StudentRadarChart from "./StudentRadarChart"
import AiInsights from "./AiInsights"
import { Select } from "flowbite-react"
import { getStudentDashboardCard, getStudentDashboardMarks, getStudentDashboardRanks, getStudentDashboardPercentile } from "@/app/router/StudentDahboard.router";
import { useQuery } from "@tanstack/react-query"
import { useStudentSemesterTypes } from '@/hooks/useStudentSemesterTypes';
import { StudentDashboardCard } from "@/lib/schemas/studentDashboard.schema";


function StudentDashboard() {
    // Fetch semesters using the custom hook
    const { semesters, loading: semesterLoading, error: semesterError } = useStudentSemesterTypes();
    const [semesterId, setSemesterId] = useState(""); 
    const [selectChanged, setSelectChanged] = useState(false);
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

    const semesterIdNum = semesterId ? Number(semesterId) : undefined;

    const { data: studentCard, isLoading, error } = useQuery<StudentDashboardCard>({
        queryKey: ["studentCard", semesterIdNum],
        queryFn: () => {
            if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
            return getStudentDashboardCard(semesterIdNum);
        },
        enabled: !!semesterIdNum,
        staleTime: 1000 * 60 * 2,
    });

    const { data: studentMarks } = useQuery({
        queryKey: ["studentMarks", semesterIdNum],
        queryFn: () => {
            if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
            return getStudentDashboardMarks(semesterIdNum);
        },
        enabled: !!semesterIdNum,
        staleTime: 1000 * 60 * 2,
    });

    // Fetch upcoming exams for professor
    const { data: studentRanks, isLoading: examsLoading, error: examsError } = useQuery({
        queryKey: ["studentRanks", semesterIdNum],
        queryFn: () => {
            if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
            return getStudentDashboardRanks(semesterIdNum);
        },
        enabled: !!semesterIdNum,
        staleTime: 1000 * 60 * 2,
    });

    const { data: studentPercentile } = useQuery({
        queryKey: ["studentPercentile", semesterIdNum],
        queryFn: () => {
            if (semesterIdNum === undefined) throw new Error("semesterIdNum is required");
            return getStudentDashboardPercentile(semesterIdNum);
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
                                <h5 className="text-xl font-semibold">
                                    {[studentCard?.studentFirstName, studentCard?.studentMiddleName, studentCard?.studentLastName]
                                        .filter(Boolean)
                                        .join(" ")}{" "}
                                    {studentCard?.studentEnrollmentId ? `(${studentCard.studentEnrollmentId})` : ""}
                                </h5>
                            </div>
                            <div className="my-4 sm:my-0">
                                <Select
                                    className="min-w-[200px]"
                                    id="semesterId"
                                    disabled={semesterLoading}
                                    value={semesterId}
                                    onChange={e => {
                                        setSemesterId(e.target.value);
                                        setSelectChanged(true);
                                    }}
                                >
                                    {semesterLoading ? (
                                        <option value="">Loading semesters...</option>
                                    ) : (
                                        semesterOptions
                                    )}
                                </Select>
                            </div>
                        </section>
                        <StudentCard studentCard={studentCard} />
                    </CardBox>
                </div>

                {/* Course Graph + Upcoming Exams */}
                <div className="col-span-12 lg:col-span-6 ">
                    <StudentTable key={viewKey} studentRanks={studentRanks ?? []} />
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <StudentColumnChart key={viewKey} studentMarks={studentMarks ?? []} />
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <StudentRadarChart key={viewKey} studentPercentile={studentPercentile ?? []} />
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <AiInsights key={viewKey} aiInsights={studentCard?.aiInsights ?? []} />
                </div>
            </div>

        </>
    )
}

export default StudentDashboard
