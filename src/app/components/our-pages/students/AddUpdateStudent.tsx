'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAllDepartments } from '@/app/router/department.router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Button,
    Label,
    Select,
    TextInput,
} from 'flowbite-react';
import TitleCard from '@/app/components/shared/TitleBorderCard';
import {
    addStudentSchema,
    AddStudent,
} from '@/lib/schemas/student.schema';
import {
    createStudent,
    getStudentById,
    updateStudent,
} from '@/app/router/student.router';
import { Department } from '@/lib/schemas/department.schema';

const AddUpdateStudent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const studentId = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['all-departments'],
        queryFn: async () => {
            const res = await getAllDepartments();
            return res || { data: [] };
        },
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const allDepartments: Department[] = data?.data || [];
    const departmentOptions = allDepartments.map((dept) => (
        <option key={dept.id} value={dept.id}>
            {dept.name}
        </option>
    ));

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<Omit<AddStudent, 'password'>>({
        resolver: zodResolver(addStudentSchema.omit({ password: true })),
        mode: 'onChange',
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            phone: '',
            enrollment_id: 0,
            roll_number: undefined,
            dob: '',
            entry_year: new Date().getFullYear(),
            gender: 'male',
            department_id: undefined,
        },
    });

    useEffect(() => {
        const fetchStudent = async () => {
            if (studentId) {
                setLoading(true);
                try {
                    const student = await getStudentById(Number(studentId));
                    setStudentData(student.data);
                } catch (err) {
                    console.error('Failed to fetch student:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchStudent();
    }, [studentId]);

    // Reset form when student data is available
    useEffect(() => {
        if (studentData && !isLoading) {
            reset({
                first_name: studentData.first_name || '',
                middle_name: studentData.middle_name || '',
                last_name: studentData.last_name || '',
                email: studentData.email || '',
                phone: studentData.phone || '',
                enrollment_id: studentData.enrollment_id || 0,
                roll_number: studentData.roll_number || undefined,
                dob: studentData.dob || '',
                entry_year: studentData.entry_year || new Date().getFullYear(),
                gender: studentData.gender || 'male',
                department_id: studentData.department?.id || undefined,
            });
        }
    }, [studentData, isLoading, reset]);

    const onSubmit = async (data: Omit<AddStudent, 'password'>) => {
        try {
            setLoading(true);

            // Create a copy of the data
            const formattedData: any = {
                ...data,
                password: 'Qwerty123', // Always send default password
            };
            const updateFormattedData = {
                ...data,
            };

            // Remove roll_number from payload if it's empty or just whitespace
            if (!formattedData.roll_number || formattedData.roll_number.toString().trim() === '') {
                delete formattedData.roll_number;
            }

            if (studentId) {
                const result = await updateStudent(Number(studentId), updateFormattedData);
                if (result) {
                    console.log('Student updated');
                    await queryClient.invalidateQueries({ queryKey: ['all-students'] });
                    await queryClient.invalidateQueries({ queryKey: ['all-departments'] });
                    router.push('/students');
                }
            } else {
                const result = await createStudent(formattedData);
                if (result) {
                    console.log('Student created');
                    await queryClient.invalidateQueries({ queryKey: ['all-students'] });
                    await queryClient.invalidateQueries({ queryKey: ['all-departments'] });
                    router.push('/students');
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
        <TitleCard title={studentId ? 'Update Student' : 'Add Student'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="lg:col-span-6 col-span-12">
                        <Label htmlFor="department_id" className="mb-2 block">
                            Department <span className="text-red-500">*</span>
                        </Label>
                        <Select id="department_id" {...register('department_id')}>
                            <option value="">Select Department</option>
                            {departmentOptions}
                        </Select>
                        {errors.department_id && (
                            <p className="text-sm text-red-500 mt-1">{errors.department_id.message}</p>
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
                            placeholder="student@example.com"
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

                    {/* Entry Year */}
                    <div className="lg:col-span-6 col-span-12">
                        <Label htmlFor="entry_year" className="mb-2 block">
                            Entry Year
                        </Label>
                        <TextInput
                            id="entry_year"
                            type="number"
                            placeholder="2023"
                            {...register('entry_year')}
                        />
                        {errors.entry_year && (
                            <p className="text-sm text-red-500 mt-1">{errors.entry_year.message}</p>
                        )}
                    </div>

                    {/* Enrollment ID */}
                    <div className="lg:col-span-6 col-span-12">
                        <Label htmlFor="enrollment_id" className="mb-2 block">
                            Enrollment ID <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                            id="enrollment_id"
                            type="number"
                            min={0}
                            placeholder="202300456"
                            {...register("enrollment_id")}
                            onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                                    e.preventDefault();
                                }
                            }}
                        />

                        {errors.enrollment_id && (
                            <p className="text-sm text-red-500 mt-1">{errors.enrollment_id.message}</p>
                        )}
                    </div>

                    {/* Roll Number */}
                    <div className="lg:col-span-6 col-span-12">
                        <Label htmlFor="roll_number" className="mb-2 block">
                            Roll No. <span className='text-red-500'>*</span>
                        </Label>
                        <TextInput
                            id="roll_number"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="101"
                            {...register("roll_number", {
                                setValueAs: (v) => (v === "" ? undefined : Number(v)), // ✅ convert empty → undefined
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, "")
                                },
                            })}
                        />

                        {errors.roll_number && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.roll_number.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        type="button"
                        color="light"
                        onClick={() => router.push('/students')}
                    >
                        Back
                    </Button>
                    <Button type="submit" color="primary" className="w-full sm:w-auto" disabled={loading}>
                        {loading ? 'Processing...' : (studentId ? 'Update' : 'Save')}
                    </Button>
                </div>
            </form>
        </TitleCard>
    );
};

export default AddUpdateStudent;