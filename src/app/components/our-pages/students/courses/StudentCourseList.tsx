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
import AddStudentCourse from "./AddStudentCourse";
import { useQuery } from "@tanstack/react-query";
import { getStudentCourses } from "@/app/router/student-courses.router";
import { useSearchParams } from "next/navigation";
import {
  studentCourseSchema,
  StudentCourse,
} from "@/lib/schemas/student-courses.schema";
import { z } from "zod";
import EditStudentCourse from "./EditStudentCourse";
import DeleteStudentCourse from "./DeleteStudentCourse";
import { useState, useEffect, useMemo } from "react";
import { getStudentById } from "@/app/router/student.router";
import { useRouter } from "next/navigation";
import { toSentenceCase } from "@/utils/tableHeadFormat/headerTitle";

function StudentCourseList() {

  const router = useRouter();
  const ITEMS_PER_PAGE = 10;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get("studentId");
  const departmentIdParam = searchParams.get("departmentId");
  const [studentName, setStudentName] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    getStudentById(Number(studentIdParam))
      .then((student) => {
        setStudentName(`${student.data.first_name} ${student.data.last_name}`);
        console.log("Fetched student:", student);
      })
      .catch((error) => {
        console.error("Error fetching student:", error);
      });
  }, [studentIdParam])

  // Validate studentId
  const studentId: number | null =
    studentIdParam && !isNaN(Number(studentIdParam))
      ? Number(studentIdParam)
      : null;

  const departmentId: number | null =
    departmentIdParam && !isNaN(Number(departmentIdParam))
      ? Number(departmentIdParam)
      : null;    

  const { data, isLoading, isError, refetch } = useQuery<{
    data: StudentCourse[];
  }>({
    queryKey: ["student-courses", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");

      const res = await getStudentCourses(studentId);

      const parsed = z.object({ data: z.array(studentCourseSchema) }).parse(res);
      return parsed;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Filter + Paginate data
  const filteredCourses = useMemo(() => {
    if (!data?.data) return [];

    const query = debouncedSearch.toLowerCase();

    return data.data.filter((item) => {
      const courseName = item.course?.title?.toLowerCase() || "";
      const professorName = `${item.professor?.first_name || ""} ${item.professor?.last_name || ""
        }`.toLowerCase();

      return (
        courseName.includes(query) || professorName.includes(query)
      );
    });
  }, [data?.data, debouncedSearch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  );

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  if (!studentId) {
    return (
      <div>
        <TitleCard title="Course List">
          <div className="text-center py-8 text-red-500">
            Student ID is required to view courses.
          </div>
        </TitleCard>
      </div>
    );
  }

  return (
    <div>
      <TitleCard title={`${studentName}'s Course List`}>
        <section className="flex w-full justify-between">
          <div className="mb-4 w-sm">
            <TextInput
              placeholder="Search by Course/Professor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {studentId !== null && departmentId !== null && (
            <AddStudentCourse studentId={studentId} departmentId={departmentId} onSuccess={refetch} />
          )}
        </section>
        <div className="overflow-x-auto border rounded-md border-ld overflow-hidden">
          <Table hoverable className="min-w-[700px]">
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-1/3">{toSentenceCase("Course")}</TableHeadCell>
                <TableHeadCell className="w-1/3">{toSentenceCase("Professor")}</TableHeadCell>
                {/* <TableHeadCell className="w-1/3 text-center">Semester</TableHeadCell> */}
                <TableHeadCell className="w-[150px] text-center">
                  Action
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-red-500"
                  >
                    Error loading courses. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {toSentenceCase(item.course?.title)}
                    </TableCell>
                    <TableCell>
                      {toSentenceCase(`${item.professor?.first_name ?? ""} ${item.professor?.last_name ?? ""
                        }`)}
                    </TableCell>
                    {/* <TableCell className="capitalize text-center">
                      -
                    </TableCell> */}
                    <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        <EditStudentCourse
                          studentCourseID={item.id}
                          onSuccess={refetch}
                        />
                        <DeleteStudentCourse
                          id={item.id}
                          name={item.course?.title}
                          refetch={refetch}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex justify-center relative">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <Button
            type="button"
            color="light"
            onClick={() => router.push('/students')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2"
          >
            Back
          </Button>
        </div>
      </TitleCard>
    </div>
  );
}

export default StudentCourseList;
