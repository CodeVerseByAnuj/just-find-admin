"use client";
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, Select } from "flowbite-react";
import type { ApexOptions } from "apexcharts";
import { StudentDashboardMarks } from "@/lib/schemas/studentDashboard.schema";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const StudentColumnChart = ({ studentMarks }: { studentMarks: StudentDashboardMarks }) => {
  const data = Array.isArray(studentMarks) ? studentMarks : [];

  // unique exam types
  const examTypes = useMemo(
    () => Array.from(new Set(data.map(mark => mark?.exam?.examType).filter(Boolean))) as string[],
    [data]
  );

  // no "All" option anymore
  const selectOptions = useMemo(() => examTypes, [examTypes]);

  const [selectedExamType, setSelectedExamType] = useState<string>("");

  // keep selection valid as data changes
  useEffect(() => {
    if (selectOptions.length === 0) {
      setSelectedExamType("");
      return;
    }
    if (!selectedExamType || !selectOptions.includes(selectedExamType)) {
      setSelectedExamType(selectOptions[0]);
    }
  }, [selectOptions, selectedExamType]);

  const filteredMarks = useMemo(() => {
    if (!data.length || !selectedExamType) return [];
    return data.filter(mark => mark?.exam?.examType === selectedExamType);
  }, [data, selectedExamType]);

  const categories = filteredMarks.map(mark => mark.exam.courseName);
  const series = [
    { name: "Your Score", data: filteredMarks.map(mark => mark.studentMarks) },
    { name: "Class Average", data: filteredMarks.map(mark => mark.averageMarks) },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "inherit",
      foreColor: "#a1aab2",
      toolbar: { show: false },
    },
    colors: ["#0ea5e9", "#f59e0b"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { color: "rgba(173,181,189,0.3)" },
    },
    yaxis: { title: { text: "Marks" }, min: 0, max: 100 },
    fill: { opacity: 1 },
    tooltip: { theme: "dark", y: { formatter: (val: number) => `${val} marks` } },
    grid: { show: true, borderColor: "rgba(173,181,189,0.1)" },
    legend: { show: true, position: "bottom", horizontalAlign: "center" },
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance</h3>
        <section className="max-w-[300px]">
          <Select
            id="examType"
            className="min-w-[150px]"
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            disabled={selectOptions.length === 0}
          >
            {selectOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </section>
      </div>

      {categories.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No data available</div>
      ) : (
        <Chart options={options} series={series} type="bar" height={350} width="100%" />
      )}
    </Card>
  );
};

export default StudentColumnChart;
