"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "../../shadcn-ui/Default-Ui/card";
import { dashboardPerformanceSchema } from "@/lib/schemas/PropDashboard.schema";
import { Select } from "flowbite-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface PerformanceGraphProps {
  performanceData?: any;
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ performanceData }) => {

  // Validate and extract performance array
  let performance: Array<any> = [];
  if (performanceData && performanceData.performance) {
    try {
      performance = dashboardPerformanceSchema.parse(performanceData).performance;
    } catch (e) {
      performance = performanceData.performance || [];
    }
  }

  const examTypes = Array.from(
    new Set(
      performance.flatMap((p: any) =>
        p.exams ? p.exams.map((exam: any) => exam.examType) : []
      )
    )
  );

  const [metric, setMetric] = useState("avg");
  const [studentType, setStudentType] = useState("both");
  const [examFilter, setExamFilter] = useState("");

  // Set default exam filter when examTypes are available
  useEffect(() => {
    if (examTypes.length > 0 && !examFilter) {
      setExamFilter(examTypes[0]);
    }
  }, [examTypes, examFilter]);

  const filteredPerformance = performance.filter(
    (p: any) => p.exams && p.exams.some((exam: any) => exam.examType === examFilter)
  );
  const categories = Array.from(new Set(filteredPerformance.map((p: any) => p.courseName)));

  const profData = categories.map((courseName) => {
    const exams = filteredPerformance
      .filter((p: any) => p.courseName === courseName)
      .flatMap((p: any) => p.exams ?? []);
    if (exams.length === 0) return null;
    const sum = exams.reduce((s: number, e: any) => s + (e.profStudents[metric] ?? 0), 0);
    const avg = sum / exams.length;
    const rounded = Number(avg.toFixed(1));
    return rounded;
  });

  const otherData = categories.map((courseName) => {
    const exams = filteredPerformance
      .filter((p: any) => p.courseName === courseName)
      .flatMap((p: any) => p.exams ?? []);
    if (exams.length === 0) return null;
    const sum = exams.reduce((s: number, e: any) => s + (e.otherStudents[metric] ?? 0), 0);
    const avg = sum / exams.length;
    const rounded = Number(avg.toFixed(1));
    return rounded;
  });

  const series = [
    { key: "prof", name: `Professor's Students (${metric})`, data: profData },
    { key: "other", name: `Other Students (${metric})`, data: otherData },
  ];

  const visibleSeries = series
    .filter((s) => studentType === "both" || studentType === s.key)
    .map((s) => ({ name: s.name, data: s.data }));

  const ChartData: any = {
    series: visibleSeries,
    chart: {
      type: "bar",
      height: 360,
      fontFamily: `inherit`,
      foreColor: "#475569",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeinout", speed: 600 },
    },
    colors: ["#4086ee", "#F28E2B"],
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "45%",
        borderRadius: 6,
        minHeight: 5,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "16px",
        colors: ["#fff"],
      },
      formatter: function (val: number) {
        if (val === null || val === undefined) return "N/A";
        return `${val}`;
      },
    },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { color: "rgba(148,163,184,0.2)" },
      labels: { style: { fontSize: "13px", colors: ["#334155"] } },
    },
    yaxis: {
      title: { text: "Scores" },
      labels: { style: { colors: ["#334155"] } },
    },
    fill: { type: "solid" },
    tooltip: {
      theme: "dark",
      y: {
        formatter(val: any) {
          if (val === null || val === undefined) return "No data";
          return `${val} marks`;
        },
      },
      labels: { style: { colors: ["#334155"] }, formatter: (val: number) => val === null ? "N/A" : `~${val}` },
    },
    grid: { borderColor: "rgba(203,213,225,0.2)" },
    legend: { show: true, position: "top", horizontalAlign: "right" },
    responsive: [
      {
        breakpoint: 640,
        options: { plotOptions: { bar: { columnWidth: "65%" } } },
      },
    ],
  };

  return (
    <Card className="p-5 space-y-4 bg-white shadow-md rounded-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title & Subtitle */}
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-slate-800">Performance Overview</h3>
          <p className="text-sm text-slate-500">Compare students across courses</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
          <Select
            className="w-full sm:w-[200px] bg-white border-slate-200 shadow-sm"
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
          >
            {examTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          <Select
            className="w-full sm:w-[150px] bg-white border-slate-200 shadow-sm"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="avg">Average</option>
            <option value="median">Median</option>
            <option value="min">Minimum</option>
            <option value="max">Maximum</option>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        {examFilter && (
          <Chart options={ChartData} series={ChartData.series} type="bar" height={360} />
        )}
      </div>
    </Card>
  );
};

export default PerformanceGraph;