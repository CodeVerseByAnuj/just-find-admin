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
import { getAllExamTypes } from '@/app/router/exam-type.router'
import { ExamType } from '@/lib/schemas/exam-type.schema'
import AddExamType from './AddExamType'
import EditExamType from './EditExamType'
import DeleteExamType from './DeleteExamType'
import { formatDate } from '@/utils/dateFormat/formatDate'
import TitleCard from '../../shared/TitleBorderCard'
import { useSortableData } from '@/hooks/useSortableData'
import { Icon } from '@iconify/react'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10

function ExamTypeList() {
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
    queryKey: ['all-exam-types'],
    queryFn: async () => {
      const res = await getAllExamTypes()
      return res || { data: [] }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const allExamTypes: ExamType[] = data?.data || []

  // Filter based on search query
  const filteredExamTypes = useMemo(() => {
    const query = debouncedSearch.toLowerCase()
    return allExamTypes.filter((exam) =>
      exam.title.toLowerCase().includes(query)
    )
  }, [allExamTypes, debouncedSearch])

  // Use sortable hook
  const { sortedItems: sortedExamTypes, requestSort, sortConfig } = useSortableData(
    filteredExamTypes,
    'title'
  )

  const totalPages = Math.max(1, Math.ceil(sortedExamTypes.length / ITEMS_PER_PAGE))
  const paginatedExamTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedExamTypes.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedExamTypes, currentPage])

  const getSortIcons = (field: keyof ExamType) => {
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

  if (isLoading) return <p className='p-4'>Loading exam types...</p>
  if (isError) return <p className='p-4 text-red-600'>Failed to load exam types.</p>

  return (
    <div>
      <TitleCard title="Exam Types">
        <section className='flex w-full justify-between mb-4 max-xsm:flex-col'>
          <TextInput
            placeholder='Search by exam type name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='mb-4 w-[200px] sm:w-sm max-xsm:w-full'
          />
          <AddExamType refetch={refetch} buttonWidth='max-xsm:w-full' />
        </section>

        <div className='overflow-x-auto border rounded-md border-ld overflow-hidden'>
          <Table hoverable className='min-w-[600px]'>
            <TableHead>
              <TableRow>
                <TableHeadCell className='w-1/3'>
                  <div className='flex items-center justify-start'>
                    {toSentenceCase("Name")}
                    {getSortIcons('title')}
                  </div>
                </TableHeadCell>

                <TableHeadCell className='w-[150px] text-end pe-6'>Action</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className='divide-y divide-border dark:divide-darkborder'>
              {paginatedExamTypes.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className=''>{toSentenceCase(exam.title)}</TableCell>

                  <TableCell>
                    <div className='flex justify-end items-center gap-2'>
                      <EditExamType title={exam.title} id={exam.id} refetch={refetch} />
                      <DeleteExamType id={exam.id} name={exam.title} refetch={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedExamTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className='text-center py-4'>
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

export default ExamTypeList
