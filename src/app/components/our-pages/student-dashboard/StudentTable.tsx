"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Select,
} from "flowbite-react";
import { Card } from "flowbite-react";
import { StudentDashboardRank } from "@/lib/schemas/studentDashboard.schema";

function StudentTable({ studentRanks }: { studentRanks: StudentDashboardRank }) {
  const examTypes = useMemo(
    () => Array.from(new Set((studentRanks || []).map(i => i.exam.examType))),
    [studentRanks]
  );

  const options = useMemo(() => examTypes, [examTypes]);
  const [examType, setExamType] = useState<string>("");

  useEffect(() => {
    if (options.length === 0) {
      setExamType("");
      return;
    }
    // if current selection is empty or invalid, default to first available type
    if (!examType || !options.includes(examType)) {
      setExamType(options[0]);
    }
  }, [options, examType]);

  const filteredData = useMemo(() => {
    if (!studentRanks?.length) return [];
    if (!examType) return [];
    return studentRanks.filter(item => item.exam.examType === examType);
  }, [studentRanks, examType]);

  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Course Rankings</h3>
        <section className="max-w-[300px]">
          <Select
            id="examType"
            className="min-w-[150px]"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            disabled={options.length === 0}
          >
            {options.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </section>
      </div>

      <section className="h-full overflow-x-auto overflow-y-auto rounded-md border">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Course</TableHeadCell>
              <TableHeadCell className="text-center">Credits</TableHeadCell>
              <TableHeadCell className="text-center">Rank</TableHeadCell>
              <TableHeadCell className="text-center">Students</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.exam.courseName}</TableCell>
                  <TableCell className="text-center">{item.exam.courseCredits}</TableCell>
                  <TableCell className="text-center">{item.rank}</TableCell>
                  <TableCell className="text-center">{item.totalStudents}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </Card>
  );
}

export default StudentTable;
