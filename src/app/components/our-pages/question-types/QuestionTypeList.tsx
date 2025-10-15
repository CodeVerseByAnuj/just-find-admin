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
import { getAllQuestionTypes } from '@/app/router/question-types.router'
import { QuestionType } from '@/lib/schemas/question-type.schema'
import AddQuestionType from './AddQuestionType'
import EditQuestionType from './EditQuestionType'
import DeleteQuestionType from './DeleteQuestionType'
import TitleCard from '../../shared/TitleBorderCard'
import { useSortableData } from '@/hooks/useSortableData'
import { Icon } from '@iconify/react'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

const ITEMS_PER_PAGE = 10

function QuestionTypeList() {
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
    queryKey: ['all-question-types'],
    queryFn: async () => {
      const res = await getAllQuestionTypes()
      return res || { data: [] }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const allQuestionTypes: QuestionType[] = data?.data || []

  // Filter
  const filteredQuestionTypes = useMemo(() => {
    const query = debouncedSearch.toLowerCase()
    return allQuestionTypes.filter((question) =>
      question.title.toLowerCase().includes(query)
    )
  }, [allQuestionTypes, debouncedSearch])

  // Sort
  const { sortedItems: sortedQuestionTypes, requestSort, sortConfig } =
    useSortableData(filteredQuestionTypes, 'title')

  const getSortIcons = (field: keyof QuestionType) => {
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
  const totalPages = Math.max(1, Math.ceil(sortedQuestionTypes.length / ITEMS_PER_PAGE))
  const paginatedQuestionTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedQuestionTypes.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedQuestionTypes, currentPage])

  if (isLoading) return <p className="p-4">Loading question types...</p>
  if (isError) return <p className="p-4 text-red-600">Failed to load question types.</p>

  return (
    <div>
      <TitleCard title="Question Types List">
        <section className="flex w-full justify-between mb-4 max-xsm:flex-col">
          <TextInput
            placeholder="Search by Type or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 w-[200px] sm:w-sm max-xsm:w-full"
          />
          <AddQuestionType refetch={refetch} buttonWidth="max-xsm:w-full" />
        </section>

        <div className="overflow-x-auto border rounded-md border-ld overflow-hidden">
          <Table hoverable className="min-w-[700px]">
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-1/3">
                  <div className="flex items-center justify-start">
                    {toSentenceCase("Name")}
                    {getSortIcons('title')}
                  </div>
                </TableHeadCell>
                <TableHeadCell className="w-[150px] text-end pr-6">Action</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {paginatedQuestionTypes.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="capitalize">{toSentenceCase(question.title)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-2">
                      <EditQuestionType
                        title={question.title}
                        id={question.id}
                        refetch={refetch}
                      />
                      <DeleteQuestionType
                        id={question.id}
                        name={question.title}
                        refetch={refetch}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedQuestionTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
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

export default QuestionTypeList
