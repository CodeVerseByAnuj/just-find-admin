// ChatBox.tsx
import React from "react";
import { User, GraduationCap } from "lucide-react";

export type Role = "professor" | "student";

type Props = {
  professorRemarks: string | null;
  studentRemark: string | null;
};

export default function ChatBox({
  studentRemark, professorRemarks,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 mb-3">Flag Discussion</h3>
      </div>

      <div
        className="space-y-5 mb-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-300"
      // visually separate the messages area
      >
        {/* Student message */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center border border-green-100">
              <User className="h-4 w-4 text-green-600" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Student
              </span>
            </div>

            <div className="mt-2">
              <div className="block rounded-md bg-green-50 border border-green-100 px-4 py-2 text-gray-800 text-sm leading-relaxed">
                {studentRemark || <span className="text-gray-400">No student remarks yet.</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Professor message */}
        <div className="flex items-start gap-3 mt-3">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-100">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Professor
              </span>
            </div>

            <div className="mt-2">
              <div className="block rounded-md bg-blue-50 border border-gray-100 px-4 py-2 text-gray-800 text-sm leading-relaxed shadow-sm">
                {professorRemarks || <span className="text-gray-400">No professor remarks yet.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
