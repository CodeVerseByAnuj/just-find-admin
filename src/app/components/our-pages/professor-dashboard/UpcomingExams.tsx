"use client";
import { Card, CardContent } from "../../shadcn-ui/Default-Ui/card";
import { formatDate } from "@/utils/dateFormat/formatDate";
import { Calendar, Clock, BookOpen } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

interface UpcomingExamsProps {
  exams: any[];
  isLoading: boolean;
  error: any;
}

/** ✅ Hook: detect text overflow (stays the same) */
const useIsTruncated = (text: string) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return { ref, truncated };
};

/** ✅ Child row component: hooks live here, not in the map */
function UpcomingExamRow({ exam }: { exam: any }) {
  const title = exam?.course?.title ?? "No Course";
  const code = exam?.course?.code ?? "-";
  const type = exam?.exam_type?.title ?? "-";
  const date = formatDate(exam?.exam_date) ?? "-";
  const time = exam?.exam_time ?? "-";

  const { ref, truncated } = useIsTruncated(title);

  return (
    <div
      className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
    >
      {/* Course Title */}
      <div className="flex justify-between items-center mb-2 gap-2">
        <div className="max-w-[70%] sm:max-w-[75%] md:max-w-[80%] lg:max-w-[85%]">
          <span
            ref={ref}
            className="font-semibold text-gray-800 truncate block"
            title={truncated ? title : undefined}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Exam Type & Code */}
      <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-1 sm:gap-2">
        <span className="flex items-center gap-1 font-medium text-gray-700">
          <BookOpen size={16} /> {type}
        </span>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-gray-800 rounded-md whitespace-nowrap">
          {code}
        </span>
      </div>

      {/* Date & Time */}
      <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-1 sm:gap-2">
        <span className="flex items-center gap-1 font-medium text-gray-800">
          <Calendar size={16} />
          {date}
          <Clock size={16} className="ml-2" />
          {time}
        </span>
      </div>
    </div>
  );
}

const UpcomingExams: React.FC<UpcomingExamsProps> = ({ exams, isLoading, error }) => {
  if (isLoading) return <div>Loading upcoming exams...</div>;
  if (error) return <div>Error loading upcoming exams.</div>;
  // if (!exams?.length) return <div>No upcoming exams found.</div>;

  return (
    <Card className="h-full shadow-lg rounded-2xl border border-gray-200">
      <div className="mb-6 p-4 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">📚 Upcoming Exams</h3>
      </div>

      {/* Keep scroll on ONE element to avoid double scrollbars */}
      <CardContent className="space-y-4 max-h-[17rem] overflow-y-auto">
        {exams.map((exam: any) => (
          <UpcomingExamRow key={exam.id} exam={exam} />
        ))}
      </CardContent>
    </Card>
  );
};

export default UpcomingExams;
