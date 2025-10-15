'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Pagination,
  TextInput,
} from 'flowbite-react'
import TitleCard from '../../shared/TitleBorderCard'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { fetchStudentExam } from '@/app/router/examStudent.router'
import type { ExamStudent } from '@/lib/schemas/examStudent.schema'
import { useSortableData } from '@/hooks/useSortableData'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10

function ExamStudent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: examStudents = [], isLoading, isError } = useQuery({
    queryKey: ['examStudents'],
    queryFn: fetchStudentExam,
  })

  // Filter exams based on search query
  const filteredExams = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return examStudents.filter(
      (exam) =>
        exam.course_name.toLowerCase().includes(query) ||
        exam.course_code.toLowerCase().includes(query) ||
        exam.exam_type.toLowerCase().includes(query)
    )
  }, [searchQuery, examStudents])

  // Flatten nested fields if necessary (marks_obtained can be null)
  const sortableExams = useMemo(() => {
    return filteredExams.map((exam) => ({
      ...exam,
      marks_obtained_val: exam.marks_obtained ?? -1, // allow sorting with "NA"
    }))
  }, [filteredExams])

  // Sorting hook
  const { sortedItems: sortedExams, requestSort, sortConfig } = useSortableData(
    sortableExams,
    'course_name'
  )

  const getSortIcons = (field: keyof typeof sortableExams[0]) => {
    const isActive = sortConfig.field === field
    return (
      <div className="flex flex-col ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            requestSort(field)
          }}
          className={`p-0 hover:bg-transparent ${
            isActive && sortConfig.direction === 'asc'
              ? 'text-blue-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Icon icon="solar:alt-arrow-up-bold" className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            requestSort(field)
          }}
          className={`p-0 hover:bg-transparent -mt-1 ${
            isActive && sortConfig.direction === 'desc'
              ? 'text-blue-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Icon icon="solar:alt-arrow-down-bold" className="w-3 h-3" />
        </button>
      </div>
    )
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedExams.length / ITEMS_PER_PAGE))
  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedExams.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedExams, currentPage])

  if (isLoading) return <p className="p-4">Loading exam students...</p>
  if (isError) return <p className="p-4 text-red-600">Failed to load exam students.</p>

  return (
    <div>
      <TitleCard title="Exams List">
        <section className="flex w-full justify-between mb-4 max-xsm:flex-col">
          <TextInput
            className="mb-4 w-full max-w-80"
            placeholder="Search by course name, code, or exam type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </section>

        <div className="border rounded-md border-ld overflow-x-auto overflow-y-hidden">
          <Table hoverable className="min-w-[600px]">
            <TableHead>
              <TableRow>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Course Name")} {getSortIcons('course_name')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Exam Type")} {getSortIcons('exam_type')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    Exam Date {getSortIcons('exam_date')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    Course Code {getSortIcons('course_code')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    Max Marks {getSortIcons('max_marks')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    Marks Obtained {getSortIcons('marks_obtained_val')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {paginatedExams.map((exam) => (
                <TableRow key={exam.exam_id}>
                  <TableCell>{toSentenceCase(exam.course_name)}</TableCell>
                  <TableCell>{toSentenceCase(exam.exam_type)}</TableCell>
                  <TableCell>{exam.exam_date}</TableCell>
                  <TableCell>{exam.course_code}</TableCell>
                  <TableCell>{exam.max_marks}</TableCell>
                  <TableCell>{exam.marks_obtained ?? 'NA'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Link href={`/exam-student/${exam.exam_id}`}>
                        <button className="text-gray-500">
                          <Icon icon="carbon:view" height={20} />
                        </button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedExams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </TitleCard>
    </div>
  )
}

export default ExamStudent
