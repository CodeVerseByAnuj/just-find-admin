"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { BookCheck, CheckCircle2 } from "lucide-react";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type GraphData = { green: number; yellow: number; red: number };

type AdminDashboardCardsProps = {
  graphData: GraphData;                // { green: 5, yellow: 10, red: 3 }
  totalExamsSelected?: number;         // optional so you can feed real numbers later
  submittedEvaluations?: number;       // optional
};

const AdminDashboardCards: React.FC<AdminDashboardCardsProps> = ({
  graphData,
  totalExamsSelected = 42,
  submittedEvaluations = 27,
}) => {
  const series = useMemo(
    () => [graphData.green || 0, graphData.yellow || 0, graphData.red || 0],
    [graphData]
  );

  const labels = ["6-10 Days", "11-15 Days", "15+ Days"];

  const options: ApexOptions = useMemo(() => {
    const colors = ["#46e67f", "#ffeb23", "#ff4545"]; // green, yellow, red

    return {
      chart: {
        type: "donut",
        fontFamily: "inherit",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: { enabled: true, delay: 150 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      labels,
      colors,
      legend: {
        position: "bottom",
        fontSize: "13px",
        fontWeight: 500,
        labels: { colors: "#475569" },
        markers: { width: 10, height: 10, radius: 10, offsetX: -4 },
        itemMargin: { horizontal: 8, vertical: 6 },
      },
      dataLabels: {
        enabled: true,
        formatter: (_val, opts) => {
          // show absolute count on each slice
          const idx = opts.seriesIndex ?? 0;
          const s = (opts.w?.globals?.series as number[] | undefined) ?? [];
          return String(s[idx] ?? 0);
        },
        style: { fontSize: "14px", fontWeight: 700, colors: ["#ffffff"] },
        dropShadow: { enabled: true, top: 1, left: 1, blur: 2, opacity: 0.5 },
      },
      tooltip: {
        enabled: true,
        y: { formatter: (val: number) => `${val} exam${val === 1 ? "" : "s"}` },
        style: { fontSize: "13px" },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "45%",
            labels: {
              show: true,
              name: { show: false },
              value: { show: false },
              total: {
                show: true,
                label: "Exams",
                fontSize: "14px",
                fontWeight: 500,
                color: "#475569",
                formatter: (w) => {
                  const totals = (w?.globals?.seriesTotals as number[] | undefined) ?? [];
                  return String(totals.reduce((a, b) => a + b, 0));
                },
              },
            },
          },
        },
      },
      states: {
        hover: { filter: { type: "lighten", value: 0.15 } },
        active: { filter: { type: "darken", value: 0.15 } },
      },
      stroke: { width: 0 },
    };
  }, [labels]);

  return (
    <div className="w-full p-6 bg-white rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Exam Scheduled */}
        <div className="relative rounded-2xl shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-6 py-8">
            <span className="h-12 w-12 flex items-center justify-center rounded-xl shadow bg-gradient-to-tr from-indigo-600 to-indigo-400">
              <BookCheck className="h-6 w-6 text-white" />
            </span>
            <p className="text-sm text-slate-600 mt-4 mb-2">Total Exam Scheduled</p>
            <h3 className="text-3xl font-semibold text-slate-900">
              {totalExamsSelected}
            </h3>
          </div>
        </div>

        {/* Submitted Evaluation */}
        <div className="relative rounded-2xl shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-6 py-8">
            <span className="h-12 w-12 flex items-center justify-center rounded-xl shadow bg-gradient-to-tr from-emerald-500 to-emerald-400">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </span>
            <p className="text-sm text-slate-600 mt-4 mb-2">Submitted Evaluation</p>
            <h3 className="text-3xl font-semibold text-slate-900">
              {submittedEvaluations}
            </h3>
          </div>
        </div>

        {/* Donut chart */}
        <div className="relative rounded-2xl shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="flex flex-col items-center justify-center h-full px-4 py-6">
            <h3 className="text-slate-700 text-sm font-semibold mb-4 tracking-wide text-center">
              Pending Evaluation
            </h3>
            <div className="w-full flex items-center justify-center">
              <ApexChart options={options} series={series} type="donut" height={240} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardCards;
