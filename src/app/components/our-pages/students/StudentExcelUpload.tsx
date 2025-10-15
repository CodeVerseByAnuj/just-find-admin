"use client";
import React, { useState } from "react";
import { HiOutlineDownload } from "react-icons/hi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
} from "flowbite-react";
import TitleCard from "../../shared/TitleBorderCard";
import { importStudents } from "@/app/router/student.router";
import { studentExcelUploadSchema } from "@/lib/schemas/student.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import ErrorModal from "../UI/ErrorModal";

const StudentExcelUpload = () => {

  const [popupModal, setPopupModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  // use null to represent "no file chosen"
  const [fileName, setFileName] = useState<string | null>(null);
  const [failedRows, setFailedRows] = useState<
    Array<{
      row: number;
      error: string;
      data: {
        Department: string;
        "First Name": string;
        "Middle Name"?: string;
        "Last Name": string;
        Email: string;
        Phone: number;
        Password: string;
        "Enrollment Id": number;
        "Roll Number": number;
        DOB: number;
        "Entry Year": number;
        Gender: string;
        "Profile Photo"?: string;
      };
    }>
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{ file: File | undefined }>({
    resolver: zodResolver(studentExcelUploadSchema),
    defaultValues: { file: undefined },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : null);
    setValue("file", file ?? undefined, { shouldValidate: true });
  };

  const clearFile = () => {
    setFileName(null);
    setValue("file", undefined);
    const input = document.getElementById("excelFile") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const onSubmit = async (data: { file: File | undefined }) => {
    if (!data.file) return;

    try {
      const result = await importStudents(data.file); // result is the API payload

      const rows = Array.isArray(result?.failedRows) ? result.failedRows : [];
      setFailedRows(rows);

      reset();
      clearFile();
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message ||
        error?.message ||
        "Upload failed. Please check the file and try again."
      );
      setPopupModal(true);
    }
  };


  return (
    <div className="mt-8">
      <TitleCard title="Imported Students">
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="flex w-full justify-between mb-4">
            <div className="flex items-end gap-6 w-full mb-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment
                </label>

                <div className="flex items-center justify-between w-full rounded-[0.5rem] border border-gray-300 px-4 py-2 text-gray-700 transition">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="truncate text-sm">{fileName ?? "No file chosen"}</span>
                  </div>

                  {fileName ? (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-sm text-sm"
                    >
                      <Trash size={16} />
                    </button>
                  ) : (
                    <label
                      htmlFor="excelFile"
                      className="bg-primary text-white hover:bg-primaryemphasis px-3 py-2 rounded-sm text-sm cursor-pointer"
                    >
                      Choose File
                    </label>
                  )}
                </div>

                <input
                  id="excelFile"
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  {...register("file")}
                  onChange={handleFileChange}
                />

                <p className="mt-1 text-xs text-gray-500">
                  Only Excel files (.xls, .xlsx) allowed. Max size 10 MB.
                </p>
                {errors.file && (
                  <p className="text-xs text-red-500 mt-1">{errors.file.message}</p>
                )}
              </div>

              <div className="flex flex-col text-gray-900 hover:text-gray-700 flex-1">
                <a href="/ExcelimportStudents.xlsx" download className="flex items-start gap-2 border border-black rounded-sm px-3 py-2 me-auto">
                  <HiOutlineDownload className="w-5 h-5" />
                  <span className="text-sm font-medium hover:opacity-75">
                    Download Sample File
                  </span>
                </a>
                <p className="mt-3 text-xs text-gray-500">
                  Click the link above to download a sample file. Ensure you follow the provided format.
                </p>
              </div>
            </div>
          </section>

          {failedRows.length > 0 && (
            <div className="border rounded-md border-ld overflow-auto">
              <Table hoverable className="min-w-[700px]">
                <TableHead>
                  <TableRow>
                    <TableHeadCell className="w-[80px] text-center">Row</TableHeadCell>
                    <TableHeadCell>Error</TableHeadCell>
                    <TableHeadCell>Department</TableHeadCell>
                    <TableHeadCell>First Name</TableHeadCell>
                    <TableHeadCell>Middle Name</TableHeadCell>
                    <TableHeadCell>Last Name</TableHeadCell>
                    <TableHeadCell>Email</TableHeadCell>
                    <TableHeadCell>Phone</TableHeadCell>
                    <TableHeadCell>Enrollment Id</TableHeadCell>
                    <TableHeadCell>Roll No.</TableHeadCell>
                    <TableHeadCell>DOB</TableHeadCell>
                    <TableHeadCell>Entry Year</TableHeadCell>
                    <TableHeadCell>Gender</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y divide-border dark:divide-darkborder">
                  {failedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-center font-medium">{row.row}</TableCell>
                      <TableCell className="text-red-500 text-xs">{row.error}</TableCell>
                      <TableCell>{row.data.Department}</TableCell>
                      <TableCell>{row.data["First Name"]}</TableCell>
                      <TableCell>{row.data["Middle Name"] || ""}</TableCell>
                      <TableCell>{row.data["Last Name"]}</TableCell>
                      <TableCell>{row.data.Email}</TableCell>
                      <TableCell>{row.data.Phone}</TableCell>
                      <TableCell>{row.data["Enrollment Id"]}</TableCell>
                      <TableCell>{row.data["Roll Number"]}</TableCell>
                      <TableCell>{row.data.DOB}</TableCell>
                      <TableCell>{row.data["Entry Year"]}</TableCell>
                      <TableCell>{row.data.Gender}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-6 flex justify-center relative py-4">
            <Button
              type="submit"
              color="primary"
              className="absolute right-0 top-1/2 transform -translate-y-1/2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Save"}
            </Button>
          </div>
        </form>
      </TitleCard>

      <ErrorModal
        msg={errorMsg}
        showModal={popupModal}
        onClose={() => setPopupModal(false)}
      />
    </div>
  );
};

export default StudentExcelUpload;
