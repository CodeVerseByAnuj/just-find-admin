"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CourseStudentGraph = ({
  studentsPerCourse,
}: {
  studentsPerCourse: { courseName: string; studentCount: number }[];
}) => {
  // Make a copy for truncated + full
  const fullNames = studentsPerCourse.map((c) => c.courseName);
  const categories = fullNames.map((name) =>
    name.length > 15 ? name.slice(0, 15) + "..." : name
  );
  const data = studentsPerCourse.map((c) => c.studentCount);

  const ChartData: any = {
    series: [
      {
        name: "Students",
        data,
      },
    ],
    chart: {
      toolbar: { show: false },
      type: "bar",
      fontFamily: "inherit",
      foreColor: "#adb0bb",
      height: 295,
    },
    colors: ["#5c98f1"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      show: true,
      borderColor: "rgba(0,0,0,0.05)",
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
    },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "13px", colors: "#adb0bb", fontWeight: "400" },
      },
      tooltip: { enabled: false }, // we'll handle tooltip manually
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number, opts: any) => {
          const index = opts.dataPointIndex;
          const courseName = fullNames[index];
          return `${courseName}: ${val} students`;
        },
      },
    },
  };

  const totalStudents = studentsPerCourse.reduce(
    (sum, c) => sum + c.studentCount,
    0
  );
  const totalCourses = studentsPerCourse.length;

  return (
    <CardBox>
      <div className="md:flex justify-between items-center">
        <div>
          <h5 className="card-title">Course-Student Distribution</h5>
          <p className="card-subtitle">
            Number of students enrolled per course
          </p>
        </div>
      </div>

      <div className="rounded-bars overflow-visible">
        <Chart
          options={ChartData}
          series={ChartData.series}
          type="bar"
          height={295}
          width="100%"
        />
      </div>
    </CardBox>
  );
};

export default CourseStudentGraph;
