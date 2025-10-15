"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Pagination,
  Button,
} from "flowbite-react";
import TitleCard from "@/app/components/shared/TitleBorderCard";
import AddStudentCourse from "./AddDepartmentStudent";
import EditStudentCourse from "./EditDepartmentStudent";
import DeleteStudentCourse from "./DeleteDepartmentStudent";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSortableData } from "@/hooks/useSortableData";
import { Icon } from "@iconify/react";

/**
 * This component is fully hardcoded — no API calls.
 * Replace the `HARD_CODED_COURSES` below with whatever test data you like.
 */

const ITEMS_PER_PAGE = 10;

const HARD_CODED_COURSES = [
  {
    id: 1,
    course: { title: "Algorithms & Data Structures" },
    professor: { first_name: "Alice", last_name: "Johnson" },
    department: "Computer Science",
  },
  {
    id: 2,
    course: { title: "Operating Systems" },
    professor: { first_name: "Bob", last_name: "Smith" },
    department: "Computer Science",
  },
  {
    id: 3,
    course: { title: "Database Systems" },
    professor: { first_name: "Carol", last_name: "Lee" },
    department: "Information Technology",
  },
  {
    id: 4,
    course: { title: "Computer Networks" },
    professor: { first_name: "David", last_name: "Wong" },
    department: "Electronics & Communication",
  },
  {
    id: 5,
    course: { title: "Software Engineering" },
    professor: { first_name: "Eva", last_name: "Khan" },
    department: "Software Engineering",
  },
  {
    id: 6,
    course: { title: "Machine Learning" },
    professor: { first_name: "Frank", last_name: "Garcia" },
    department: "Artificial Intelligence",
  },
  {
    id: 7,
    course: { title: "Web Technologies" },
    professor: { first_name: "Grace", last_name: "Patel" },
    department: "Information Technology",
  },
  {
    id: 8,
    course: { title: "Compiler Design" },
    professor: { first_name: "Hank", last_name: "Nguyen" },
    department: "Computer Science",
  },
  {
    id: 9,
    course: { title: "Discrete Mathematics" },
    professor: { first_name: "Ivy", last_name: "Brown" },
    department: "Mathematics",
  },
  {
    id: 10,
    course: { title: "Parallel Computing" },
    professor: { first_name: "Jack", last_name: "Wilson" },
    department: "High Performance Computing",
  },
  {
    id: 11,
    course: { title: "Information Security" },
    professor: { first_name: "Karen", last_name: "D'Souza" },
    department: "Cybersecurity",
  },
  {
    id: 12,
    course: { title: "Cloud Computing" },
    professor: { first_name: "Liam", last_name: "Martinez" },
    department: "Information Technology",
  },
];

type FlatRow = {
  id: number;
  courseTitle: string;
  professorName: string;
  department: string;
  original: any;
};

function DepartmentStudentList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get("studentId");
  const departmentIdParam = searchParams.get("departmentId");

  // If params are missing, we still render a hardcoded UI.
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Hardcoded studentName (you can change this literal easily)
  const [studentName, setStudentName] = useState("John Doe");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Validate studentId (still uses URL param if present)
  const studentId: number | null =
    studentIdParam && !isNaN(Number(studentIdParam))
      ? Number(studentIdParam)
      : null;

  const departmentId: number | null =
    departmentIdParam && !isNaN(Number(departmentIdParam))
      ? Number(departmentIdParam)
      : null;

  // Filter raw data by search
  const filteredRaw = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return HARD_CODED_COURSES;
    return HARD_CODED_COURSES.filter((item) => {
      const courseName = item.course?.title?.toLowerCase() || "";
      const professorName = `${item.professor?.first_name || ""} ${item.professor?.last_name || ""
        }`.toLowerCase();
      return courseName.includes(q) || professorName.includes(q);
    });
  }, [debouncedSearch]);

  // Flatten rows so sorting hook can sort simple keys
  const flattenedRows = useMemo<FlatRow[]>(
    () =>
      filteredRaw.map((item) => {
        const courseTitle = (item.course?.title ?? "").toString();
        const professorName = `${item.professor?.first_name ?? ""} ${item.professor?.last_name ?? ""}`.trim();
        const department = (item.department ?? "").toString();
        return {
          id: item.id,
          courseTitle,
          professorName,
          department,
          original: item,
        };
      }),
    [filteredRaw]
  );

  // useSortableData on flattened rows with default sort key courseTitle
  const { sortedItems: sortedRows, requestSort, sortConfig } = useSortableData<FlatRow>(
    flattenedRows,
    "courseTitle"
  );

  // Pagination computed from sortedRows
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / ITEMS_PER_PAGE));
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedRows, currentPage]);

  // UI: helper to render sort icons (similar to your department list)
  const getSortIcons = (field: keyof FlatRow) => {
    const isActive = sortConfig.field === field;
    return (
      <div className="flex flex-col ml-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            requestSort(field);
          }}
          className={`p-0 hover:bg-transparent ${isActive && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          aria-label={`Sort ${String(field)} ascending`}
        >
          <Icon icon="solar:alt-arrow-up-bold" className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            requestSort(field);
          }}
          className={`p-0 hover:bg-transparent -mt-1 ${isActive && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          aria-label={`Sort ${String(field)} descending`}
        >
          <Icon icon="solar:alt-arrow-down-bold" className="w-3 h-3" />
        </button>
      </div>
    );
  };

  // No API calls here — the Add/Edit/Delete components are left in place,
  // but we pass noop handlers so they don't attempt to refetch anything.
  const noop = () => {};

  return (
    <div>
      <TitleCard title="Department Student List">
        <section className="flex w-full justify-between">
          <div className="mb-4 w-sm">
            <TextInput
              placeholder="Search by Course/Professor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <AddStudentCourse />
        </section>

        <div className="overflow-x-auto border rounded-md border-ld overflow-hidden">
          <Table hoverable className="min-w-[700px]">
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-1/3">
                  <div className="flex items-center">
                    <span>Course</span>
                    {getSortIcons("courseTitle")}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-1/3">
                  <div className="flex items-center">
                    <span>Professor</span>
                    {getSortIcons("professorName")}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-1/3">
                  <div className="flex items-center">
                    <span>Department</span>
                    {getSortIcons("department")}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-[150px] text-center">Action</TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => {
                  const item = row.original;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="capitalize">{row.courseTitle}</TableCell>
                      <TableCell>
                        {row.professorName}
                      </TableCell>
                      <TableCell className="capitalize">{row.department}</TableCell>
                      <TableCell>
                        <div className="flex justify-center items-center gap-2">
                          <EditStudentCourse studentCourseID={item.id} onSuccess={noop} />
                          <DeleteStudentCourse id={item.id} name={item.course?.title} refetch={noop} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-center relative">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

          <Button
            type="button"
            color="secondary"
            onClick={() => router.push("/students")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2"
          >
            Back
          </Button>
        </div>
      </TitleCard>
    </div>
  );
}

export default DepartmentStudentList;
