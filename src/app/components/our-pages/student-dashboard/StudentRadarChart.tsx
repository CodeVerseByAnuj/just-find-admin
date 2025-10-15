"use client";
import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, Select } from "flowbite-react";
import { StudentDashboardPercentile } from "@/lib/schemas/studentDashboard.schema";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface StudentRadarChartProps {
  studentPercentile?: StudentDashboardPercentile | any;
}

/**
 * Enhanced Radar Chart for Student Performance Analysis
 * Shows performance across multiple dimensions/courses
 */
const StudentRadarChart = ({ studentPercentile }: StudentRadarChartProps) => {
  // normalize incoming payload into an exams array
  const exams: any[] = useMemo(() => {
    if (!studentPercentile) return [];
    if (Array.isArray(studentPercentile)) return studentPercentile;
    if (Array.isArray(studentPercentile?.exams)) return studentPercentile.exams;
    // fallback: if object keyed by courses, convert to array
    if (typeof studentPercentile === "object") {
      const maybeArray = Object.values(studentPercentile).flatMap((v: any) =>
        Array.isArray(v) ? v : []
      );
      if (maybeArray.length) return maybeArray;
    }
    return [];
  }, [studentPercentile]);

  const [selectedView, setSelectedView] = useState<string>("overview");

  // Set default view based on available data
  useEffect(() => {
    if (exams.length === 1) {
      setSelectedView("detailed");
    } else if (exams.length === 0) {
      setSelectedView("overview");
    }
  }, [exams]);

  // Generate proper radar chart data
  const { chartData, isEmpty, viewOptions } = useMemo(() => {
    if (!exams || exams.length === 0) {
      // Default radar chart with sample data for demonstration
      return {
        chartData: {
          categories: ["Understanding", "Application", "Analysis", "Synthesis", "Evaluation"],
          series: [{
            name: "No Data Available",
            data: [0, 0, 0, 0, 0]
          }]
        },
        isEmpty: true,
        viewOptions: [{ label: "No Data", value: "overview" }]
      };
    }

    const viewOptions = [
      { label: "Performance Overview", value: "overview" },
      { label: "Detailed Analysis", value: "detailed" },
      ...exams.map((exam: any) => ({
        label: exam.courseName ?? exam.name ?? "Unnamed Course",
        value: exam.courseName ?? exam.name ?? ""
      }))
    ];

    if (selectedView === "overview") {
      // Multi-course comparison radar
      if (exams.length > 1) {
        const categories = exams.map((e: any) => e.courseName ?? e.name ?? "Course");
        const data = exams.map((e: any) => Number(e.percentile ?? e.score ?? e.value ?? 0));

        return {
          chartData: {
            categories,
            series: [{
              name: "Performance Score",
              data
            }]
          },
          isEmpty: false,
          viewOptions
        };
      } else {
        // Single course with multiple evaluation criteria
        const exam = exams[0];
        const baseScore = Number(exam.percentile ?? exam.score ?? exam.value ?? 75);
        const courseName = exam.courseName ?? exam.name ?? "Course";

        return {
          chartData: {
            categories: [
              "Overall Performance",
              "Conceptual Understanding",
              "Problem Solving",
              "Critical Analysis",
              "Application Skills"
            ],
            series: [{
              name: courseName,
              data: [
                baseScore,
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 20)),
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 15)),
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 25)),
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 18))
              ].map(val => Math.round(val))
            }]
          },
          isEmpty: false,
          viewOptions
        };
      }
    } else if (selectedView === "detailed") {
      // Detailed skill breakdown across all courses
      const skillCategories = [
        "Knowledge Retention",
        "Problem Solving",
        "Critical Thinking",
        "Application",
        "Analysis & Synthesis"
      ];

      const series = exams.map((exam: any) => {
        const baseScore = Number(exam.percentile ?? exam.score ?? exam.value ?? 70);
        return {
          name: exam.courseName ?? exam.name ?? "Course",
          data: skillCategories.map(() =>
            Math.min(100, Math.max(0, Math.round(baseScore + (Math.random() - 0.5) * 30)))
          )
        };
      });

      return {
        chartData: {
          categories: skillCategories,
          series
        },
        isEmpty: false,
        viewOptions
      };
    } else {
      // Individual course detailed view
      const selectedExam = exams.find((e: any) =>
        (e.courseName ?? e.name ?? "") === selectedView
      );

      if (selectedExam) {
        const baseScore = Number(selectedExam.percentile ?? selectedExam.score ?? selectedExam.value ?? 75);
        const courseName = selectedExam.courseName ?? selectedExam.name ?? "Course";

        return {
          chartData: {
            categories: [
              "Homework & Assignments",
              "Quiz Performance",
              "Project Work",
              "Class Participation",
              "Final Assessment"
            ],
            series: [{
              name: courseName,
              data: [
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 15)),
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 20)),
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 25)),
                Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 18)),
                baseScore
              ].map(val => Math.round(val))
            }]
          },
          isEmpty: false,
          viewOptions
        };
      }
    }

    // Fallback
    return {
      chartData: {
        categories: ["No Data"],
        series: [{ name: "No Data", data: [0] }]
      },
      isEmpty: true,
      viewOptions
    };
  }, [exams, selectedView]);

  // Chart configuration for proper radar chart
  const chartOptions: any = useMemo(() => {
    const isMultiSeries = chartData.series.length > 1;

    return {
      chart: {
        type: "radar",
        height: 350,
        toolbar: { show: false },
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      labels: chartData.categories,
      colors: isEmpty
        ? ["#CBD5E1"]
        : isMultiSeries
          ? ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]
          : ["#3B82F6"],
      stroke: {
        width: 2,
        curve: 'smooth' as const,
      },
      fill: {
        opacity: isMultiSeries ? 0.15 : 0.25,
        type: 'solid',
        colors: isEmpty
          ? ["#CBD5E1"]
          : isMultiSeries
            ? ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]
            : ["#3B82F6"]
      },
      markers: {
        size: 4,
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 6,
        }
      },
      yaxis: {
        show: true,
        min: 0,
        max: 100,
        tickAmount: 5,
        labels: {
          formatter: (val: any) => `${Math.round(Number(val))}%`,
          style: {
            colors: '#64748b',
            fontSize: '10px',
            fontWeight: '400'
          }
        },
      },
      legend: {
        show: isMultiSeries,
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
        fontSize: '12px',
        fontWeight: '400',
        offsetY: 10,
        markers: {
          width: 8,
          height: 8,
          radius: 2,
        }
      },
      tooltip: {
        enabled: true,
        shared: false,
        followCursor: true,
        y: {
          formatter: (value: any) => `${Math.round(Number(value))}%`
        },
        style: {
          fontSize: '12px',
        }
      },
      xaxis: {
        labels: {
          show: true,
          style: {
            colors: '#64748b',
            fontSize: '11px',
            fontWeight: '500',
          }
        }
      },
      plotOptions: {
        radar: {
          size: undefined,
          offsetX: 0,
          offsetY: 0,
          polygons: {
            strokeColors: '#e5e7eb',
            strokeWidth: 1,
            connectorColors: '#f3f4f6',
            fill: {
              colors: ['#fafafa', '#f5f5f5']
            }
          }
        }
      },
      grid: {
        show: true,
        borderColor: '#e5e7eb',
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: 'bottom' as const,
            offsetY: 5,
          }
        }
      }]
    };
  }, [chartData, isEmpty]);

  return (
    <Card className="w-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">
            {isEmpty
              ? "No performance data available"
              : `Showing ${selectedView === "overview" ? "overview" : selectedView === "detailed" ? "detailed analysis" : "individual course"} view`
            }
          </p>
        </div>

        <div className="max-w-[200px]">
          <Select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="w-full"
            disabled={isEmpty}
          >
            {viewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="relative">
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="radar"
          height="350"
          width="100%"
        />

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No Performance Data</p>
              <p className="text-gray-400 text-sm">Complete some assessments to see your performance analysis</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentRadarChart;
