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
import { fetchExamProfessors } from '@/app/router/examProfessor.router'
import type { ExamProfessor } from '@/lib/schemas/examProfessor.schema'
import { useSortableData } from '@/hooks/useSortableData'
import PublishedExam from '../exam-portal/PublishedExam'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10

function ExamProfessor() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: examProfessors = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['examProfessors'],
    queryFn: fetchExamProfessors,
  })

  // Filter exams based on search query
  const filteredExams = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return examProfessors.filter(
      (exam) =>
        exam.title.toLowerCase().includes(query) ||
        exam.code.toLowerCase().includes(query) ||
        exam.exam_type.title.toLowerCase().includes(query)
    )
  }, [searchQuery, examProfessors])

  // Flatten nested fields for sorting
  const sortableExams = useMemo(() => {
    return filteredExams.map((exam) => ({
      ...exam,
      exam_type_title: exam.exam_type.title,
    }))
  }, [filteredExams])

  // Sorting hook
  const { sortedItems: sortedExams, requestSort, sortConfig } = useSortableData(
    sortableExams,
    'title'
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
          className={`p-0 hover:bg-transparent ${isActive && sortConfig.direction === 'asc'
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
          className={`p-0 hover:bg-transparent -mt-1 ${isActive && sortConfig.direction === 'desc'
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

  if (isLoading) return <p className="p-4">Loading exam professors...</p>
  if (isError) return <p className="p-4 text-red-600">Failed to load exam professors.</p>

  return (
    <div>
      <TitleCard title="Exams List">
        <section className="flex w-full justify-between mb-4 max-xsm:flex-col">
          <TextInput
            placeholder="Search by title, code, exam type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 w-[200px] sm:w-sm max-xsm:w-full"
          />
        </section>

        <div className="overflow-x-auto border rounded-md border-ld overflow-hidden">
          <Table hoverable className="min-w-[600px]">
            <TableHead>
              <TableRow>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Name")} {getSortIcons('title')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    Code {getSortIcons('code')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    Exam Date {getSortIcons('exam_date')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Exam Type")} {getSortIcons('exam_type_title')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    Max Marks {getSortIcons('max_marks')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>Published</TableHeadCell>
                <TableHeadCell>View</TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {paginatedExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{toSentenceCase(exam.title)}</TableCell>
                  <TableCell>{exam.code}</TableCell>
                  <TableCell>{exam.exam_date}</TableCell>
                  <TableCell>{toSentenceCase(exam.exam_type.title)}</TableCell>
                  <TableCell>{exam.max_marks}</TableCell>
                  <TableCell>
                    {exam.published ?
                      <span className='text-white bg-green-500 px-3 py-2 rounded-md'>Published</span> :
                      <>
                        <PublishedExam id={exam.id} name={exam?.title} refetch={refetch} />
                      </>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Link href={`/exam-professor/${exam.id}`}>
                        <button className="text-gray-500">
                          <Icon icon="carbon:view" height={20} />
                        </button>
                      </Link>
                      <Link href={`/exam-results?id=${exam.id}`}>
                        <button className="text-gray-500">
                          <Icon icon="mdi:file-chart" height={20} />
                        </button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedExams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
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

export default ExamProfessor
