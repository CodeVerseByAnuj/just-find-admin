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
} from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { getAllSemesters } from '@/app/router/semester.router'
import { SemesterType } from '@/lib/schemas/semester.schema'
import AddSemester from './AddSemester'
import EditSemester from './EditSemester'
import DeleteSemester from './DeleteSemester'
import { formatDate } from '@/utils/dateFormat/formatDate'
import TitleCard from '../../shared/TitleBorderCard'
import { useSortableData } from '@/hooks/useSortableData'
import { Icon } from '@iconify/react'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10

function SemesterList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-semester'],
    queryFn: async () => {
      const res = await getAllSemesters()
      return res || { data: [] }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const allSemesters: SemesterType[] = data?.data || []

  // Filter based on search query
  const filteredSemesters = useMemo(() => {
    const query = debouncedSearch.toLowerCase()
    return allSemesters.filter((semester) =>
      semester.title.toLowerCase().includes(query)
    )
  }, [allSemesters, debouncedSearch])

  // Use sortable hook
  const { sortedItems: sortedSemesters, requestSort, sortConfig } = useSortableData(
    filteredSemesters,
    'title'
  )

  const totalPages = Math.max(1, Math.ceil(sortedSemesters.length / ITEMS_PER_PAGE))
  const paginatedSemesters = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedSemesters.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedSemesters, currentPage])

  const getSortIcons = (field: keyof SemesterType) => {
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

  if (isLoading) return <p className='p-4'>Loading semesters...</p>
  if (isError) return <p className='p-4 text-red-600'>Failed to load semesters.</p>

  return (
    <div>
      <TitleCard title="Semesters">
        <section className='flex w-full justify-between mb-4 max-xsm:flex-col'>
          <TextInput
            placeholder='Search by semester name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='mb-4 w-[200px] sm:w-sm max-xsm:w-full'
          />
          <AddSemester refetch={refetch} buttonWidth='max-xsm:w-full' />
        </section>

        <div className='overflow-x-auto border rounded-md border-ld overflow-hidden'>
          <Table hoverable className='min-w-[600px]'>
            <TableHead>
              <TableRow>
                <TableHeadCell className='w-1/3'>
                  <div className='flex items-center justify-start'>
                    {toSentenceCase("Semester Name")}
                    {getSortIcons('title')}
                  </div>
                </TableHeadCell>

                <TableHeadCell className='w-[150px] text-end pe-6'>Action</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className='divide-y divide-border dark:divide-darkborder'>
              {paginatedSemesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell >{toSentenceCase(semester.title)}</TableCell>

                  <TableCell>
                    <div className='flex justify-end items-center gap-2'>
                      <EditSemester title={semester.title} id={semester.id} refetch={refetch} />
                      <DeleteSemester id={semester.id} name={semester.title} refetch={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedSemesters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className='text-center py-4'>
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

export default SemesterList
