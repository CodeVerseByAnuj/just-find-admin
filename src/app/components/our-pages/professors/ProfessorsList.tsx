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
import { getProfessors } from '@/app/router/professor.router'
import { Professor } from '@/lib/schemas/professor.schema'
import { formatDate } from '@/utils/dateFormat/formatDate'
import TitleCard from '../../shared/TitleBorderCard'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import DeleteProfessor from './DeleteProfessor'
import { useSortableData } from '@/hooks/useSortableData'
import { HiOutlinePlus, HiOutlineUpload } from 'react-icons/hi'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10

function ProfessorsList() {
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
    queryKey: ['all-professors'],
    queryFn: async () => {
      const res = await getProfessors()
      return res || { data: [] }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const allProfessors: Professor[] = data?.data || []

  // Filter
  const filteredProfessors = useMemo(() => {
    const query = debouncedSearch.toLowerCase()
    return allProfessors.filter((professor) =>
      professor.first_name.toLowerCase().includes(query) ||
      professor.last_name.toLowerCase().includes(query) ||
      professor.email.toLowerCase().includes(query) ||
      professor.phone.includes(query) ||
      (professor.department?.name.toLowerCase().includes(query)) ||
      professor.user_role.title.toLowerCase().includes(query)
    )
  }, [allProfessors, debouncedSearch])

  // Sort
  const { sortedItems: sortedProfessors, requestSort, sortConfig } =
    useSortableData(filteredProfessors, 'first_name')

  const getSortIcons = (field: keyof Professor | string) => {
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
  const totalPages = Math.max(1, Math.ceil(sortedProfessors.length / ITEMS_PER_PAGE))
  const paginatedProfessors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedProfessors.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedProfessors, currentPage])

  if (isLoading) return <p className="p-4">Loading professors...</p>
  if (isError) return <p className="p-4 text-red-600">Failed to load professors.</p>

  return (
    <div>
      <TitleCard title="Professors List">
        <section className="flex w-full justify-between mb-4 max-sm:flex-col gap-2">
          <TextInput
            className="w-[200px] sm:w-sm max-sm:w-full"
            placeholder="Search by name, email, phone, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Link href="/professors/add-update-professor" className="max-sm:flex-1">
              <Button className="max-sm:w-full">
                <HiOutlinePlus className="mr-2" /> Add Professor
              </Button>
            </Link>
            <Link href="/professors/upload" className="max-sm:flex-1">
              <Button className='max-sm:w-full' color={'light'}> <HiOutlineUpload className='mr-2' /> Import Data</Button>

            </Link>
          </div>
        </section>

        <div className="overflow-x-auto border rounded-md border-ld overflow-hidden">
          <Table hoverable className="min-w-[900px] w-full">
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-[25%]">
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Name")}
                    {getSortIcons('first_name')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-[20%]">
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Email")}
                    {getSortIcons('email')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-[15%]">
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Phone")}
                    {getSortIcons('phone')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-[15%]">
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Department Code")}
                    {getSortIcons('department.code')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-[15%]">
                  <div className="flex items-center justify-between">
                    {toSentenceCase("Designation")}
                    {getSortIcons('designation')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-[10%] text-center">Action</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {paginatedProfessors.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell className=" w-[25%]">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {toSentenceCase(
                            [professor.first_name, professor.middle_name, professor.last_name]
                              .filter(Boolean) // removes null/undefined/empty strings
                              .join(" ")
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {professor.gender}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-[20%]">{professor.email}</TableCell>
                  <TableCell className="w-[15%]">{professor.phone}</TableCell>
                  <TableCell className="w-[15%]">{professor?.department?.code || '-'}</TableCell>
                  <TableCell className="w-[15%]">{toSentenceCase(professor.designation)}</TableCell>
                  <TableCell className="w-[10%]">
                    <div className="flex justify-center items-center gap-2">
                      <Link href={`/professors/add-update-professor?id=${professor.id}`}>
                        <button className="text-gray-500 hover:text-gray-700">
                          <Icon icon="solar:pen-new-square-broken" height={20} />
                        </button>
                      </Link>
                      <DeleteProfessor
                        id={professor.id}
                        name={`${professor.first_name} ${professor.last_name}`}
                        refetch={refetch}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedProfessors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No records found.
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

export default ProfessorsList
