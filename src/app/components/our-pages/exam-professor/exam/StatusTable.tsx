'use client'

import { useState, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow,
    Pagination,
} from 'flowbite-react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import type { ExamResultResponse } from "@/lib/schemas/examProfessor.schema"
import { useSortableData } from '@/hooks/useSortableData'
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

type StatusTableProps = {
    examStudents: ExamResultResponse
    isLoading: boolean
    isError: boolean
    examId: number
}

function StatusTable({ examStudents, isLoading, isError, examId }: StatusTableProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    const studentsData = examStudents?.examStudentResults || []

    // Filter students based on search query
    const filteredStudents = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return studentsData.filter((student) => {
            const name = `${student.student.first_name ?? ''} ${student.student.middle_name ?? ''} ${student.student.last_name ?? ''}`.toLowerCase()
            const rollNumber = String(student.student.roll_number ?? '').toLowerCase()
            return name.includes(query) || rollNumber.includes(query)
        })
    }, [searchQuery, studentsData])

    // Sorting hook
    const { sortedItems: sortedStudents, requestSort, sortConfig } = useSortableData(filteredStudents, 'student.roll_number')

    const getSortIcons = (field: keyof typeof sortedStudents[0]) => {
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
    const totalPages = Math.max(1, Math.ceil(sortedStudents.length / ITEMS_PER_PAGE))
    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        return sortedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [sortedStudents, currentPage])

    return (
        <>
            {/* Optional search input */}
            {/*
            <div className="mb-4">
                <TextInput
                    type="text"
                    placeholder="Search by name or Roll No..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            */}

            <div className="border rounded-md border-ld overflow-hidden">
                <Table hoverable>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell>
                                <div className="flex items-center justify-between">
                                    {toSentenceCase("Enrollment")} {getSortIcons('student.enrollment_id' as any)}
                                </div>
                            </TableHeadCell>
                            <TableHeadCell>
                                <div className="flex items-center justify-between">
                                    {toSentenceCase("Student Name")} {getSortIcons('student' as any)}
                                </div>
                            </TableHeadCell>
                            <TableHeadCell>
                                <div className="flex items-center justify-between">
                                    Marks {getSortIcons('marks_obtained')}
                                </div>
                            </TableHeadCell>
                            <TableHeadCell>Status</TableHeadCell>
                            <TableHeadCell>Action</TableHeadCell>
                        </TableRow>
                    </TableHead>

                    <TableBody className="divide-y divide-border dark:divide-darkborder">
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-red-500">
                                    Error loading data.
                                </TableCell>
                            </TableRow>
                        ) : paginatedStudents.length > 0 ? (
                            paginatedStudents.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.student.enrollment_id ?? '-'}</TableCell>
                                    <TableCell>{toSentenceCase(`${student.student.first_name ?? ''} ${student.student.middle_name ?? ''} ${student.student.last_name ?? ''}`)}</TableCell>
                                    <TableCell>{student.marks_obtained}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            student.status === 'Passed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Link href={`/exam-professor/${examId}/${student.student.id}`}>
                                                <button className="text-gray-500">
                                                    <Icon icon="carbon:view" height={20} />
                                                </button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
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
        </>
    )
}

export default StatusTable
