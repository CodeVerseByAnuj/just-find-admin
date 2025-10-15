import type { ExamResultResponse } from "@/lib/schemas/examProfessor.schema";
import { Icon } from "@iconify/react";

type StatusCardProps = {
  examStudents: ExamResultResponse;
  isLoading: boolean;
  isError: boolean;
};

const StatusCard = ({ examStudents, isLoading, isError }: StatusCardProps) => {
  const exam = examStudents.exam;
  const stats = examStudents.stats;

  const formatValue = (val: any) => {
    if (typeof val === "number") {
      return Number.isInteger(val) ? val : val.toFixed(2);
    }
    return val ?? "-";
  };

  const ColorboxData = [
    {
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      icon: "solar:calendar-date-linear",
      color: "bg-gradient-to-tr from-indigo-600 to-indigo-400",
      title: "Exam Date",
      price: exam?.exam_date
        ? new Date(exam.exam_date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        : "-",
    },
    {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      icon: "solar:chart-linear",
      color: "bg-gradient-to-tr from-amber-500 to-amber-400",
      title: "Average Score",
      price: formatValue(stats?.averageScore),
    },
    {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      icon: "solar:medal-ribbon-star-linear",
      color: "bg-gradient-to-tr from-emerald-500 to-emerald-400",
      title: "Top Score",
      price: formatValue(stats?.topScore),
    },
    {
      bg: "bg-gradient-to-br from-rose-50 to-rose-100",
      icon: "solar:hourglass-line-linear",
      color: "bg-gradient-to-tr from-rose-500 to-rose-400",
      title: "Pending Evaluation",
      price: formatValue(stats?.pendingEvaluations),
    },
    {
      bg: "bg-gradient-to-br from-teal-50 to-teal-100",
      icon: "solar:users-group-rounded-linear",
      color: "bg-gradient-to-tr from-teal-500 to-teal-400",
      title: "Students Appeared",
      price: formatValue(stats?.studentsAppeared),
    },
    {
      bg: "bg-gradient-to-br from-sky-50 to-sky-100",
      icon: "solar:chart-square-linear",
      color: "bg-gradient-to-tr from-sky-500 to-sky-400",
      title: "Median Score",
      price: formatValue(stats?.medianScore),
    },
    {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      icon: "solar:graph-down-broken",
      color: "bg-gradient-to-tr from-orange-500 to-orange-400",
      title: "Bottom Score",
      price: formatValue(stats?.bottomScrore),
    },
    {
      bg: "bg-gradient-to-br from-pink-50 to-pink-100",
      icon: "solar:flag-linear",
      color: "bg-gradient-to-tr from-pink-500 to-pink-400",
      title: "Flagged Evaluations",
      price: formatValue(stats?.flaggedEvaluations),
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data.</div>;

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-12 gap-6">
        {ColorboxData.map((item, index) => (
          <div className="col-span-12 md:col-span-6 lg:col-span-3" key={index}>
            <div
              className={`text-center px-5 py-8 rounded-2xl shadow-sm ${item.bg}`}
            >
              <span
                className={`h-12 w-12 mx-auto flex items-center justify-center rounded-xl shadow ${item.color}`}
              >
                <Icon icon={item.icon} className="text-white" height={24} />
              </span>
              <p className="text-sm text-slate-600 mt-4 mb-2">{item.title}</p>
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

export default StatusCard;
