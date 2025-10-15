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
import { getStudents } from '@/app/router/student.router'
import { Student } from '@/lib/schemas/student.schema'
import TitleCard from '../../shared/TitleBorderCard'
import Link from 'next/link'
import { HiOutlinePlus, HiOutlineUpload } from 'react-icons/hi'
import { Icon } from '@iconify/react'
import DeleteStudent from './DeleteStudent'
import { useSortableData } from '@/hooks/useSortableData'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10

type SortField =
  | keyof Pick<Student, 'first_name' | 'email' | 'phone' | 'enrollment_id' | 'roll_number'>
  | 'department.code'

function StudentsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const res = await getStudents()
      return res || { data: [] }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const allStudents: Student[] = data?.data || []

  // Filter based on search query
  const filteredStudents = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return allStudents.filter((s) =>
      `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.enrollment_id.toString().includes(q) ||
      s.roll_number.toString().includes(q) ||
      (s.department?.name?.toLowerCase().includes(q) ?? false)
    )
  }, [allStudents, debouncedSearch])

  // Use sortable hook
  const { sortedItems: sortedStudents, requestSort, sortConfig } = useSortableData<Student>(
    filteredStudents,
    'first_name' // default sort field
  )

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / ITEMS_PER_PAGE))
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedStudents, currentPage])

  const getSortIcons = (field: SortField) => {
    const isActive = sortConfig.field === field
    return (
      <div className='flex flex-col ml-2'>
        <button
          onClick={(e) => { e.stopPropagation(); requestSort(field) }}
          className={`p-0 hover:bg-transparent ${isActive && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Icon icon="solar:alt-arrow-up-bold" className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); requestSort(field) }}
          className={`p-0 hover:bg-transparent -mt-1 ${isActive && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Icon icon="solar:alt-arrow-down-bold" className="w-3 h-3" />
        </button>
      </div>
    )
  }

  if (isLoading) return <p className='p-4'>Loading students...</p>
  if (isError) return <p className='p-4 text-red-600'>Failed to load students.</p>

  return (
    <div>
      <TitleCard title="Students List">
        <section className='flex w-full items-center justify-between mb-4 max-sm:flex-col'>
          <TextInput
            className='w-[200px] sm:w-sm max-sm:w-full'
            placeholder='Search by name, email, enrollment ID...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className='flex items-center gap-2 max-xsm:w-full'>
            <Link href='/students/add-update-student' className='max-sm:flex-1'>
              <Button className='max-sm:w-full'><HiOutlinePlus className='mr-2' /> Add Student</Button>
            </Link>
            <Link href='/students/upload' className='max-sm:flex-1'>
              <Button className='max-sm:w-full' color={'light'}> <HiOutlineUpload className='mr-2' /> Import Data</Button>
            </Link>
          </div>
        </section>

        <div className='overflow-x-auto border rounded-md border-ld'>
          <Table hoverable className='min-w-[600px]'>
            <TableHead>
              <TableRow>
                <TableHeadCell className='w-1/4 select-none'>
                  <div className='flex items-center justify-between'>Name {getSortIcons('first_name')}</div>
                </TableHeadCell>
                <TableHeadCell className='w-1/4 select-none'>
                  <div className='flex items-center justify-between'>Email {getSortIcons('email')}</div>
                </TableHeadCell>
                <TableHeadCell className='w-1/4 select-none'>
                  <div className='flex items-center justify-between'>Phone {getSortIcons('phone')}</div>
                </TableHeadCell>
                <TableHeadCell className='w-1/4 select-none'>
                  <div className='flex items-center justify-between'>Enrollment ID {getSortIcons('enrollment_id')}</div>
                </TableHeadCell>
                <TableHeadCell className='w-1/4 select-none whitespace-nowrap'>
                  <div className='flex items-center justify-between'>Roll No {getSortIcons('roll_number')}</div>
                </TableHeadCell>
                <TableHeadCell className='select-none'>
                  <div className='flex items-center justify-between'>Department {getSortIcons('department.code')}</div>
                </TableHeadCell>
                <TableHeadCell>Courses</TableHeadCell>
                <TableHeadCell className='w-[150px] text-center'>Action</TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className='divide-y divide-border dark:divide-darkborder'>
              {paginatedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {toSentenceCase(`${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`)}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.enrollment_id}</TableCell>
                  <TableCell>{student.roll_number || '-'}</TableCell>
                  <TableCell>{student.department?.code || '-'}</TableCell>
                  <TableCell>
                    <Link href={`/students/courses?studentId=${student.id}&departmentId=${student.department?.id}`}>
                      <Button size='sm'>View</Button>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className='flex justify-center items-center gap-2'>
                      <Link href={`/students/add-update-student?id=${student.id}`}>
                        <button className="text-gray-500">
                          <Icon icon="solar:pen-new-square-broken" height={20} />
                        </button>
                      </Link>
                      <DeleteStudent id={student.id} name={`${student.first_name} ${student.last_name}`} refetch={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-4'>No records found.</TableCell>
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

export default StudentsList
