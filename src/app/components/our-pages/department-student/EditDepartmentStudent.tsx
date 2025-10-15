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
import { Icon } from '@iconify/react/dist/iconify.js'
import { getProfessorList, getStudentParticularCourse, updateStudentCourse } from '@/app/router/student-courses.router'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '@/app/router/course.router'
import { Course } from '@/lib/schemas/course.schema'
import { Professor } from '@/lib/schemas/student-courses.schema'
import { z } from 'zod'

type ProfessorWrapper = {
  id: number
  professor: Professor
  created: string
  modified: string
}

type FormData = z.infer<typeof addStudentCourseSchema>

interface EditStudentCourseProps {
  studentCourseID: number
  onSuccess?: () => void
}

const EditDepartmentStudent = ({ studentCourseID, onSuccess }: EditStudentCourseProps) => {
  const [formModal, setFormModal] = useState(false)
  const [professors, setProfessors] = useState<ProfessorWrapper[]>([])
  const [loadingProfessors, setLoadingProfessors] = useState(false)

  // Fetch all courses (for dropdown options)
  const { data: courses, isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const res = await getCourses()
      return res || []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch particular student course (for prefilling form)
  const { data: particularCourseData, isLoading: loadingParticularCourse, refetch: refetchParticularCourse } = useQuery({
    queryKey: ['particular-student-course', studentCourseID],
    queryFn: async () => {
      const res = await getStudentParticularCourse(studentCourseID)
      return res.data // your API returns { success: true, data: { ... } }
    },
    enabled: false, // we'll fetch manually when modal opens
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addStudentCourseSchema),
    defaultValues: {
      course_id: undefined,
      professor_id: undefined,
    },
  })

  // Watch course_id to fetch professors on change
  const selectedCourseId = watch('course_id')

  // Function to fetch professors for a given course ID
  const fetchProfessors = async (courseId: number) => {
    setLoadingProfessors(true)
    try {
      const res = await getProfessorList(courseId)
      setProfessors(res.data || [])
    } catch (error) {
      setProfessors([])
    } finally {
      setLoadingProfessors(false)
    }
  }

  // Fetch professors when course_id changes (user selects different course)
  useEffect(() => {
    if (selectedCourseId) {
      fetchProfessors(selectedCourseId)
    } else {
      setProfessors([])
    }
  }, [selectedCourseId])

  // When modal opens, fetch particular student course and reset form
  useEffect(() => {
    if (formModal) {
      // Clear professors first to show loading state
      setProfessors([])
      refetchParticularCourse()
    }
  }, [formModal, refetchParticularCourse])

  // After fetching particular student-course data, populate form and fetch professors
  useEffect(() => {
    if (particularCourseData && formModal) {
      reset({
        course_id: particularCourseData.course.id,
        professor_id: particularCourseData.professor.id,
      })

      // Always fetch professors fresh from API when modal opens
      fetchProfessors(particularCourseData.course.id)
    }
  }, [particularCourseData, reset, formModal])

  // On modal close, clear everything to avoid stale data
  function onCloseModal() {
    setFormModal(false)
    setTimeout(() => {
      reset()
      setProfessors([])
      setLoadingProfessors(false)
    }, 300) // wait for modal close animation
  }

  const onSubmit = (data: FormData) => {
    const payload = {
      course_id: data.course_id,
      professor_id: data.professor_id,
    }
    updateStudentCourse(payload, studentCourseID)
      .then(() => {
        reset()
        setProfessors([])
        setFormModal(false)
        if (onSuccess) onSuccess()
      })
      .catch((err) => {
        console.error('❌ Failed to update student course:', err)
      })
  }

  return (
    <>
      <button
        className="text-gray-500"
        onClick={() => setFormModal(true)}
        aria-label="Edit course"
      >
        <Icon icon="solar:pen-new-square-broken" height={20} />

      </button>

      <Modal show={formModal} size="md" onClose={onCloseModal} popup>
        <ModalHeader className='px-6 py-4'>Edit Course</ModalHeader>
        <ModalBody>
          {(loadingParticularCourse || loadingCourses) ? (
            <div className="flex justify-center items-center py-20">
              <Spinner aria-label="Loading data" size="lg" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 items-center">
                <div className="w-full">
                  <Label htmlFor="course_id" className="mb-2 block">
                    Course <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="course_id"
                    {...register('course_id', { valueAsNumber: true })}
                    disabled={loadingCourses}
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

                <div className="w-full">
                  <Label htmlFor="professor_id" className="mb-2 block">
                    Professor <span className="text-red-500">*</span>
                  </Label>
                  {loadingProfessors ? (
                    <div className="flex items-center h-[38px] px-3 border rounded-md bg-gray-100 dark:bg-gray-700">
                      <Spinner size="sm" aria-label="Loading professors" />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Loading professors...</span>
                    </div>
                  ) : (
                    <Select
                      id="professor_id"
                      {...register('professor_id', { valueAsNumber: true })}
                      disabled={!selectedCourseId}
                    >
                      <option value="" disabled>
                        {!selectedCourseId
                          ? 'Select Course First'
                          : professors.length === 0
                            ? 'No Professors Available'
                            : 'Select Professor'
                        }
                      </option>
                      {professors.map((item) => (
                        <option key={item.professor.id} value={item.professor.id}>
                          {`${item.professor.first_name} ${item.professor.last_name}`}
                        </option>
                      ))}
                    </Select>
                  )}
                  {errors.professor_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.professor_id.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" color="primary" className="w-full">
                Save
              </Button>
            </form>
          )}
        </ModalBody>
      </Modal>
    </>
  )
}

export default EditDepartmentStudent