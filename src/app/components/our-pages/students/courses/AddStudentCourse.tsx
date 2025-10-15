"use client"

import { useEffect, useState } from 'react'
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
} from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addStudentCourseSchema } from '@/lib/schemas/student-courses.schema'
import { HiOutlinePlus } from 'react-icons/hi'
import { createStudentCourse, getProfessorList } from '@/app/router/student-courses.router'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '@/app/router/course.router'
import { Course } from '@/lib/schemas/course.schema'
import { Professor } from '@/lib/schemas/student-courses.schema'
import {useDepartmentCourses} from '@/hooks/useDepartmentCourses'
import { z } from 'zod'

// Assuming this is the shape of the data returned by getProfessorList
type ProfessorWrapper = {
  id: number
  professor: Professor
  created: string
  modified: string
}

type FormData = z.infer<typeof addStudentCourseSchema>

interface AddStudentCourseProps {
  studentId: number
  departmentId: number
  onSuccess?: () => void
}

const AddStudentCourse = ({ studentId, departmentId, onSuccess }: AddStudentCourseProps) => {
  const [formModal, setFormModal] = useState(false)
  const [professors, setProfessors] = useState<ProfessorWrapper[]>([])
  const [isCourseSelected, setIsCourseSelected] = useState(false)
  const [loadingProfessors, setLoadingProfessors] = useState(false)
  console.log('🔍 AddStudentCourse component rendered with studentId:', studentId)

  // Fetch courses based on departmentId
  const { courses, loading } = useDepartmentCourses(departmentId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue, // <-- Destructure setValue
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addStudentCourseSchema),
    defaultValues: {
      course_id: undefined,
      professor_id: undefined,
    },
  })

  const selectedCourseId = watch('course_id')

  useEffect(() => {
    // Clear previous professor state when course changes
    setProfessors([])
    setValue('professor_id', undefined, { shouldValidate: true });


    if (selectedCourseId) {
      setIsCourseSelected(true)
      setLoadingProfessors(true)
      getProfessorList(selectedCourseId)
        .then((res) => {
          // Ensure res.data is an array before setting state
          const professorData = Array.isArray(res?.data) ? res.data : []
          console.log('Professors API response:', professorData)
          setProfessors(professorData)

          // If professors are found, set the form value to the first one
          if (professorData.length > 0) {
            setValue('professor_id', professorData[0].professor.id, {
              shouldValidate: true, // This clears any "required" errors
            })
          }
        })
        .catch((err) => {
          console.error('Failed to fetch professors:', err)
          setProfessors([]) // Ensure state is empty on error
        })
        .finally(() => {
          setLoadingProfessors(false)
        })
    } else {
      setIsCourseSelected(false)
    }
    // `setValue` is guaranteed to be stable by react-hook-form
  }, [selectedCourseId, setValue])

  function onCloseModal() {
    setFormModal(false)
    reset()
    setProfessors([])
    setIsCourseSelected(false)
  }

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      studentId: studentId,
    }

    createStudentCourse(payload)
      .then(() => {
        console.log('✅ Course created successfully')
        onCloseModal() // Use the existing close function to reset everything
        if (onSuccess) onSuccess()
      })
      .catch((err) => {
        console.error('❌ Failed to create student course:', err)
      })
  }

  return (
    <div>
      <Button onClick={() => setFormModal(true)} color="primary">
        <HiOutlinePlus className="mr-2" />
        Add Course
      </Button>

      <Modal show={formModal} size="md" onClose={onCloseModal} popup>
        <ModalHeader className="p-6">Add Course</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-4 items-center">
              {/* Course Select */}
              <div className="w-full">
                <Label htmlFor="course_id" className="mb-2 block">
                  Course <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="course_id"
                  {...register('course_id', { valueAsNumber: true })}
                  defaultValue=""
                  disabled={loading || courses.length === 0}
                >
                  <option value="" disabled>
                    Select Course
                  </option>
                  {courses?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </Select>
                {errors.course_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.course_id.message}</p>
                )}
              </div>

              {/* Professor Select */}
              <div className="w-full relative">
                <Label htmlFor="professor_id" className="mb-2 block">
                  Professor <span className="text-red-500">*</span>
                </Label>
                {loadingProfessors ? (
                  <div className="flex items-center h-[42px] px-3 border rounded-sm bg-gray-50 dark:bg-gray-700">
                    <Spinner size="sm" aria-label="Loading professors" />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Loading professors...</span>
                  </div>
                ) : (
                  <Select
                    id="professor_id"
                    {...register('professor_id', { valueAsNumber: true })}
                    disabled={!isCourseSelected || professors.length === 0}
                  >
                    {!isCourseSelected ? (
                      <option value="">Select a course first</option>
                    ) : professors.length === 0 ? (
                      <option value="">No Professors Available</option>
                    ) : (
                      <>
                        {/* The disabled "Select" option is often unnecessary when a default is chosen, but can be kept if desired */}
                        <option value="" disabled>Select Professor</option>
                        {professors.map((item) => (
                          <option key={item.professor.id} value={item.professor.id}>
                            {`${item.professor.first_name} ${item.professor.last_name}`}
                          </option>
                        ))}
                      </>
                    )}
                  </Select>
                )}
                {errors.professor_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.professor_id.message}</p>
                )}
              </div>
            </div>

            <div className="w-full">
              <Button type="submit" color="primary" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </div>
  )
}

export default AddStudentCourse