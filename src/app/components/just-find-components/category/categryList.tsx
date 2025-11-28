"use client"
import React, { useCallback } from 'react';
import { getCategory, CategoryQueryParams } from '@/app/router/category.router';
import { debounce } from "lodash";
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
import TitleCard from '../../shared/TitleBorderCard';
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'

function CategryList() {

    // For UI typing
    const [inputValue, setInputValue] = React.useState("");

    // Actual value that triggers API
    const [search, setSearch] = React.useState("");

    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [sortBy, setSortBy] = React.useState("name");
    const [sortOrder, setSortOrder] = React.useState<CategoryQueryParams["sortOrder"]>("DESC");

    const {
        data = { categories: [], total: 0 },
        isLoading,
        error,
    } = useQuery<
        { categories: { id: number; name: string }[]; total: number },
        Error,
        { categories: { id: number; name: string }[]; total: number }
    >({
        queryKey: ["categories", { search, page, limit, sortBy, sortOrder }],
        queryFn: async () => {
            const response = await getCategory({ search, page, limit, sortBy, sortOrder });
            return {
                categories: response.categories.data,
                total: response.categories.total
            };
        },
        placeholderData: { categories: [], total: 0 },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const categoryList = data.categories;
    const total = data.total;
    const totalPages = Math.ceil(total / limit);

    // Debounced API value update
    const handleSearchDebounced = useCallback(
        debounce((value: string) => {
            setSearch(value);
            setPage(1);
        }, 500), // 500ms debounce
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);        // instant typing
        handleSearchDebounced(value); // delayed search
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error instanceof Error ? error.message : 'Error loading categories'}</div>;

    return (
        <TitleCard title="Category List">
            <section className='flex w-full justify-between mb-4 max-xsm:flex-col'>
                <div className='mb-4 w-[200px] sm:w-sm max-xsm:w-full'>
                    <TextInput
                        placeholder='Search by category name...'
                        value={inputValue}
                        onChange={handleSearchChange}
                    />
                </div>
            </section>

            <div className='overflow-x-auto border rounded-md border-ld overflow-hidden'>
                <Table hoverable className='min-w-[600px]'>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell className='w-1/3'>
                                <div className='flex items-center justify-between'>
                                    <span className="flex items-center">{toSentenceCase("Name")}</span>
                                </div>
                            </TableHeadCell>
                            <TableHeadCell className='w-[150px] text-center'>
                                <div className="flex items-center justify-center">Actions</div>
                            </TableHeadCell>
                        </TableRow>
                    </TableHead>

                    <TableBody className='divide-y divide-border dark:divide-darkborder'>
                        {categoryList && categoryList.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell>{cat.name}</TableCell>
                                <TableCell>
                                    <div className='flex justify-center items-center gap-2'>
                                        {/* actions here */}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {categoryList && categoryList.length === 0 && (
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
                {totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </TitleCard>
    );
}

export default CategryList;
