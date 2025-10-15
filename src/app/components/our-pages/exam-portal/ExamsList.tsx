'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Pagination,
  TextInput,
  Select,
  Button,
} from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getAllExams, publishedExams } from '@/app/router/exam.router'
import { z } from 'zod'
import { examSchema } from '@/lib/schemas/exam.schema'
import TitleCard from '../../shared/TitleBorderCard'
import { Icon } from '@iconify/react'
import { formatDate } from '@/utils/dateFormat/formatDate'
import Link from 'next/link'
import { HiOutlinePlus } from 'react-icons/hi'
import DeleteExam from './DeleteExam'
import PublishedExam from './PublishedExam'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10
type Exam = z.infer<typeof examSchema>

function ExamsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-exams'],
    queryFn: async () => {
      const res = await getAllExams({ page: 1, limit: 10000 }) // get all exams
      return res || { data: [] }
    },
    staleTime: 0, // Always consider data stale to refetch on navigation
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  })

  const allExams: Exam[] = data?.data || []

  // Unique filter options
  const courses = Array.from(new Set(allExams.map(e => e.course?.title).filter(Boolean)))
  const examTypes = Array.from(new Set(allExams.map(e => e.exam_type?.title).filter(Boolean)))
  const departments = Array.from(new Set(allExams.map(e => e.department?.name).filter(Boolean)))

  console.log(allExams, "allExams")

  // Filter exams
  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      const title = exam.course?.title?.toLowerCase() || ''
      const code = exam.course?.code?.toLowerCase() || ''
      const query = debouncedSearch.toLowerCase()

      const matchesSearch = title.includes(query) || code.includes(query)
      const matchesCourse = selectedCourse ? exam.course?.title === selectedCourse : true
      const matchesExamType = selectedExamType ? exam.exam_type?.title === selectedExamType : true
      const matchesDepartment = selectedDepartment ? exam.department?.name === selectedDepartment : true

      return matchesSearch && matchesCourse && matchesExamType && matchesDepartment
    })
  }, [allExams, debouncedSearch, selectedCourse, selectedExamType, selectedDepartment])

  // Paginated exams
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / ITEMS_PER_PAGE))

  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredExams.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredExams, currentPage])

  if (isLoading) return <p className='p-4'>Loading exams...</p>
  if (isError) return <p className='p-4 text-red-600'>Failed to load exams.</p>

  return (
    <div>
      <TitleCard title="Exams Status">
        <div className="flex flex-wrap gap-4 w-full justify-between mb-4">
          {/* Search */}
          <TextInput
            className="flex-1 min-w-[200px] sm:min-w-[250px] max-sm:w-full"
            placeholder="Search by title, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Department Filter */}
          <Select
            value={selectedDepartment}
            className="flex-1 min-w-[150px] sm:min-w-[180px] max-sm:w-full"
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d, idx) => (
              <option key={idx} value={d}>{d}</option>
            ))}
          </Select>

          {/* Course Filter */}
          <Select
            value={selectedCourse}
            className="flex-1 min-w-[150px] sm:min-w-[180px] max-sm:w-full"
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c, idx) => (
              <option key={idx} value={c ?? ''}>{c ?? '-'}</option>
            ))}
          </Select>

          {/* Exam Type Filter */}
          <Select
            value={selectedExamType}
            className="flex-1 min-w-[150px] sm:min-w-[180px] max-sm:w-full"
            onChange={(e) => setSelectedExamType(e.target.value)}
          >
            <option value="">All Exam Types</option>
            {examTypes.map((et, idx) => (
              <option key={idx} value={et}>{et}</option>
            ))}
          </Select>

          {/* Add Exam Button */}
          <Link href="/exams/add-exam-pdf" className="flex-1 min-w-[150px] max-sm:w-full">
            <Button className="w-full sm:w-auto">
              <HiOutlinePlus className="mr-2" /> Add Exam
            </Button>
          </Link>
        </div>


        <div className='border rounded-md border-ld overflow-x-auto overflow-y-hidden'>
          <Table className='min-w-[600px]' hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>{toSentenceCase("Course")}</TableHeadCell>
                <TableHeadCell>Code</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
                <TableHeadCell>{toSentenceCase("Exam Type")}</TableHeadCell>
                <TableHeadCell className='text-center'>Department Code</TableHeadCell>
                <TableHeadCell className='text-center'>Status</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className='divide-y divide-border dark:divide-darkborder'>
              {paginatedExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{toSentenceCase(exam?.course?.title) || '-'}</TableCell>
                  <TableCell>{exam?.course?.code || '-'}</TableCell>
                  <TableCell>{formatDate(exam.exam_date)}</TableCell>
                  <TableCell>{toSentenceCase(exam.exam_type?.title) || '-'}</TableCell>
                  <TableCell className='text-center'>{exam.department?.code || '-'}</TableCell>
                  <TableCell className='text-center'>
                    {exam.published ? (
                      <span className='text-white bg-green-500 px-3 py-2 rounded-md'>Published</span>
                    ) : (
                      <>
                         <span className='text-white bg-gray-500 px-3 py-2 rounded-md'>Unpublished</span>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Link href={`/exams/upload-exam?id=${exam.id}`}>
                        <button className="text-gray-500">
                          <Icon icon="solar:upload-broken" height={20} />
                        </button>
                      </Link>
                      <button>
                        <Icon icon="solar:trash-broken" height={20} />
                      </button>
                      <Link href={`/exams/add-exam-pdf?id=${exam.id}`}>
                        <button className="text-gray-500">
                          <Icon icon="solar:pen-new-square-broken" height={20} />
                        </button>
                      </Link>
                      <DeleteExam id={exam.id} name={exam?.course?.title} refetch={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedExams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className='text-center'>
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='mt-4 flex justify-center'>
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

export default ExamsList
