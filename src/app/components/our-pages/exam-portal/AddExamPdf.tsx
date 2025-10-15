'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Label, TextInput, Select, Button, } from 'flowbite-react';
import TitleCard from '../../shared/TitleBorderCard';
import { examCreateSchema, ExamCreateInput, examUpdateSchema } from '@/lib/schemas/exam.schema';
import QuestionField from './QuestionField';
import { useQuestionTypes } from '@/hooks/useQuestionTypes';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useDepartmentCourses } from '@/hooks/useDepartmentCourses';
import { useFetchDepartments } from '@/hooks/useFetchDepartments';
import { createExam, getParticularExam, updateExam } from '@/app/router/exam.router';
import api from '@/lib/axios';
import { AxiosProgressEvent } from "axios";
import { Trash } from 'lucide-react';
import type { UploadFn } from '@/utils/fileUtils';
import ClockTimePicker from './ClockTimePicker';

import { createFileHandlers } from '@/utils/fileUtils';

const AddExamPdf = () => {
    const { questionTypes, loading: questionTypesLoading } = useQuestionTypes();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { examTypes, loading: examTypesLoading } = useExamTypes();
    const ImageUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

    const searchParams = useSearchParams();
    const examId = searchParams.get('id');
    const isEditing = !!examId;

    const {
        register,
        control,
        handleSubmit,
        watch,
        trigger,
        reset,
        setValue,
        formState: { errors },
    } = useForm<ExamCreateInput>({
        resolver: zodResolver(examUpdateSchema),
        mode: 'onChange',
        defaultValues: {
            department_id: undefined,
            course_id: undefined,
            exam_type_id: undefined,
            max_marks: 100,
            exam_date: '',
            exam_time: '',
            rubric_url: '',
            exam_question_file: '',
            questions: isEditing
                ? []
                : [
                    {
                        question_number: '1',
                        question: '',
                        has_sub_question: false,
                        rubric_json: '',
                        max_marks: 0,
                        question_type_id: undefined,
                        sub_questions: [],
                    },
                ],
        },
    });

    const selectedDepartmentId = watch('department_id');
    const { courses, loading: coursesLoading } = useDepartmentCourses(Number(selectedDepartmentId));
    const { data: departmentData, isLoading: departmentsLoading } = useFetchDepartments();

    const [loading, setLoading] = useState(false);
    const [examData, setExamData] = useState<{ exam: any; question: any[] } | null>(null);
    const [isFormInitialized, setIsFormInitialized] = useState(false);

    const [isSubmitted, setIsSubmitted] = useState(false);

    const [uploadingRubric, setUploadingRubric] = useState(false);
    const [uploadRubricError, setUploadRubricError] = useState<string | null>(null);
    const [uploadQuestionError, setUploadQuestionError] = useState<string | null>(null);
    const [uploadingQuestion, setUploadingQuestion] = useState(false);
    const [uploadQuestionProgress, setUploadQuestionProgress] = useState<number>(0);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const questionFileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedRubricName, setSelectedRubricName] = useState<string | null>(null);
    const [selectedQuestionName, setSelectedQuestionName] = useState<string | null>(null);

    const filteredCourses = courses;

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: 'questions',
    });

    const watchedQuestions = watch('questions');

    const transformExamDataForForm = (apiData: { exam: any; question: any[] }): ExamCreateInput => {
        const { exam, question } = apiData;

        const transformedQuestions = question.map((q) => ({
            id: q.id,
            question_number: q.question_number.toString(),
            question: q.question || '',
            has_sub_question: q.has_sub_question,
            max_marks: q.max_marks,
            rubric_json: q.rubric_json || '',
            question_type_id: q.question_type,
            sub_questions: (q.sub_questions || []).map((sq: any) => ({
                id: sq.id,
                has_sub_question: false,
                sub_question_number: sq.sub_question_number,
                question: sq.question,
                question_type_id: sq.question_type,
                max_marks: sq.max_marks,
                rubric_json: sq.rubric_json || '',
            })),
        }));

        const formData = {
            id: exam.id,
            course_id: exam.course?.id || undefined,
            department_id: exam.department?.id || undefined,
            exam_type_id: exam.exam_type?.id || undefined,
            max_marks: exam.max_marks || 100,
            exam_date: exam.exam_date || '',
            exam_time: exam.exam_time || '',
            rubric_url: exam.rubric_url || '',
            exam_question_file: exam.exam_question_file || '',
            published: exam.published || false,
            questions: transformedQuestions,
        };

        return formData;
    };

    console.log(examData, 'Exam Data');

    useEffect(() => {
        if (isEditing && examId) {
            const fetchExamData = async () => {
                try {
                    setLoading(true);
                    const data = await getParticularExam(parseInt(examId));
                    if (data) {
                        setExamData(data);
                    }
                } catch (error) {
                    console.error('Error fetching exam data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchExamData();
        }
    }, [examId, isEditing]);

    useEffect(() => {
        if (
            examData &&
            !coursesLoading &&
            !examTypesLoading &&
            examTypes.length > 0 &&
            !isFormInitialized
        ) {
            const formData = transformExamDataForForm(examData);
            formData.exam_question_file = formData.exam_question_file || '';
            reset(formData);
            setIsFormInitialized(true);
        }
    }, [examData, coursesLoading, examTypesLoading, examTypes.length, isFormInitialized, isEditing]);

    // Separate effect to handle course selection after courses are loaded
    useEffect(() => {
        if (isEditing && examData && courses.length > 0 && isFormInitialized) {
            const expectedCourseId = examData.exam?.course?.id;
            const currentCourseId = watch('course_id');
            if (expectedCourseId) {
                const courseExists = courses.some(course => course.id === expectedCourseId);
                if (courseExists && currentCourseId !== expectedCourseId) {
                    setValue('course_id', expectedCourseId, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                    });
                } else if (courseExists && currentCourseId === expectedCourseId) {
                    trigger('course_id');
                }
            }
        }
    }, [isEditing, examData, courses, isFormInitialized, selectedDepartmentId, setValue, watch, trigger]);

    const addQuestion = () => {
        // const defaultTypeId = questionTypes.length > 0 ? questionTypes[0].id : undefined;

        appendQuestion({
            question_number: (questionFields.length + 1).toString(),
            question: '',
            has_sub_question: false,
            max_marks: 0,
            rubric_json: '',
            // exam_question_file: null,
            question_type_id: undefined,
            sub_questions: [],
        });
    };

    const rubricUploadFn: UploadFn = async (file, onProgress, signal) => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/file-upload', fd, {
            signal,
            onUploadProgress: (ev: AxiosProgressEvent) => {
                if (ev.total) {
                    const percent = Math.round((ev.loaded * 100) / ev.total);
                    onProgress?.(percent);
                }
            },
        });
        return res.data?.data;
    };

    const questionUploadFn: UploadFn = async (file, onProgress, signal) => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/file-upload', fd, {
            signal,
            onUploadProgress: (ev: AxiosProgressEvent) => {
                if (ev.total) {
                    const percent = Math.round((ev.loaded * 100) / ev.total);
                    onProgress?.(percent);
                }
            },
        });
        return res.data?.data;
    };

    const rubricHandlers = React.useMemo(
        () =>
            createFileHandlers({
                uploadFn: rubricUploadFn,
                setSelectedName: setSelectedRubricName,
                setValue,
                setError: setUploadRubricError,
                fileInputRef,
                fieldName: 'rubric_url',
                allowedMime: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/png',
                    'image/jpeg',
                ],
                allowedExt: ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
                maxSizeMB: 10,
                onUploadProgress: (p: number) => setUploadProgress(p),
                onUploadStart: () => {
                    setUploadProgress(0);
                    setUploadingRubric(true);
                },
                onUploadSuccess: (res) => {
                    // factory already writes setValue(fieldName, res.url) if res has url.
                    // If your backend returns a plain string (url), factory will set that value directly.
                    setUploadingRubric(false);
                },
                onUploadError: () => {
                    setUploadingRubric(false);
                },
            }),
        [setSelectedRubricName, setUploadRubricError, setValue] // minimal deps
    );

    const questionHandlers = React.useMemo(
        () =>
            createFileHandlers({
                uploadFn: questionUploadFn,
                setSelectedName: setSelectedQuestionName,
                setValue,
                setError: setUploadQuestionError,
                fileInputRef: questionFileInputRef,
                fieldName: 'exam_question_file',
                allowedMime: ['application/pdf'],
                allowedExt: ['.pdf'],
                maxSizeMB: 10,
                onUploadProgress: (p: number) => setUploadQuestionProgress(p),
                onUploadStart: () => {
                    setUploadQuestionProgress(0);
                    setUploadingQuestion(true);
                },
                onUploadSuccess: () => setUploadingQuestion(false),
                onUploadError: () => setUploadingQuestion(false),
            }),
        [setSelectedQuestionName, setUploadQuestionError, setValue]
    );

    const onSubmit = async (data: ExamCreateInput) => {
        setIsSubmitted(true);
        try {
            setLoading(true);
            if (isEditing) {
                const result = await updateExam(parseInt(examId!), data);
                if (result) {
                    await queryClient.invalidateQueries({ queryKey: ['all-exams'] });
                    router.push('/exams');
                }
            } else {
                const result = await createExam(data);
                if (result) {
                    await queryClient.invalidateQueries({ queryKey: ['all-exams'] });
                    router.push('/exams');
                }
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
        } finally {
            setLoading(false);
        }
    };

    const onError = (errors: any) => {
        setIsSubmitted(true);
        console.log('Form Errors:', errors);
    };

    // Check if course dropdown should be disabled
    const shouldDisableCourseSelect = coursesLoading || !selectedDepartmentId;

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)}>
            <TitleCard title={isEditing ? 'Edit Exam' : 'Add Exam'}>
                <div className="col-span-12 pb-6">
                    <h6 className="text-lg font-semibold">Exam Details</h6>
                </div>

                <div className="grid grid-cols-12 gap-6 pb-6">
                    {/* Department */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="mb-2">
                            <Label htmlFor="department">
                                Department <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <Select {...register('department_id')} disabled={departmentsLoading}>
                            <option value="">{departmentsLoading ? 'Loading departments...' : 'Select department'}</option>
                            {departmentData?.data?.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.name} ({department.code})
                                </option>
                            ))}
                        </Select>
                        {errors.department_id && isSubmitted && (
                            <p className="text-red-500 text-sm">{errors.department_id.message}</p>
                        )}
                    </div>

                    {/* Course */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="mb-2">
                            <Label htmlFor="course">
                                Course <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <Select
                            {...register('course_id')}
                            disabled={shouldDisableCourseSelect}
                            key={`course-select-${selectedDepartmentId}-${courses.length}`}
                        >
                            <option value="">
                                {!selectedDepartmentId
                                    ? 'Select department first'
                                    : coursesLoading
                                        ? 'Loading courses...'
                                        : filteredCourses.length === 0
                                            ? 'No courses found for department'
                                            : 'Select course'}
                            </option>
                            {filteredCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title} ({course.code})
                                </option>
                            ))}
                        </Select>
                        {errors.course_id && isSubmitted && (
                            <p className="text-red-500 text-sm">{errors.course_id.message}</p>
                        )}
                    </div>

                    {/* Exam Type */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="mb-2">
                            <Label htmlFor="exam-type">
                                Exam Type <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <Select id="exam-type" {...register('exam_type_id')} disabled={examTypesLoading}>
                            <option value="">{examTypesLoading ? 'Loading exam types...' : 'Select exam type'}</option>
                            {examTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.title}
                                </option>
                            ))}
                        </Select>
                        {errors.exam_type_id && isSubmitted && (
                            <p className="text-red-500 text-sm">{errors.exam_type_id.message}</p>
                        )}
                    </div>

                    {/* Max Marks */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="mb-2">
                            <Label htmlFor="max_marks">Max Marks <span className="text-red-500">*</span></Label>
                        </div>
                        <TextInput
                            id="max_marks"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="10"
                            {...register('max_marks', {
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                },
                            })}
                        />
                        {errors.max_marks && (errors.max_marks.type !== 'required' || isSubmitted) && (
                            <p className="text-red-500 text-sm mt-1">{errors.max_marks.message}</p>
                        )}
                    </div>

                    {/* Exam Date */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="mb-2">
                            <Label htmlFor="exam-date">
                                Exam Date <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <TextInput
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            {...register('exam_date')}
                        />
                        {errors.exam_date && isSubmitted && (
                            <p className="text-red-500 text-sm mt-1">{errors.exam_date.message}</p>
                        )}
                    </div>

                    {/* Exam Time */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="mb-2">
                            <Label htmlFor="exam_time">
                                Exam Time <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <ClockTimePicker
                            value={watch('exam_time')}
                            onChange={(val: string) => setValue('exam_time', val, { shouldValidate: true, shouldDirty: true })}
                        />
                        {errors.exam_time && isSubmitted && (
                            <p className="text-red-500 text-sm mt-1">{errors.exam_time.message}</p>
                        )}
                    </div>

                    {/* Rubric File Upload */}

                    <div className="col-span-12">
                        <div className="mb-2">
                            <Label htmlFor="rubric-file">Upload Rubric File <span className="text-red-500">*</span></Label>
                        </div>

                        <div
                            onDrop={rubricHandlers.handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed rounded-lg p-4 flex items-center justify-between bg-gray-50 dark:bg-slate-800"
                        >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div className="w-12 h-12 flex items-center justify-center rounded bg-white shadow-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9M8 8l4-4 4 4M12 4v8"
                                        />
                                    </svg>
                                </div>

                                <div className="truncate">
                                    <p className="text-sm font-medium">
                                        {/* Show file name from upload or from edit case */}
                                        {selectedRubricName
                                            ? selectedRubricName
                                            : (isEditing && watch('rubric_url'))
                                                ? watch('rubric_url')!.split('/').pop()
                                                : "Drag & drop your rubric file here"}
                                    </p>

                                    <div className="mt-2">
                                        {uploadingRubric ? (
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                <div
                                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        ) : uploadRubricError ? (
                                            <span className="text-sm text-red-500">{uploadRubricError}</span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                                <input
                                    id="rubric-file-input"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf,.docx,image/png,image/jpeg"
                                    className="hidden"
                                    onChange={rubricHandlers.handleInputChange}
                                />

                                {(selectedRubricName || (isEditing && watch('rubric_url'))) ? (
                                    <div className="flex gap-2">
                                        {isEditing && watch('rubric_url') && (
                                            <a
                                                href={watch('rubric_url') ? `${ImageUrl}/${watch('rubric_url')}` : undefined}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-primary text-white hover:bg-primaryemphasis px-3 py-2 rounded-sm text-sm"
                                            >
                                                Download
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                rubricHandlers.removeFile();
                                                setValue('rubric_url', '');
                                                setSelectedRubricName(null);
                                            }}
                                            className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-sm text-sm"
                                        >
                                            <Trash className='w-4 h-4 text-white' />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="rubric-file-input"
                                        className="bg-primary text-white hover:bg-primaryemphasis px-3 py-2 rounded-sm text-sm cursor-pointer"
                                    >
                                        Choose File
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* {(selectedRubricName || (isEditing && watch('rubric_url'))) && (
                            <p className="text-sm mt-2">
                                Selected file: <span className="font-medium">{selectedRubricName || (isEditing && watch('rubric_url') && typeof watch('rubric_url') === 'string' && watch('rubric_url') !== null ? watch('rubric_url')!.split('/').pop() : '')}</span>
                            </p>
                        )} */}
                        {errors.rubric_url && isSubmitted && (
                            <p className="text-red-500 text-sm mt-1">{errors.rubric_url.message}</p>
                        )}
                    </div>


                    {/* Question File Upload */}

                    <div className="col-span-12">
                        <div className="mb-2">
                            <Label htmlFor="question-file">Upload Question Paper <span className='text-red-500'>*</span></Label>
                        </div>

                        <div
                            onDrop={questionHandlers.handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed rounded-lg p-4 flex items-center justify-between bg-gray-50 dark:bg-slate-800"
                        >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div className="w-12 h-12 flex items-center justify-center rounded bg-white shadow-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9M8 8l4-4 4 4M12 4v8"
                                        />
                                    </svg>
                                </div>

                                <div className="truncate">
                                    <p className="text-sm font-medium">
                                        {/* Show file name from upload or from edit case */}
                                        {selectedQuestionName
                                            ? selectedQuestionName
                                            : (isEditing && watch('exam_question_file'))
                                                ? watch('exam_question_file')!.split('/').pop()
                                                : "Drag & drop your question file here"}
                                    </p>
                                    <p className="text-xs text-gray-500">PDF</p>

                                    <div className="mt-2">
                                        {uploadingQuestion ? (
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                <div
                                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadQuestionProgress}%` }}
                                                />
                                            </div>
                                        ) : uploadQuestionError ? (
                                            <span className="text-sm text-red-500">{uploadQuestionError}</span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                                <input
                                    id="question-file-input"
                                    ref={questionFileInputRef}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    className="hidden"
                                    onChange={questionHandlers.handleInputChange}
                                />

                                {(selectedQuestionName || (isEditing && watch('exam_question_file'))) ? (
                                    <div className="flex gap-2">
                                        {isEditing && watch('exam_question_file') && (
                                            <a
                                                href={watch('exam_question_file') ? `${ImageUrl}/${watch('exam_question_file')}` : undefined}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-primary text-white hover:bg-primaryemphasis px-3 py-2 rounded-sm text-sm"
                                            >
                                                Download
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                questionHandlers.removeFile();
                                                setValue('exam_question_file', '');
                                                setSelectedQuestionName(null);
                                            }}
                                            className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-sm text-sm"
                                        >
                                            <Trash className='w-4 h-4 text-white' />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="question-file-input"
                                        className="bg-primary text-white hover:bg-primaryemphasis px-3 py-2 rounded-sm text-sm cursor-pointer"
                                    >
                                        Choose File
                                    </label>
                                )}
                            </div>
                        </div>

                        {errors.exam_question_file && isSubmitted && (
                            <p className="text-red-500 text-sm mt-2">{errors.exam_question_file.message}</p>
                        )}

                        {/* {(selectedQuestionName || (isEditing && watch('exam_question_file'))) && (
                            <p className="text-sm mt-2" aria-live="polite">
                                Selected file: <span className="font-medium">{selectedQuestionName || (isEditing && watch('exam_question_file') && typeof watch('exam_question_file') === 'string' && watch('exam_question_file') ? watch('exam_question_file')!.split('/').pop() : '')}</span>
                            </p>
                        )} */}
                    </div>

                </div>

                {isEditing && questionFields.length > 0 && (
                    <>
                        <div className="col-span-12 pb-6 border-t border-border pt-5 dark:border-darkborder">
                            <h6 className="text-lg font-semibold">Questions</h6>
                        </div>
                        {questionFields.map((field, qIndex) => {
                            const originalQuestionData = examData?.question?.[qIndex];
                            return (
                                <QuestionField
                                    key={field.id}
                                    qIndex={qIndex}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    watchedQuestions={watchedQuestions || []}
                                    removeQuestion={removeQuestion}
                                    trigger={trigger}
                                    setValue={setValue}
                                    isSubmitted={isSubmitted}
                                    questionId={field.question_type_id}
                                    originalQuestionData={originalQuestionData}
                                    questionTypes={questionTypes}
                                    loading={questionTypesLoading}
                                />
                            );
                        })}
                        {errors.questions && typeof errors.questions === 'object' && 'message' in errors.questions && (
                            <p className="text-red-500 text-sm mt-1">{errors.questions.message}</p>
                        )}
                        {/* <div className="col-span-12 mt-4">
                            <Button size="sm" disabled color="gray" onClick={addQuestion} type="button">
                                + Add Question
                            </Button>
                        </div> */}
                    </>
                )}

                <div className="mt-6 flex justify-end space-x-2">
                    <Button color="light" onClick={() => router.push('/exams')}>
                        Back
                    </Button>
                    <Button type="submit" color="primary" disabled={loading}>
                        {loading ? 'Loading...' : isEditing ? 'Update' : 'Save'}
                    </Button>
                </div>
            </TitleCard>
        </form>
    );
};

export default AddExamPdf