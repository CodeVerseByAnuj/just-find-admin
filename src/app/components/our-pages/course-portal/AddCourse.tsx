'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAllDepartments } from '@/app/router/department.router'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Label,
  Select,
  Spinner,
  TextInput,
} from 'flowbite-react';
import TitleCard from '@/app/components/shared/TitleBorderCard';
import {
  addCourseSchema,
  AddCourseFormData,
} from '@/lib/schemas/course.schema';
import {
  createCourse,
  getCourseById,
  updateCourse,
} from '@/app/router/course.router';
import { Department } from '@/lib/schemas/department.schema';
import { useSemesterTypes } from '@/hooks/useSemesterTypes';
import { MultiSelect } from "react-multi-select-component";
import { getProfessors } from '@/app/router/professor.router';

// Professor interface based on the API response
interface Professor {
  id: number;
  department: {
    id: number;
    name: string;
    code: string | null;
    type: string;
    deleted: boolean;
    created: string;
    modified: string;
  } | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  gender: string;
  profile_photo: string;
  deleted: boolean;
  user_role: {
    id: number;
    title: string;
    identifier: string;
    status: boolean;
    created: string;
    modified: string;
  };
  created: string;
  modified: string;
}

// MultiSelect option interface
interface ProfessorOption {
  label: string;
  value: number;
}



const AddCourse = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = searchParams.get('id');
  const [selectedProfessors, setSelectedProfessors] = useState<ProfessorOption[]>([]);
  const [professorOptions, setProfessorOptions] = useState<ProfessorOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-departments'],
    queryFn: async () => {
      const res = await getAllDepartments()
      return res || { data: [] }
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await getProfessors();
        // Transform the professors data into the format required by MultiSelect
        const options: ProfessorOption[] = res.data.map((professor: Professor) => ({
          label: `${professor.first_name} ${professor.middle_name ? professor.middle_name + ' ' : ''}${professor.last_name}`.trim(),
          value: professor.id
        }));
        setProfessorOptions(options);
        console.log('Professor options:', options);
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    };
    fetchProfessors();
  }, []);

  const allDepartments: Department[] = data?.data || []
  const departmentOptions = allDepartments.map((dept) => (
    <option key={dept.id} value={dept.id}>
      {dept.name}
    </option>
  ));

  // Fetch semesters using the custom hook
  const { semesters, loading: semesterLoading, error: semesterError } = useSemesterTypes();

  const semesterOptions = semesters.map((semester) => (
    <option key={semester.id} value={semester.id}>
      {semester.title}
    </option>
  ));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddCourseFormData>({
    resolver: zodResolver(addCourseSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      code: '',
      credits: 1,
      department_id: undefined,
      semesterId: undefined,
    },
  });

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        setLoading(true);
        try {
          const course = await getCourseById(Number(courseId));
          setCourseData(course.data);
        } catch (err) {
          console.error('Failed to fetch course:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourse();
  }, [courseId]);

  console.log('Course Data:', courseData);

  // Reset form when all data is available
  useEffect(() => {
    if (courseData && !isLoading && !semesterLoading) {
      reset({
        title: courseData.title || '',
        code: courseData.code || '',
        credits: courseData.credits || 1,
        department_id: courseData.department?.id || 1,
        semesterId: courseData.semester?.id || 1,
      });
      
      // Set selected professors if course has existing professors
      if (courseData.professors && Array.isArray(courseData.professors)) {
        const selectedProfs: ProfessorOption[] = courseData.professors.map((prof: Professor) => ({
          label: `${prof.first_name} ${prof.middle_name ? prof.middle_name + ' ' : ''}${prof.last_name}`.trim(),
          value: prof.id
        }));
        setSelectedProfessors(selectedProfs);
      }
    }
  }, [courseData, isLoading, semesterLoading, reset]);

  const onSubmit = async (data: AddCourseFormData) => {
    try {
      setLoading(true);
      
      // Add selected professor IDs to the form data
      const formDataWithProfessors = {
        ...data,
        // Uncomment this to add professor IDs
        // professor_ids: selectedProfessors.map((prof: ProfessorOption) => prof.value)
      };

      if (courseId) {
        const result = await updateCourse(Number(courseId), formDataWithProfessors);
        if (result) {
          console.log('Course updated');
          // Invalidate relevant queries to refresh data
          await queryClient.invalidateQueries({ queryKey: ['all-courses'] });
          await queryClient.invalidateQueries({ queryKey: ['all-departments'] });
          router.push('/courses');
        }
      } else {
        const result = await createCourse(formDataWithProfessors);
        if (result) {
          console.log('Course created');
          // Invalidate relevant queries to refresh data
          await queryClient.invalidateQueries({ queryKey: ['all-courses'] });
          await queryClient.invalidateQueries({ queryKey: ['all-departments'] });
          router.push('/courses');
        }
      }
      reset();
      setSelectedProfessors([]);
    } catch (error) {
      console.error('Error in submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TitleCard title={courseId ? 'Update Course' : 'Add Course'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-12 gap-6">
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
          {/* Semester */}
          <div className="lg:col-span-6 col-span-12">
            <Label htmlFor="semesterId" className="mb-2 block">
              Semester <span className="text-red-500">*</span>
            </Label>
            <Select id="semesterId" {...register('semesterId')} disabled={semesterLoading}>
              <option value="">Select Semester</option>
              {semesterLoading ? (
                <option value="">Loading semesters...</option>
              ) : (
                semesterOptions
              )}
            </Select>
            {errors.semesterId && (
              <p className="text-sm text-red-500 mt-1">{errors.semesterId.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="lg:col-span-6 col-span-12">
            <Label htmlFor="title" className="mb-2 block">
              Title <span className="text-red-500">*</span>
            </Label>
            <TextInput id="title" placeholder="Course Title" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Code */}
          <div className="lg:col-span-6 col-span-12">
            <Label htmlFor="code" className="mb-2 block">
              Code <span className="text-red-500">*</span>
            </Label>
            <TextInput id="code" placeholder="Course Code" {...register('code')} />
            {errors.code && (
              <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* Credits */}
          <div className="lg:col-span-6 col-span-12">
            <Label htmlFor="credits" className="mb-2 block">
              Credits
            </Label>
            <TextInput id="credits" type="text" {...register('credits')} />
            {errors.credits && (
              <p className="text-sm text-red-500 mt-1">{errors.credits.message}</p>
            )}
          </div>
          
          {/* Professors */}
          {/* <div className="lg:col-span-6 col-span-12">
            <Label htmlFor="professors" className="mb-2 block">
              Professors
            </Label>
            <MultiSelect
              options={professorOptions}
              value={selectedProfessors}
              onChange={setSelectedProfessors}
              labelledBy="Select Professors"
              hasSelectAll={true}
              disableSearch={false}
            />
          </div> */}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            color="light"
            onClick={() => router.push('/courses')}
          >
            Back
          </Button>
          <Button type="submit" color="primary" className="w-full sm:w-auto" disabled={loading}>
            {loading ? 'Processing...' : (courseId ? 'Update' : 'Save')}
          </Button>
        </div>
      </form>
    </TitleCard>
  );
};

export default AddCourse;