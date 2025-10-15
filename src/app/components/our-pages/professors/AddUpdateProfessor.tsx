'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
    Button,
    Label,
    Select,
    TextInput,
} from 'flowbite-react';
import TitleCard from '@/app/components/shared/TitleBorderCard';
import Multiselect from 'multiselect-react-dropdown';
import {
    addProfessorSchema,
    AddProfessor,
} from '@/lib/schemas/professor.schema';
import {
    createProfessor,
    getProfessorById,
    updateProfessor,
} from '@/app/router/professor.router';
import { Department } from '@/lib/schemas/department.schema';
import { Course } from '@/lib/schemas/course.schema';
import { useFetchCourses } from '@/hooks/useFetchCourses';
import { useFetchDepartments } from '@/hooks/useFetchDepartments';
import { useDepartmentCourses } from '@/hooks/useDepartmentCourses';

const AddUpdateProfessor = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const professorId = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [professorData, setProfessorData] = useState<any>(null);
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
    console.log('Selected course IDs:', selectedCourseIds);


    // 🔹 Use special fetch functions
    const { data: departmentsData, isLoading: isDepartmentsLoading, error: departmentsError } = useFetchDepartments();
    const { data: coursesData, isLoading: isCoursesLoading, error: coursesError } = useFetchCourses();

    const allDepartments: Department[] = departmentsData?.data || [];
    const allCourses: Course[] = coursesData?.data || [];

    const departmentOptions = allDepartments.map((dept) => (
        <option key={dept.id} value={dept.id}>
            {dept.name}
        </option>
    ));

    // 🔹 Loading and error states
    const isFormLoading = isDepartmentsLoading || isCoursesLoading;
    const hasDataErrors = departmentsError || coursesError;



    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors },
        reset,
        setValue,
    } = useForm<Omit<AddProfessor, 'password' | 'profile_photo' | 'user_role_id'>>({
        resolver: zodResolver(addProfessorSchema.omit({ password: true, profile_photo: true, user_role_id: true })),
        mode: 'onChange',
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            phone: '',
            dob: '',
            gender: 'male',
            department_id: undefined,
            course_ids: [], // Use course_ids array instead of course_id
            designation: '',
            employee_id: '',
        },
    });

    const { data: departmentData, isLoading: departmentsLoading } = useFetchDepartments();
    const selectedDepartmentId = watch('department_id');
    const { courses, loading: coursesLoading } = useDepartmentCourses(Number(selectedDepartmentId));
    const filteredCourses = courses;

    const shouldDisableCourseSelect = coursesLoading || !selectedDepartmentId;

    // const [isFormInitialized, setIsFormInitialized] = useState(false);


    const professorID = searchParams.get('id');
    const isEditing = !!professorID;

    useEffect(() => {
        const fetchProfessor = async () => {
            if (professorId) {
                setLoading(true);
                try {
                    const professor = await getProfessorById(Number(professorId));
                    setProfessorData(professor.data);
                } catch (err) {
                    console.error('Failed to fetch professor:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfessor();
    }, [professorId]);

    useEffect(() => {
        if (isEditing && professorData && courses.length > 0) {
            const expectedCourseIds = professorData.course?.map((courseRel: any) => courseRel.course.id) || [];
            const currentCourseIds = watch('course_ids') || [];
            if (expectedCourseIds.length > 0) {
                const validCourseIds = expectedCourseIds.filter((courseId: number) => 
                    courses.some(course => course.id === courseId)
                );
                if (validCourseIds.length > 0 && JSON.stringify(currentCourseIds.sort()) !== JSON.stringify(validCourseIds.sort())) {
                    setValue('course_ids', validCourseIds, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                    });
                    setSelectedCourseIds(validCourseIds);
                } else if (validCourseIds.length > 0) {
                    trigger('course_ids');
                }
            }
        }
    }, [isEditing, professorData, courses, selectedDepartmentId, setValue, watch, trigger]);

    // Clear selected courses when department changes (except during initial load)
    useEffect(() => {
        // Only clear courses if we're not editing or if we don't have professor data yet
        // This prevents clearing courses during edit mode when department is being set
        if (!isEditing && selectedDepartmentId) {
            setSelectedCourses([]);
            setSelectedCourseIds([]);
            setValue('course_ids', [], {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
            });
        }
    }, [selectedDepartmentId, isEditing, setValue]);

    const designationMap: Record<string, string> = {
        "Assistant": "Assistant",
        "Associate": "Associate",
        "Professor": "Professor",
        "Guest Faculty": "Guest Faculty",
    };


    // Reset form when professor data is available
    useEffect(() => {
        if (professorData && !isFormLoading) {
            // Get the first course ID if professor has courses, otherwise undefined
            const firstCourseId = professorData.course && professorData.course.length > 0
                ? professorData.course[0].course.id
                : undefined;

            reset({
                first_name: professorData.first_name || '',
                middle_name: professorData.middle_name || '',
                last_name: professorData.last_name || '',
                email: professorData.email || '',
                phone: professorData.phone || '',
                dob: professorData.dob || '',
                gender: professorData.gender || 'male',
                department_id: professorData.department?.id || undefined,
                course_ids: firstCourseId ? [firstCourseId] : [],
                designation: designationMap[professorData.designation] || "",
                employee_id: professorData.employee_id || '',
                course_prof_id: professorData?.course[0]?.id || undefined
            });

            console.log('Reset form with professor data:', {
                department_id: professorData.department?.id,
                course_id: firstCourseId,
                professor_courses: professorData.course,
                selected_courses: professorData.course?.map((courseRel: any) => courseRel.course)
            });
        }
    }, [professorData, isFormLoading, reset]);

    // Set selected courses for multiselect when professor data and department courses are both available
    useEffect(() => {
        if (isEditing && professorData && courses.length > 0 && !coursesLoading) {
            // Get professor's courses from the professor data
            if (professorData.course && professorData.course.length > 0) {
                const professorCourses = professorData.course.map((courseRel: any) => courseRel.course);
                
                // Filter professor courses to only include ones that exist in the current department's courses
                const availableProfessorCourses = professorCourses.filter((professorCourse: Course) => 
                    courses.some((departmentCourse: Course) => departmentCourse.id === professorCourse.id)
                );
                const availableCourseIds = availableProfessorCourses.map((course: Course) => course.id);
                
                // Set the selected courses without checking previous state to avoid infinite loops
                setSelectedCourses(availableProfessorCourses);
                setSelectedCourseIds(availableCourseIds);
                
                console.log('Updated selected courses for editing:', {
                    professor_courses: professorCourses,
                    available_courses: availableProfessorCourses,
                    course_ids: availableCourseIds
                });
            } else {
                // If professor has no courses, clear the selection
                setSelectedCourses([]);
                setSelectedCourseIds([]);
            }
        }
    }, [isEditing, professorData, courses, coursesLoading]);



    const onSubmit = async (data: Omit<AddProfessor, 'password' | 'profile_photo' | 'user_role_id'>) => {
        try {
            setLoading(true);

            // Validate that required fields are selected
            if (!data.department_id) {
                console.error('Department is required');
                alert('Department is required');
                return;
            }

            if (selectedCourseIds.length === 0) {
                console.error('At least one course is required');
                alert('At least one course is required');
                return;
            }

            console.log('Submitting with selected courses:', selectedCourseIds, selectedCourses);

            // Add default password, profile_photo, and user_role_id to the data
            const formattedData = {
                ...data,
                course_ids: selectedCourseIds, // Send multiple course IDs
                password: 'Qwerty123', // Always send default password
                profile_photo: '', // Default empty string for profile photo
                user_role_id: 2, // Always send default user role ID (Professor)
            };
            const updateFormattedData = {
                ...data,
                course_ids: selectedCourseIds, // Send multiple course IDs
                profile_photo: '', // Default empty string for profile photo
                user_role_id: 2, // Always send default user role ID (Professor)
            };


            if (professorId) {
                const result = await updateProfessor(Number(professorId), updateFormattedData);
                if (result) {
                    console.log('Professor updated');
                    await queryClient.invalidateQueries({ queryKey: ['all-professors'] });
                    await queryClient.invalidateQueries({ queryKey: ['departments-for-professors'] });
                    await queryClient.invalidateQueries({ queryKey: ['courses-for-professors'] });
                    router.push('/professors');
                }
            } else {
                const result = await createProfessor(formattedData);
                if (result) {
                    console.log('Professor created');
                    await queryClient.invalidateQueries({ queryKey: ['all-professors'] });
                    await queryClient.invalidateQueries({ queryKey: ['departments-for-professors'] });
                    await queryClient.invalidateQueries({ queryKey: ['courses-for-professors'] });
                    router.push('/professors');
                }
            }
            reset();
        } catch (error) {
            console.error('Error in submission:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TitleCard title={professorId ? 'Update Professor' : 'Add Professor'}>
            {/* Show loading state for data fetching */}
            {isFormLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="text-lg">Loading departments and courses...</div>
                </div>
            )}

            {/* Show error state if data fetching fails */}
            {hasDataErrors && !isFormLoading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">
                        <strong>Error loading data:</strong>
                        {departmentsError && <div>• Failed to load departments</div>}
                        {coursesError && <div>• Failed to load courses</div>}
                        <div className="mt-2 text-sm">Please refresh the page to try again.</div>
                    </div>
                </div>
            )}

            {/* Main form - only show when data is loaded */}
            {!isFormLoading && (
                <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-12 gap-6">
                        {/* First Name */}
                        <div className="lg:col-span-4 col-span-12">
                            <Label htmlFor="first_name" className="mb-2 block">
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="first_name"
                                placeholder="First Name"
                                {...register('first_name')}
                            />
                            {errors.first_name && (
                                <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>
                            )}
                        </div>

                        {/* Middle Name */}
                        <div className="lg:col-span-4 col-span-12">
                            <Label htmlFor="middle_name" className="mb-2 block">
                                Middle Name
                            </Label>
                            <TextInput
                                id="middle_name"
                                placeholder="Middle Name (Optional)"
                                {...register('middle_name')}
                            />
                            {errors.middle_name && (
                                <p className="text-sm text-red-500 mt-1">{errors.middle_name.message}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="lg:col-span-4 col-span-12">
                            <Label htmlFor="last_name" className="mb-2 block">
                                Last Name <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="last_name"
                                placeholder="Last Name"
                                {...register('last_name')}
                            />
                            {errors.last_name && (
                                <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="lg:col-span-6 col-span-12">
                            <Label htmlFor="gender" className="mb-2 block">
                                Gender <span className="text-red-500">*</span>
                            </Label>
                            <Select id="gender" {...register('gender')} required>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
                            )}
                        </div>

                        {/* Department */}
                        <div className="col-span-12 lg:col-span-6">
                            <div className="mb-2">
                                <Label htmlFor="department">
                                    Department <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <Select required={false} {...register('department_id')} disabled={departmentsLoading}>
                                <option value="">{departmentsLoading ? 'Loading departments...' : 'Select Department'}</option>
                                {departmentData?.data?.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name} ({department.code})
                                    </option>
                                ))}
                            </Select>


                            {errors.department_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.department_id.message}</p>
                            )}
                            {departmentsError && (
                                <p className="text-sm text-red-500 mt-1">Failed to load departments</p>
                            )}
                        </div>

                        {/* Course */}
                        <div className="col-span-12 lg:col-span-6">
                            <div className="mb-2">
                                <Label htmlFor="course">
                                    Courses <span className="text-red-500">*</span>
                                </Label>
                            </div>

                            {!selectedDepartmentId ? (
                                <div className="flex items-center px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-gray-300 rounded-sm">
                                    Select department first
                                </div>
                            ) : coursesLoading ? (
                                <div className="flex items-center px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-gray-300 rounded-sm">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading courses...
                                </div>
                            ) : filteredCourses.length === 0 ? (
                                <div className="flex items-center px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-gray-300 rounded-sm">
                                    No courses found for department
                                </div>
                            ) : (
                                <div className="relative multiselect-wrapper">
                                    <Multiselect
                                        options={filteredCourses}
                                        selectedValues={selectedCourses}
                                        onSelect={(selectedList) => {
                                            setSelectedCourses(selectedList);
                                            // Update selected course IDs for multi-select functionality
                                            const courseIds = selectedList.map((course: Course) => course.id);
                                            setSelectedCourseIds(courseIds);
                                            // Update form value with all course IDs
                                            setValue('course_ids', courseIds, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                                shouldTouch: true
                                            });
                                        }}
                                        onRemove={(selectedList) => {
                                            setSelectedCourses(selectedList);
                                            // Update selected course IDs for multi-select functionality
                                            const courseIds = selectedList.map((course: Course) => course.id);
                                            setSelectedCourseIds(courseIds);
                                            // Update form value with all course IDs
                                            setValue('course_ids', courseIds, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                                shouldTouch: true
                                            });
                                        }}
                                        displayValue="title"
                                        placeholder="Select courses"
                                        showCheckbox={true}
                                        closeIcon="cancel"
                                        customCloseIcon={
                                            <span className="ml-1 text-white hover:text-gray-200 cursor-pointer font-medium text-sm">×</span>
                                        }
                                        avoidHighlightFirstOption={true}
                                        emptyRecordMsg="No courses available"
                                        className="multiselect-container"
                                        // selectionLimit removed to allow unlimited selection
                                        showArrow={true}
                                    />
                                </div>
                            )}

                            {selectedCourseIds.length === 0 && !coursesLoading && filteredCourses.length > 0 && (
                                <p className="text-sm text-red-500 mt-1">At least one course is required</p>
                            )}
                            {selectedCourseIds.length > 0 && (
                                <p className="text-sm text-green-600 mt-1">
                                    {selectedCourseIds.length} course{selectedCourseIds.length > 1 ? 's' : ''} selected
                                </p>
                            )}
                            {errors.course_ids && (
                                <p className="text-sm text-red-500 mt-1">{errors.course_ids.message}</p>
                            )}
                            {coursesError && (
                                <p className="text-sm text-red-500 mt-1">Failed to load courses</p>
                            )}
                        </div>

                        {/* Designation */}
                        <div className="lg:col-span-6 col-span-12">
                            <Label htmlFor="designation" className="mb-2 block">
                                Designation <span className="text-red-500">*</span>
                            </Label>
                            <Select id="designation" {...register('designation')} required>
                                <option value="">Select designation</option>
                                <option value="Assistant">Assistant Professor</option>
                                <option value="Associate">Associate Professor</option>
                                <option value="Professor">Professor</option>
                                <option value="Guest Faculty">Guest Faculty</option>
                            </Select>

                            {errors.designation && (
                                <p className="text-sm text-red-500 mt-1">{errors.designation.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="lg:col-span-6 col-span-12">
                            <Label htmlFor="email" className="mb-2 block">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="email"
                                type="email"
                                placeholder="professor@example.com"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="lg:col-span-6 col-span-12">
                            <Label htmlFor="phone" className="mb-2 block">
                                Phone <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="phone"
                                type="tel"
                                placeholder="9874563210"
                                maxLength={10}
                                pattern="[0-9]*"
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                }}
                                {...register('phone')}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div className="lg:col-span-6 col-span-12">
                            <Label htmlFor="dob" className="mb-2 block">
                                Date of Birth <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="dob"
                                type="date"
                                {...register('dob')}
                            />
                            {errors.dob && (
                                <p className="text-sm text-red-500 mt-1">{errors.dob.message}</p>
                            )}
                        </div>

                        {/* Employee Id */}
                        <div className="lg:col-span-6 col-span-12">
                            <Label htmlFor="employee_id" className="mb-2 block">
                                Employee Id <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id="employee_id"
                                type="text"
                                {...register('employee_id')}
                                placeholder='ABCD1234F'
                            />
                            {errors.employee_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.employee_id.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            color="light"
                            onClick={() => router.push('/professors')}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            className="w-full sm:w-auto"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (professorId ? 'Update' : 'Save')}
                        </Button>
                    </div>
                </form>
            )}
        </TitleCard>
    );
};

export default AddUpdateProfessor;