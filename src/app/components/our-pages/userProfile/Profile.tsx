"use client"
import React, { useEffect, useState } from 'react'
import StudentProfile from './StudentProfile'
import AdminProfile from './AdminProfile'

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

const Profile = () => {
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
      {userRole === 3 && <StudentProfile />}
      {(userRole === 1 || userRole === 2) && <AdminProfile />}
      {!userRole && <p>No profile available</p>}
    </>
  )
}

export default Profile
