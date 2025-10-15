"use client"

import React, { useState, useEffect } from "react"
import CardBox from "../../shared/CardBox"
import { Select } from "flowbite-react"
import { useQuery } from "@tanstack/react-query"
import ColumnAdminChart from "./ColumnAdminChart"
import { getAdminDashboard, getAdminDashboardAlerts } from "@/app/router/admindashboard.router"
import AlertCard from "./AlertCard"
import MultiCard from "./MultiCard"

function AdminDashboard() {
  const [selectedCourse, setSelectedCourse] = useState("")

  // Fetch admin dashboard (all courses & semesters with counts)
  const { data: getCourseExam, isLoading: adminLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getAdminDashboard,
  })

  // Fetch admin alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["adminDashboardAlerts"],
    queryFn: getAdminDashboardAlerts,
  })

  // Build dropdown options from course names
  const courseOptions = getCourseExam
    ? Object.keys(getCourseExam).map((course) => (
      <option key={course} value={course}>
        {course}
      </option>
    ))
    : []

  // Set default course when data arrives
  useEffect(() => {
    if (getCourseExam && !selectedCourse) {
      const firstCourse = Object.keys(getCourseExam)[0]
      if (firstCourse) setSelectedCourse(firstCourse)
    }
  }, [getCourseExam, selectedCourse])

  // Extract selected course data for chart
  const selectedCourseData =
    selectedCourse && getCourseExam ? { [selectedCourse]: getCourseExam[selectedCourse] } : {}

  return (
    <div className="grid grid-cols-12 gap-6 md:px-0 px-6">
      <div className="col-span-12 rounded-xl p-2">
        {/* Pass only the selected course to chart */}
        {/* <h2 className="text-xl mb-2">Alerts</h2> */}
        <MultiCard dashboardData={alertsData} loading={adminLoading} />
      </div>
      {/* <div className="col-span-12">
        <CardBox>
          <section className="flex flex-col sm:flex-row sm:justify-end">
            <div className="my-4 !mb-4 sm:my-0 md:max-w-[300px]">
              <Select
                className="min-w-[200px]"
                id="courseId"
                disabled={adminLoading}
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {adminLoading ? (
                  <option value="">Loading courses...</option>
                ) : (
                  <span className="truncate block max-w-[200px]">
                    {courseOptions}
                  </span>
                )}
              </Select>
            </div>
          </section>
        <ColumnAdminChart getCourseExam={selectedCourseData} />
          

        </CardBox>
      </div> */}

      
    </div>
  )
}

export default AdminDashboard
