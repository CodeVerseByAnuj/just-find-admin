// "use client";
// import React from "react";
// import { Card, CardContent } from "../../shadcn-ui/Default-Ui/card";
// import { Spinner } from "flowbite-react";
// import { adminAlertSchema } from "@/lib/schemas/adminDashboard.schema";
// import Link from "next/link";
// import { z } from "zod";

// // Type for a single alert
// type ExamAlert = z.infer<typeof adminAlertSchema>;

// // Props for the component
// type Props = {
//     alerts?: ExamAlert[];
//     loading?: boolean;
// };

// function AlertCard({ alerts = [], loading = false }: Props) {
//     const colorVariants = [
//         "bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200 hover:from-blue-100 hover:to-indigo-150",
//         "bg-gradient-to-r from-purple-50 to-pink-100 border-purple-200 hover:from-purple-100 hover:to-pink-150"
//     ];

//     return (
//         <Card className="h-full">
//             {/* Header */}
//             <div className="mb-6 p-4 border-b border-gray-100">
//                 <h3 className="text-xl font-bold text-gray-800">  <span className="text-3xl">📢</span>
//                     Review Alerts: <span className="font-semibold test-lg text-gray-800">Pending Answer Sheets</span></h3>
//             </div>

//             {/* Alerts */}
//             <CardContent className="space-y-4 max-h-72 overflow-y-auto">
//                 {loading ? (
//                     <div className="flex justify-center items-center py-10">
//                         <Spinner size="lg" />
//                         <span className="ml-3 text-gray-600">Loading alerts...</span>
//                     </div>
//                 ) : alerts.length === 0 ? (
//                     <div className="text-center text-gray-500 py-10">No alerts available.</div>
//                 ) : (
//                     alerts.map((alert, index) => (
//                         <Link key={alert.examId} href={`/exams/upload-exam?id=${alert.examId}`}>
//                             <div
//                                 className={`p-3 mb-4 rounded-2xl transition-all duration-300 border-2 cursor-pointer transform ${colorVariants[index % colorVariants.length]
//                                     }`}
//                             >

//                                 {/* Course Information */}
//                                 <div className="flex justify-between space-y-3">
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-lg">🏛️</span>
//                                         <div className="flex items-center gap-2">
//                                             <div className="font-semibold text-gray-800">Department :</div>
//                                             <div className="text-sm text-gray-600">{alert.department}</div>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-2">
//                                         <span className="text-lg">📚</span>
//                                         <div className="flex items-center gap-2">
//                                             <div className="font-semibold text-gray-800">Course Code:</div>
//                                             <div className="text-sm text-gray-600">{alert.course} ({alert.courseCode})</div>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-2">
//                                         <span className="text-lg">📝</span>
//                                         <div className="flex items-center gap-2">
//                                             <div className="font-semibold text-gray-800">Exam Type:</div>
//                                             <div className="text-sm text-gray-600">{alert.examType}</div>
//                                         </div>
//                                     </div>

//                                 </div>
//                                 {/* Message */}
//                                 <div className="mt-3 p-3 bg-white/60 rounded-lg border border-gray-200">
//                                     <div className="text-sm text-gray-700 font-medium">{alert.message}</div>
//                                 </div>

//                                 {/* Click indicator */}
//                                 <div className="mt-4 flex items-center justify-end text-xs text-gray-500">
//                                     <span>Click to review</span>
//                                     <span className="ml-1">→</span>
//                                 </div>
//                             </div>
//                         </Link>
//                     ))
//                 )}
//             </CardContent>
//         </Card >
//     );
// }

// export default AlertCard;


import React from 'react'

const AlertCard = () => {
  return (
    <div>AlertCard</div>
  )
}

export default AlertCard