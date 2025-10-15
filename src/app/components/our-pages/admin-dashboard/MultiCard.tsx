"use client";
import { Button, Select } from "flowbite-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import Carousel, { ArrowProps } from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { formatDate } from "@/utils/dateFormat/formatDate";
import AdminDashboardCards from "./AdminDashboardCards";

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 2, slidesToSlide: 2 },
  tablet: { breakpoint: { max: 1024, min: 640 }, items: 1, slidesToSlide: 1 },
  mobile: { breakpoint: { max: 640, min: 0 }, items: 1, slidesToSlide: 1 },
};

const CustomLeftArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center shadow"
  >
    ‹
  </button>
);

const CustomRightArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center shadow"
  >
    ›
  </button>
);

type MultiCardProps = {
  dashboardData?: Record<
    string,
    {
      departmentCode: string;
      totalCourses: number;
      alerts: {
        examId: number;
        examDate: string; // API: yyyy-mm-dd
        course: string;
        courseCode: string;
        examType: string;
        message: string;
      }[];
    }
  >;
  loading?: boolean;
};

const pastelBorders = [
  "border-l-red-200",
  "border-l-orange-200",
  "border-l-amber-200",
  "border-l-yellow-200",
  "border-l-green-200",
  "border-l-emerald-200",
  "border-l-teal-200",
  "border-l-cyan-200",
  "border-l-blue-200",
  "border-l-indigo-200",
  "border-l-violet-200",
  "border-l-purple-200",
  "border-l-pink-200",
  "border-l-rose-200",
];

const childTopBorders = [
  "border-t-red-100",
  "border-t-orange-100",
  "border-t-amber-100",
  "border-t-yellow-100",
  "border-t-green-100",
  "border-t-emerald-100",
  "border-t-teal-100",
  "border-t-cyan-100",
  "border-t-blue-100",
  "border-t-indigo-100",
  "border-t-violet-100",
  "border-t-purple-100",
  "border-t-pink-100",
  "border-t-rose-100",
];

const agePalette = (days: number) => {
  if (days < 10 && days >= 5) {
    return {
      borderTop: "border-green-200",
      badge: "bg-green-100 text-green-800",
    };
  }
  if (days < 15 && days >= 10) {
    return {
      borderTop: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800",
    };
  }
  return {
    borderTop: "border-red-200",
    badge: "bg-red-100 text-red-800",
  };
};

// Helpers
const msPerDay = 24 * 60 * 60 * 1000;
const toDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const diffDaysFromToday = (iso: string) => {
  const today = new Date();
  const d = toDate(iso);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const t1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.floor((t0 - t1) / msPerDay);
};
const relativeLabel = (days: number) => {
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};
// Format yyyy-mm-dd -> dd-mm-yyyy
const formatDDMMYYYY = (iso: string) => {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
};

const MultiCard: React.FC<MultiCardProps> = ({ dashboardData, loading }) => {
  const [isFullHeight, setIsFullHeight] = useState(false);
  const [pastDays, setPastDays] = useState<number | "all">("all");

  // 1) hooks first, no early returns before them
  const filteredData = useMemo(() => {
    if (!dashboardData) return {};
    const out: typeof dashboardData = {};
    for (const [deptName, dept] of Object.entries(dashboardData)) {
      const alerts =
        pastDays === "all"
          ? dept.alerts
          : dept.alerts.filter((a) => {
            const days = diffDaysFromToday(a.examDate);
            return days >= 0 && days <= pastDays;
          });
      out[deptName] = { ...dept, alerts };
    }
    return out;
  }, [dashboardData, pastDays]);

  const totalAlerts = useMemo(
    () => Object.values(filteredData).reduce((acc, dept) => acc + dept.alerts.length, 0),
    [filteredData]
  );

  // 2) graphData must also be before any return
  const graphData = useMemo(() => {
    let green = 0, yellow = 0, red = 0;
    if (!dashboardData) return { green, yellow, red };

    for (const dept of Object.values(dashboardData)) {
      const alerts =
        pastDays === "all"
          ? dept.alerts
          : dept.alerts.filter((a) => {
            const days = diffDaysFromToday(a.examDate);
            return days >= 0 && days <= pastDays;
          });

      for (const a of alerts) {
        const days = diffDaysFromToday(a.examDate);
        if (days < 0) continue;
        if (days < 10 && days >= 6) green++;
        else if (days < 15 && days >= 10) yellow++;
        else red++;
      }
    }
    return { green, yellow, red };
  }, [dashboardData, pastDays]);

  // 3) now it’s safe to return early
  if (loading) return <p className="p-4 text-gray-500">Loading dashboard…</p>;
  if (!dashboardData) return <p className="p-4 text-red-500">No data found.</p>;


  return (
    <>
      <AdminDashboardCards graphData={graphData} />
      <div className="bg-white rounded-2xl py-4 mt-6">
        {/* Controls */}
        <div className="flex items-center justify-between px-6 pt-2 mb-4">
          <div className="text-xl text-gray-900 font-medium">Department Exam Alerts</div>
        </div>

        {totalAlerts > 0 ? (
          <div className={`${isFullHeight ? "" : "max-h-[350px] overflow-hidden"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 py-4">
              {Object.entries(filteredData).map(([deptName, dept], i) => {
                const deptBorder = pastelBorders[i % pastelBorders.length];
                const childBorder = childTopBorders[i % childTopBorders.length];

                if (!dept.alerts.length) return null;

                return (
                  <div
                    key={i}
                    className={`relative border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow ${deptBorder} border-l-4`}
                  >
                    <h2 className="text-lg font-semibold text-gray-800">{deptName}</h2>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-700 text-sm">Department Code: {dept.departmentCode}</p>
                      <p className="text-gray-700 text-sm">{dept.alerts.length} Exam(s)</p>
                    </div>

                    <div className="mt-4 relative">
                      <Carousel
                        responsive={responsive}
                        infinite={false}
                        keyBoardControl
                        customLeftArrow={<CustomLeftArrow />}
                        customRightArrow={<CustomRightArrow />}
                        itemClass="px-2 py-3"
                      >
                        {dept.alerts.map((exam, j) => {
                          const days = diffDaysFromToday(exam.examDate);
                          const palette = agePalette(days);

                          return (
                            <div
                              key={j}
                              className={`relative border border-gray-200 rounded-lg p-4 flex flex-col items-start justify-between bg-white shadow-sm hover:shadow-md transition-shadow ${palette.borderTop}`}
                            >
                              {/* Relative time badge */}
                              <span
                                className={`absolute left-1/2 -translate-x-1/2 -top-3 text-[11px] px-2 py-0.5 rounded-full ${palette.badge}`}
                              >
                                {relativeLabel(days)}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">
                                  {exam.course} - <span className="text-xs">({exam.courseCode})</span>
                                </span>
                              </div>

                              <p className="text-xs text-gray-700 mt-1">{exam.examType}</p>

                              <p className="text-gray-500 text-[11px] mt-1 leading-snug">
                                Exam held on{" "}
                                <span className="font-semibold">{formatDate(exam.examDate)}</span>
                              </p>

                              <Link
                                href={`/exams/upload-exam?id=${exam.examId}`}
                                className="mt-3 text-sm border ms-auto border-gray-300 rounded-lg px-3 py-1 text-gray-700 hover:bg-gray-300 bg-slate-100"
                              >
                                Upload
                              </Link>
                            </div>
                          );
                        })}
                      </Carousel>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-5 px-6">
            <div className="w-full  text-center rounded-2xl border border-emerald-200 bg-gradient-to-b from-white to-emerald-50 backdrop-blur-sm p-10 shadow-md relative overflow-hidden">
              {/* Subtle floating confetti dots */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-10 w-2 h-2 bg-emerald-300 rounded-full animate-bounce"></div>
                <div className="absolute top-10 right-8 w-3 h-3 bg-emerald-200 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 left-1/3 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
              </div>

              {/* Icon */}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 ring-2 ring-emerald-200 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-emerald-700">All Clear!</h2>

              {/* Subtext */}
              <p className="mt-2 text-gray-600 text-sm leading-6">
                No pending exam alerts. Everything is running smoothly—departments are fully up to date.
              </p>

              {/* Extra cheerful touch */}
              <p className="mt-4 text-emerald-600 text-sm font-medium italic">
                Take a deep breath—today looks good. 🌿
              </p>

              {/* Footer */}
              <p className="mt-6 text-xs text-gray-400">Last checked {new Date().toLocaleString()}</p>
            </div>
          </div>


        )}


        {/* Show Expand/Collapse only if > 2 alerts */}
        {totalAlerts > 2 && (
          <div className="flex justify-end items-center mt-6 px-6">
            <Button onClick={() => setIsFullHeight((p) => !p)} color={"primary"} size="sm" className="!text-xs !h-auto !py-1 !rounded-4xl">
              {isFullHeight ? "View Less" : "View More"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default MultiCard;
