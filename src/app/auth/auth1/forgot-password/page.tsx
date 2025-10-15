import AdminForgot from '@/app/components/our-pages/forgot-password/AdminForgot'
import React, { Suspense } from 'react'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminForgot />
    </Suspense>
  )
}

export default Page
