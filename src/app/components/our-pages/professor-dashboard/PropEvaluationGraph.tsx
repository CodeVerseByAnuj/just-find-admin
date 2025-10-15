"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "../../shadcn-ui/Default-Ui/card";
import { Select } from "flowbite-react";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type EvaluationItem = {
  course: string;
  examType: string;
  studentsAppeared: number;
  studentFlagged: number;
  aiFlagged: number;
};

interface ApexColumnChartProps {
  evaluationData: EvaluationItem[];
}

const MAX_NAME = 15;

const ApexColumnChart = ({ evaluationData }: ApexColumnChartProps) => {
  const [selectedExamType, setSelectedExamType] = useState<string>("");

  const examTypes = useMemo(
    () => Array.from(new Set(evaluationData.map(i => i.examType))),
    [evaluationData]
  );

  const filteredData = useMemo(
    () => (selectedExamType ? evaluationData.filter(i => i.examType === selectedExamType) : evaluationData),
    [evaluationData, selectedExamType]
  );

  const fullNames = filteredData.map(i => i.course);
  const categories = fullNames.map(n => (n.length > MAX_NAME ? n.slice(0, MAX_NAME) + "..." : n));

  const studentsAppearedData = filteredData.map(i => i.studentsAppeared);
  const studentFlaggedData = filteredData.map(i => i.studentFlagged);
  const aiFlaggedData = filteredData.map(i => i.aiFlagged);

  const notFlaggedData = studentsAppearedData.map((val, i) => val - (studentFlaggedData[i] + aiFlaggedData[i]));

  const ChartData: any = {
    series: [
      { name: "Not Flagged Students", data: notFlaggedData },
      { name: "Student Flagged", data: studentFlaggedData },
      { name: "AI Flagged", data: aiFlaggedData },
    ],
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      stackType: "normal",
      fontFamily: "inherit",
      foreColor: "#a1aab2",
      toolbar: { show: false },
    },
    colors: ["#5c98f1", "#45B7AF", "#f49f4b"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "12px", fontWeight: 400 },
        rotate: -15,
        trim: true,
      },
      tooltip: { enabled: false }, // we’ll control tooltip text below
    },
    yaxis: { title: { text: "Students" } },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "dark",
      // Show the FULL course name in the tooltip header
      x: {
        formatter: (_val: any, opts: any) => {
          const i = opts.dataPointIndex;
          return fullNames[i] ?? "";
        },
      },
      // Keep numbers clean in the rows
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
    grid: { show: true, borderColor: "#e0e0e0" },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      markers: { width: 20, height: 20, radius: 6 },
    },
  };

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-800 text-center sm:text-left">
          Course Wise Performance
        </h3>

        <Select
          value={selectedExamType}
          onChange={(e) => setSelectedExamType(e.target.value)}
          className="w-full sm:w-[220px] bg-white border border-slate-200 shadow-sm rounded-md"
        >
          <option value="">All Exam Types</option>
          {examTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
      </div>

      <Chart options={ChartData} series={ChartData.series} type="bar" height={350} width="100%" />
    </Card>
  );
};

export default ApexColumnChart;
