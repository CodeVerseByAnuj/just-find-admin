"use client";
import React from "react";
import { Icon } from "@iconify/react";

const ProfessorCard = ({ data }: any) => {
  const ColorboxData = [
    {
      bg: "bg-gradient-to-br from-white to-slate-50",
      icon: "mdi:book-open-variant",
      iconBg: "bg-gradient-to-tr from-red-600 to-red-500",
      title: "No. of Courses",
      value: data?.totalCourses ?? "—",
    },
    {
      bg: "bg-gradient-to-br from-white to-slate-50",
      icon: "mdi:clipboard-text",
      iconBg: "bg-gradient-to-tr from-neutral-800 to-neutral-700",
      title: "No. of Exams",
      value: data?.totalExams ?? "—",
    },
    {
      bg: "bg-gradient-to-br from-white to-slate-50",
      icon: "mdi:clock-fast",
      iconBg: "bg-gradient-to-tr from-red-700 to-red-500",
      title: "Time Saved",
      value: data?.timeSaved ?? "—",
      unit: "hours",
    },
  ];

  return (
    <div className="overflow-x-auto mt-4">
      <div className="flex gap-6">
        {ColorboxData.map((item, index) => (
          <div
            key={index}
            className="lg:basis-1/3 md:basis-1/4 basis-full lg:shrink shrink-0"
          >
            <div
              className={`relative text-center px-5 py-8 rounded-2xl shadow-sm border border-slate-200 ${item.bg}`}
            >
              {/* Icon container */}
              <span
                className={`h-12 w-12 mx-auto flex items-center justify-center rounded-xl shadow ${item.iconBg}`}
              >
                <Icon icon={item.icon} className="text-white" height={24} />
              </span>

              {/* Title */}
              <p className="text-sm text-slate-700 mt-4 mb-2 font-medium">
                {item.title}
              </p>

              {/* Value */}
              <h4 className="text-2xl font-semibold text-slate-900">
                {item.value}
                {item.unit && (
                  <span className="ml-1 text-sm font-normal text-slate-500">
                    {item.unit}
                  </span>
                )}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessorCard;
