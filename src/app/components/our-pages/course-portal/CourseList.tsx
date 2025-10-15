'use client'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Pagination,
  TextInput,
  Button,
} from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '@/app/router/course.router'
import { courseSchema } from '@/lib/schemas/course.schema'
import { z } from 'zod'
import DeleteCourse from './DeleteCourse'
import TitleCard from '../../shared/TitleBorderCard'
import { Icon } from '@iconify/react'
import { HiOutlinePlus } from 'react-icons/hi'
import Link from 'next/link'
import { useSortableData } from '@/hooks/useSortableData'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10
type Course = z.infer<typeof courseSchema>

const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentQuery, setDepartmentQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [debouncedDepartment, setDebouncedDepartment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDepartment(departmentQuery)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [departmentQuery])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const res = await getCourses()
      return res || []
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const allCourses: Course[] = data || []

  // Get unique department names for dropdown
  const departmentOptions = useMemo(() => {
    const names = allCourses.map(course => course.department?.name).filter(Boolean)
    return Array.from(new Set(names))
  }, [allCourses])

  // Filter courses
  const filteredCourses = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    const dq = debouncedDepartment.toLowerCase()
    return allCourses.filter(course => {
      const matchesTitleOrCode =
        (course.title?.toLowerCase().includes(q) ?? false) ||
        (course.code?.toLowerCase().includes(q) ?? false)
      const matchesDepartment =
        dq === '' || (course.department?.name?.toLowerCase().includes(dq) ?? false)
      return matchesTitleOrCode && matchesDepartment
    })
  }, [allCourses, debouncedSearch, debouncedDepartment])

  // Flatten nested props for sorting
  const sortableCourses = useMemo(() => {
    return filteredCourses.map(course => ({
      ...course,
      department_name: course.department?.name ?? '',
      department_code: course.department?.code ?? '',
      semester_title: course.semester?.title ?? '',
    }))
  }, [filteredCourses])

  // Sorting hook
  const { sortedItems: sortedCourses, requestSort, sortConfig } = useSortableData(
    sortableCourses,
    'title'
  )

  const getSortIcons = (field: keyof typeof sortableCourses[0]) => {
    const isActive = sortConfig.field === field
    return (
      <div className="flex flex-col ml-1">
        <button
          onClick={e => {
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
          onClick={e => {
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

  // Pagination after sorting
  const totalPages = Math.max(1, Math.ceil(sortedCourses.length / ITEMS_PER_PAGE))
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedCourses, currentPage])

  if (isLoading) return <p className="p-4">Loading courses...</p>
  if (isError) return <p className="p-4 text-red-600">Failed to load courses.</p>

  return (
    <div>
      <TitleCard title="Courses List">
        <section className="flex flex-col sm:flex-row w-full justify-between items-center mb-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <TextInput
              className="w-[200px] sm:w-sm"
              placeholder="Search by course title or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 items-center sm:ml-auto">
            <div className='md:max-w-[300px]'>
              <select
                className="w-[100px] sm:w-sm border rounded px-2 py-2"
                value={departmentQuery}
                onChange={e => setDepartmentQuery(e.target.value)}
              >
                <option value="">All</option>
                {departmentOptions.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <Link href="/courses/add-update-course" className="max-xsm:flex-1">
              <Button className="w-full flex items-center justify-center">
                <HiOutlinePlus className="mr-2" /> <span>Add Course</span>
              </Button>
            </Link>
          </div>
        </section>

        <div className="border rounded-md border-ld overflow-hidden">
          <Table hoverable className="min-w-[600px]">
            <TableHead>
              <TableRow>
                <TableHeadCell>
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Title")} {getSortIcons('title')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="text-center">
                  <div className="flex items-center justify-center">
                    Code {getSortIcons('code')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="text-center">
                  <div className="flex items-center justify-center">
                    Credits {getSortIcons('credits')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="text-center">
                  <div className="flex items-center justify-center">
                    Department {getSortIcons('department_name')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="text-center">
                  <div className="flex items-center justify-center">
                    Semester {getSortIcons('semester_title')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {paginatedCourses.map(course => (
                <TableRow key={course.id}>
                  <TableCell>{toSentenceCase(course.title)}</TableCell>
                  <TableCell className="text-center">{course.code || '-'}</TableCell>
                  <TableCell className="text-center">{course.credits || '-'}</TableCell>
                  <TableCell className="text-center">{course.department_code || '-'}</TableCell>
                  <TableCell className="text-center">{toSentenceCase(course.semester_title) || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/courses/add-update-course?id=${course.id}`}>
                        <button className="text-gray-500">
                          <Icon icon="solar:pen-new-square-broken" height={20} />
                        </button>
                      </Link>
                      <DeleteCourse
                        id={course.id}
                        title={course.title ?? ''}
                        refetch={refetch}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedCourses.length === 0 && (
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

export default CourseList
