"use client"
import React, { useState, useEffect } from "react";
import type { Metadata } from "next";
import AdminDashboard from "../components/our-pages/admin-dashboard/AdminDashboard";
import ColumnAdminChart from "../components/our-pages/admin-dashboard/ColumnAdminChart";

// export const metadata: Metadata = {
//   title: "Dashboard 3",
// };

interface UserDetails {
  access_token: string
  user_type: number
  first_name: string
  last_name: string
  lat: number
  lng: number
  profile_image: string
  role_id: number
  role: string
  menu_links: string[]
  institution_id: number
}

const page = () => {

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_details')
      if (stored) {
        try {
          setUserDetails(JSON.parse(stored))
        } catch (err) {
          console.error('Invalid user_details in localStorage:', err)
        }
      }
    }
  }, [])

  const userRole = userDetails?.role_id

  return (
    <>
      {/* Admin Dashboard */}
      {(userRole === 1) && <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <AdminDashboard />
        </div>
      </div>}
    </>
  );
};

export default page;
