"use client";
import React, { useState, useRef } from "react";
import { Button, Progress, Spinner } from "flowbite-react";
import TitleCard from "../../shared/TitleBorderCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadExamFileSchema } from "@/lib/schemas/exam.schema";
import { uploadExamFile } from "@/app/router/exam.router";
import { HiOutlineTrash } from "react-icons/hi";
import { useSearchParams } from "next/navigation";
import { useParticularExam } from "@/hooks/useParticularExam";

const UploadExam = () => {
    const [fileName, setFileName] = useState<string>("No file chosen");
    const [isValidFile, setIsValidFile] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryParams = useSearchParams();
    const idParam = queryParams.get("id");
    const examId = idParam ? parseInt(idParam, 10) : null;

    // Fetch exam details using React Query
    const { data: examData, isLoading: isLoadingExam, error: examError } = useParticularExam(examId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{ file: File | undefined }>({
    resolver: zodResolver(UploadExamFileSchema),
    defaultValues: { file: undefined },
  });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
    if (!file) {
      setFileName("No file chosen");
      setIsValidFile(false);
            setValue("file", undefined, { shouldValidate: true });
      return;
    }

    const isZip = file.name.toLowerCase().endsWith(".zip");
    setIsValidFile(isZip);
    setFileName(file.name);
        setValue("file", isZip ? file : undefined, { shouldValidate: true });
    setUploadProgress(0);
  };

  const handleDeleteFile = () => {
    setFileName("No file chosen");
        setValue("file", undefined, { shouldValidate: true });
    reset({ file: undefined });
    setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
  };

  const onSubmit = async (data: { file: File | undefined }) => {
    if (!data.file || examId === null) return;
    try {
      setUploadProgress(0);
      await uploadExamFile(examId, data.file, setUploadProgress);
      reset();
      setFileName("No file chosen");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress(0);
    }
  };

  return (
    <div className="mt-8">
      <TitleCard title="Upload Exam Answer Sheet">
                {/* Exam Details Section */}
        {isLoadingExam ? (
                    <div className="mb-6">
                        <div className="flex justify-center items-center py-8">
            <Spinner size="lg" />
            <span className="ml-3">Loading exam details...</span>
                        </div>
          </div>
        ) : examError ? (
                    <div className="mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">Failed to load exam details. Please try again.</p>
                        </div>
          </div>
        ) : examData?.exam ? (
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-bold text-gray-700">Course:</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-md text-sm">
                {examData.exam.course.title} ({examData.exam.course.code})
              </p>
            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-bold text-gray-700">Department:</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-md text-sm">
                {examData.exam.department.name}
              </p>
            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-bold text-gray-700">Exam Type:</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-md text-sm">
                {examData.exam.exam_type.title}
              </p>
            </div>
          </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800">Please ensure exam details are loaded before uploading files.</p>
                    </div>
                )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="flex flex-col w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment
            </label>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* File Box */}
            <label
              htmlFor="zipFile"
                                className="flex items-center justify-between flex-1 rounded-[0.5rem] border border-gray-300 px-3 sm:px-4 py-2 text-gray-700 cursor-pointer hover:border-primary hover:bg-[#635bff15] transition"
            >
                                <span className="truncate text-xs sm:text-sm max-w-[120px] sm:max-w-none">{fileName}</span>

              {fileName === "No file chosen" ? (
                                    <span className="bg-primary text-white hover:bg-primaryemphasis px-2 sm:px-3 py-1 sm:py-2 rounded-sm text-xs sm:text-sm whitespace-nowrap">
                  Choose File
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteFile}
                                        className="p-1.5 sm:p-2 rounded-md bg-red-500 hover:bg-red-600 transition-colors"
                                        aria-label="Delete file"
                >
                                        <HiOutlineTrash size={16} className="text-white sm:w-5 sm:h-5" />
                </button>
              )}
            </label>
                        </div>

            <input
              id="zipFile"
              type="file"
              accept=".zip"
              className="hidden"
              {...register("file")}
              ref={fileInputRef}
              onChange={handleFileChange}
            />

                        <p className="mt-1 text-xs font-semibold text-gray-500"><span className="text-red-500">NOTE:</span> Upload a ZIP file containing PDF files, each named according to the student's roll number (e.g., 12345.pdf).</p>
            {errors.file && (
                            <p className="text-xs text-red-500 mt-1">{errors.file.message}</p>
            )}

                        {/* Progress Bar */}
            {isSubmitting && (
              <div className="mt-4">
                <Progress
                  progress={uploadProgress}
                  color="indigo"
                  size="lg"
                />
              </div>
            )}
          </section>

          <div className="mt-6 flex justify-center sm:justify-end py-4">
            <Button
              type="submit"
              color="primary"
                            className="w-full sm:w-auto px-6 py-2 !disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSubmitting || !examData?.exam || !isValidFile}
            >
              {isSubmitting ? "Uploading..." : "Save"}
            </Button>
          </div>
        </form>

      </TitleCard>
    </div>
  );
};

export default UploadExam;