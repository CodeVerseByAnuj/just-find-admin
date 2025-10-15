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
import { getAllDepartments } from '@/app/router/department.router'
import { Department } from '@/lib/schemas/department.schema'
import AddUpdateDepartment from './AddDepartment'
import EditDepartment from './EditDepartment'
import DeleteDepartment from './DeleteDepartment'
import TitleCard from '../../shared/TitleBorderCard'
import { useSortableData } from '@/hooks/useSortableData'
import { Icon } from '@iconify/react'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'


const ITEMS_PER_PAGE = 10

function DepartmentList() {
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
    queryKey: ['all-departments'],
    queryFn: async () => {
      const res = await getAllDepartments()
      return res || { data: [] }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const allDepartments: Department[] = data?.data || []

  const filteredDepartments = useMemo(() => {
    const query = debouncedSearch.toLowerCase()
    return allDepartments.filter((dept) =>
      dept.name.toLowerCase().includes(query)
    )
  }, [allDepartments, debouncedSearch])

  // Use sortable hook
  const { sortedItems: sortedDepartments, requestSort, sortConfig } = useSortableData<Department>(
    filteredDepartments,
    'name'
  )

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedDepartments.length / ITEMS_PER_PAGE))
  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedDepartments.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedDepartments, currentPage])

  const getSortIcons = (field: keyof Department) => {
    const isActive = sortConfig.field === field
    return (
      <div className='flex flex-col ml-2'>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); requestSort(field) }}
          className={`p-0 hover:bg-transparent ${isActive && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          aria-label={`Sort ${field} ascending`}
        >
          <Icon icon="solar:alt-arrow-up-bold" className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); requestSort(field) }}
          className={`p-0 hover:bg-transparent -mt-1 ${isActive && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          aria-label={`Sort ${field} descending`}
        >
          <Icon icon="solar:alt-arrow-down-bold" className="w-3 h-3" />
        </button>
      </div>
    )
  }

  if (isLoading) return <p className='p-4'>Loading departments...</p>
  if (isError) return <p className='p-4 text-red-600'>Failed to load departments.</p>

  return (
    <div>
      <TitleCard title="Departments List">
        <section className='flex w-full justify-between mb-4 max-xsm:flex-col'>
          <div className='mb-4 w-[200px] sm:w-sm max-xsm:w-full'>
            <TextInput
              placeholder='Search by department name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddUpdateDepartment refetch={refetch} buttonWidth='max-xsm:w-full' />
        </section>

        <div className='overflow-x-auto border rounded-md border-ld overflow-hidden'>
          <Table hoverable className='min-w-[600px]'>
            <TableHead>
              <TableRow>
                <TableHeadCell className='w-1/3'>
                  <div className='flex items-center justify-between'>
                    <span className="flex items-center">{toSentenceCase("Name")} {getSortIcons('name')}</span>
                  </div>
                </TableHeadCell>
                <TableHeadCell className='text-center'>
                  <div className="flex items-center justify-center">
                    Code {getSortIcons('code')}
                  </div>
                </TableHeadCell>
                <TableHeadCell>
                  <div className='flex items-center'>
                    
                    {toSentenceCase("Type")}
                  </div>
                </TableHeadCell>
                <TableHeadCell className='w-[150px] text-center'>
                  <div className="flex items-center justify-center">Action</div>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className='divide-y divide-border dark:divide-darkborder'>
              {paginatedDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className=''>{toSentenceCase(dept.name)}</TableCell>
                  <TableCell className='text-center'>{dept.code}</TableCell>
                  <TableCell className=''>{toSentenceCase(dept.type)}</TableCell>
                  <TableCell>
                    <div className='flex justify-center items-center gap-2'>
                      <EditDepartment name={dept.name} id={dept.id} type={dept.type} code={dept.code} refetch={refetch} />
                      <DeleteDepartment id={dept.id} name={dept.name} refetch={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedDepartments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-4'>
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

export default DepartmentList
