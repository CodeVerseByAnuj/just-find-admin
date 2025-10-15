"use client"
import React, { useState, ChangeEvent } from 'react';
import { HiOutlineDownload } from 'react-icons/hi';
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
import TitleCard from '../../shared/TitleBorderCard';

const ImportCourse: React.FC = () => {
  const [fileName, setFileName] = useState<string>('No file chosen');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('No file chosen');
    }
  };

  return (
    <>
      <div className='mt-8'>
        <TitleCard title="Imported Courses">
          <section className='flex w-full justify-between mb-4'>
            <div className='flex items-center gap-6 w-full mb-2'>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment
                </label>

                <label
                  htmlFor="excelFile"
                  className="flex items-center justify-between w-full rounded-[0.5rem] border border-gray-300 px-4 py-2 text-gray-700 cursor-pointer hover:border-primary hover:bg-[#635bff15] transition"
                >
                  <span className="truncate text-sm">{fileName}</span>
                  <span className="bg-primary text-white hover:bg-primaryemphasis px-3 py-2 rounded-sm text-sm">
                    Choose File
                  </span>
                </label>
                <input
                  id="excelFile"
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only Excel files (.xls, .xlsx) allowed. Max size 10 MB.
                </p>
              </div>

              <div className="flex flex-col text-gray-900 hover:text-gray-700 flex-1">
                <div className='flex items-start gap-2'>
                  <HiOutlineDownload className="w-5 h-5" />
                  <a href="/sample.xlsx" download className="text-sm font-medium">
                    Download Sample File
                  </a>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Click the link above to download a sample file. Ensure you follow the provided format.
                </p>
              </div>
            </div>
          </section>
          <div className='border rounded-md border-ld overflow-hidden'>
            <Table hoverable className='min-w-[700px]'>
              <TableHead>
                <TableRow>
                  <TableHeadCell className='w-[80px] text-center'>Sr. No.</TableHeadCell>
                  <TableHeadCell>Title</TableHeadCell>
                  <TableHeadCell>Code</TableHeadCell>
                  <TableHeadCell>Credits</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className='divide-y divide-border dark:divide-darkborder'>
                {/* {paginatedCourses.map((course, index) => ( */}
                <TableRow key={"1"}>
                  <TableCell className='text-center font-medium'>
                    {/* {(currentPage - 1) * ITEMS_PER_PAGE + index + 1} */}
                  </TableCell>
                  <TableCell className='capitalize'>World History</TableCell>
                  <TableCell >F-001</TableCell>
                  <TableCell>10</TableCell>
                </TableRow>
                {/* ))} */}
                {/* {paginatedCourses.length === 0 && ( */}
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-4'>
                    No Uploaded Data found.
                  </TableCell>
                </TableRow>
                {/* )} */}
              </TableBody>
            </Table>
          </div>
 <div className="mt-6 flex justify-center relative py-4">
          {/* <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          /> */}
          <Button
            type="button"
            color="primary"
            // onClick={() => router.push('/students')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2"
          >
            Save
          </Button>
        </div>
        </TitleCard>
      </div>
    </>

  );
};

export default ImportCourse;
