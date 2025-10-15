"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ChartData: any = {
  series: [
    {
      name: "2024",
      data: [420, 510, 480, 600, 750, 680, 720, 690, 740],
    },
    {
      name: "2023",
      data: [400, 480, 460, 580, 700, 640, 690, 660, 710],
    },
  ],
  chart: {
    toolbar: { show: false },
    type: "bar",
    fontFamily: "inherit",
    foreColor: "#adb0bb",
    height: 295,
    stacked: true,
    offsetX: 0,
    offsetY: 0,
  },
  colors: ["var(--color-primary)", "var(--color-error)"],
  plotOptions: {
    bar: {
      horizontal: false,
      barHeight: "60%",
      columnWidth: "15%",
      borderRadius: [6],
      borderRadiusApplication: "end",
      borderRadiusWhenStacked: "all",
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: {
    show: true,
    padding: { top: 0, bottom: 0, right: 0 },
    borderColor: "rgba(0,0,0,0.05)",
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  yaxis: {
    min: 0,
    max: 1500,
    tickAmount: 4,
  },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    labels: {
      style: { fontSize: "13px", colors: "#adb0bb", fontWeight: "400" },
    },
  },
  tooltip: { theme: "dark" },
};

const ThaparAdmissionsChart = () => {
  return (
    <CardBox>
      <div className="md:flex justify-between items-center">
        <div>
          <h5 className="card-title">Admissions Forecast</h5>
          <p className="card-subtitle">Comparison of 2023 & 2024 Admission Trends</p>
        </div>
        <div className="flex gap-5 items-center md:mt-0 mt-4">
          <div className="flex gap-2 text-sm items-center">
            <span className="bg-primary rounded-full h-2 w-2"></span>
            <span className="text-ld opacity-80">2024</span>
          </div>
          <div className="flex gap-2 text-sm text-ld items-center">
            <span className="bg-error rounded-full h-2 w-2"></span>
            <span className="text-ld opacity-80">2023</span>
          </div>
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

      <div className="flex md:flex-row flex-col gap-3 mt-4">
        <div className="md:basis-1/3 basis-full">
          <div className="flex gap-3 items-center">
            <span className="h-12 w-12 shrink-0 flex items-center justify-center bg-muted dark:bg-dark rounded-tw">
              <Icon icon="mdi:account-school" className="text-ld" height={24} />
            </span>
            <div>
              <p>Total Admissions</p>
              <h5 className="font-medium text-lg">5,820</h5>
            </div>
          </div>
        </div>
        <div className="md:basis-1/3 basis-full">
          <div className="flex gap-3 items-center">
            <span className="h-12 w-12 shrink-0 flex items-center justify-center bg-lightprimary rounded-tw">
              <Icon icon="mdi:school-outline" className="text-primary" height={24} />
            </span>
            <div>
              <p>Graduates</p>
              <h5 className="font-medium text-lg">4,260</h5>
            </div>
          </div>
        </div>
        <div className="md:basis-1/3 basis-full">
          <div className="flex gap-3 items-center">
            <span className="h-12 w-12 shrink-0 flex items-center justify-center bg-lighterror rounded-tw">
              <Icon icon="mdi:cash-multiple" className="text-error" height={24} />
            </span>
            <div>
              <p>Scholarships Awarded</p>
              <h5 className="font-medium text-lg">1,350</h5>
            </div>
          </div>
        </div>
      </div>
    </CardBox>
  );
};

export default ThaparAdmissionsChart;
