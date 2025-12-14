"use client"
import React, { useCallback } from 'react';
import { getBusiness, BusinessQueryParams } from '@/app/router/business.router';
import DeleteBusiness from './DeleteBusiness';
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
    Button
} from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import TitleCard from '../../shared/TitleBorderCard';
import { toSentenceCase } from '@/utils/tableHeadFormat/headerTitle'
import Link from 'next/link';

function BusinessList() {

    // For UI typing
    const [inputValue, setInputValue] = React.useState("");

    // Actual value that triggers API
    const [search, setSearch] = React.useState("");

    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [sortBy] = React.useState("name");
    const [sortOrder] = React.useState<BusinessQueryParams["sortOrder"]>("DESC");

    type QueryResult = {
        businesses?: any[] | { businesses?: any[]; total?: number };
        total?: number;
    };

    const { data, isLoading, error , refetch } = useQuery<QueryResult>({
        queryKey: ["businesses", { search, page, limit, sortBy, sortOrder }],
        queryFn: async () => await getBusiness({ search, page, limit, sortBy, sortOrder }),
    });

    // Normalize shapes: getBusiness may return { businesses: [...], total } or { businesses: { businesses: [...], ... } }
    const anyData = data as any;
    const businessList: any[] = (anyData && Array.isArray(anyData.businesses))
        ? anyData.businesses
        : (anyData && anyData.businesses && Array.isArray(anyData.businesses.businesses))
            ? anyData.businesses.businesses
            : [];

    const total = anyData?.total ?? anyData?.businesses?.total ?? 0;
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
    if (error) return <div>Error: {error instanceof Error ? error.message : 'Error loading businesses'}</div>;

    return (
        <TitleCard title="Business List">
            <div className="absolute top-3 right-6">
                <Button>
                    <Link href="/business/add-business">
                        Add New Business
                    </Link>
                </Button>
            </div>
            <section className='flex w-full justify-between mb-4 max-xsm:flex-col'>
                <div className='mb-4 w-[200px] sm:w-sm max-xsm:w-full'>
                    <TextInput
                        placeholder='Search by business name...'
                        value={inputValue}
                        onChange={handleSearchChange}
                    />
                </div>
            </section>



            <div className='overflow-x-auto border rounded-md border-ld overflow-hidden'>
                <Table hoverable className='min-w-[900px]'>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell className='w-[80px]'><span>ID</span></TableHeadCell>
                            <TableHeadCell><span>Name</span></TableHeadCell>
                            <TableHeadCell><span>City</span></TableHeadCell>
                            <TableHeadCell><span>State</span></TableHeadCell>
                            <TableHeadCell><span>Rating</span></TableHeadCell>
                            <TableHeadCell className='text-center'><span>Verified</span></TableHeadCell>
                            <TableHeadCell><span>Slug</span></TableHeadCell>
                            <TableHeadCell className='text-center'><span>Premium</span></TableHeadCell>
                            <TableHeadCell className='text-center'><span>Sponsored</span></TableHeadCell>
                            <TableHeadCell className='text-center'><span>Packages</span></TableHeadCell>
                            <TableHeadCell><span>Category</span></TableHeadCell>
                            <TableHeadCell>Action</TableHeadCell>
                        </TableRow>
                    </TableHead>

                    <TableBody className='divide-y divide-border dark:divide-darkborder'>
                        {businessList && businessList.length > 0 ? (
                            businessList.map((biz: any) => (
                                <TableRow key={biz.id}>
                                    <TableCell>{biz.id}</TableCell>
                                    <TableCell>{biz.name}</TableCell>
                                    <TableCell>{biz.city}</TableCell>
                                    <TableCell>{biz.state}</TableCell>
                                    <TableCell>{biz.rating}</TableCell>
                                    <TableCell className='text-center'>{biz.verified ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{biz.slug}</TableCell>
                                    <TableCell className='text-center'>{biz.is_premium ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className='text-center'>{biz.sponsored ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className='text-center'>{biz.packagesCount ?? 0}</TableCell>
                                    <TableCell>{biz.category?.name ?? '-'}</TableCell>
                                    <TableCell>
                                       <div className='flex items-center gap-2'>
                                         <Link
                                            href={`/business/add-business?id=${biz.id}`}
                                            className='text-blue-600 hover:underline'
                                        >
                                            Edit
                                        </Link>
                                        <DeleteBusiness id={biz.id} name={biz.name} refetch={refetch} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={11} className='text-center py-4'>
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


export default BusinessList
