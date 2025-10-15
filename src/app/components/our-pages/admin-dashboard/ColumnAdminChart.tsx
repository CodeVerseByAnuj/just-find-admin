"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import TitleCard from "@/app/components/shared/TitleBorderCard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ColumnAdminChart = ({ getCourseExam }: { getCourseExam: any }) => {
  // Transform API data into chart-friendly format
  const { categories, series } = useMemo(() => {
    if (!getCourseExam) {
      return { categories: [], series: [] };
    }

    const data = getCourseExam;

    // Collect all unique semester names
    const semesters = Array.from(
      new Set(
        Object.values(data).flatMap((course: any) => Object.keys(course))
      )
    );

    // Build series (each course = one series with values per semester)
    const seriesData = Object.entries(data).map(([courseName, semData]: any) => ({
      name: courseName,
      data: semesters.map((sem) => semData[sem] ?? 0), // 0 if not present
    }));

    return { categories: semesters, series: seriesData };
  }, [getCourseExam]);

  const ChartData: any = {
    series,
    chart: {
      type: "bar",
      height: 350,
      fontFamily: `inherit`,
      foreColor: "#a1aab2",
      toolbar: { show: false },
    },
    colors: ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"],
    plotOptions: {
      bar: { horizontal: false, endingShape: "rounded", columnWidth: "40%" },
    },
    dataLabels: { enabled: true },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { color: "rgba(173,181,189,0.3)" },
    },
    yaxis: {
      title: { text: "Students" },
      min: 0,
      // tickAmount: 4, // number of steps on Y-axis
      forceNiceScale: true,
      // labels: {
      //   formatter: (val: number) => val.toFixed(0), // always whole number
      // },
    },

    fill: { opacity: 1 },
    tooltip: {
      theme: "dark",
      y: { formatter: (val: any) => `${Math.floor(val)} Student(s)` }, // ✅ no decimals
    },
    legend: { show: true, position: "bottom" },
  };


  return (
    <TitleCard title="Course vs Semester Chart">
      <Chart
        options={ChartData}
        series={ChartData.series}
        type="bar"
        height="300px"
        width="100%"
      />
    </TitleCard>
  );
};

export default ColumnAdminChart;
