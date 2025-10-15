"use client";
import React from "react";
import { Icon } from "@iconify/react";

const StudentCard = ({ studentCard }: any) => {
  const ColorboxData = [
    {
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      icon: "mdi:book-open-variant", // Courses
      color: "bg-gradient-to-tr from-indigo-600 to-indigo-400",
      title: "Courses",
      price: studentCard?.totalCourses ?? "0",
    },
    {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      icon: "mdi:school", // Credits
      color: "bg-gradient-to-tr from-amber-500 to-amber-400",
      title: "Credits",
      price: studentCard?.totalCredits ?? "0",
    },
    {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      icon: "mdi:star-circle", // CGPA
      color: "bg-gradient-to-tr from-emerald-500 to-emerald-400",
      title: "CGPA",
      price: studentCard?.CGPA ?? "0",
    },
    {
      bg: "bg-gradient-to-br from-sky-50 to-sky-100",
      icon: "mdi:trophy", // Dept Rank
      color: "bg-gradient-to-tr from-sky-500 to-sky-400",
      title: "DR",
      price: studentCard?.deptRank ?? "0",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex mt-5 gap-6">
        {ColorboxData.map((item, index) => (
          <div
            className="lg:basis-1/3 md:basis-1/4 basis-full lg:shrink shrink-0"
            key={index}
          >
            <div
              className={`relative text-center px-5 py-8 rounded-2xl shadow-sm transition-transform duration-200 hover:translate-y-[-4px] ${item.bg}`}
            >
              {/* Icon */}
              <span
                className={`h-12 w-12 mx-auto flex items-center justify-center rounded-xl shadow ${item.color}`}
              >
                <Icon icon={item.icon} className="text-white" height={24} />
              </span>

              {/* Title */}
              <p className="text-sm text-slate-600 mt-4 mb-2">{item.title}</p>

              {/* Value */}
              <h4 className="text-2xl font-semibold text-slate-900">
                {item.price}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCard;
