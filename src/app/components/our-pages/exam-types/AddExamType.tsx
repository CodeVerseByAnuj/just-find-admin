"use client"

import { useState } from 'react'
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addExamTypeSchema } from '@/lib/schemas/exam-type.schema'
import { createExamType } from '@/app/router/exam-type.router'
import { HiOutlinePlus } from 'react-icons/hi'

type ExamTypeFormData = z.infer<typeof addExamTypeSchema>

interface AddExamTypeProps {
  refetch: () => void
  buttonWidth?: string
}

const AddExamType = ({ refetch, buttonWidth }: AddExamTypeProps) => {
  const [formModal, setFormModal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamTypeFormData>({
    resolver: zodResolver(addExamTypeSchema),
    defaultValues: {
      title: '',
    },
  })

  function onCloseModal() {
    setFormModal(false)
    reset()
  }

  const onSubmit = (data: ExamTypeFormData) => {
    console.log('Submitted Exam Type:', data)
    // 🛠️ You can replace this with your API call
    createExamType(data)
      .then(() => {
        // ✅ Reset form and close modal on success
        reset()
        refetch() // Refetch exam types to update the list
        onCloseModal()
      })
  }

  return (
    <div>
      <Button
        onClick={() => setFormModal(true)}
        color='primary'
        className={buttonWidth}
      >
        <HiOutlinePlus className='mr-2' />
        Add Exam Type
      </Button>

      <Modal show={formModal} size='md' onClose={onCloseModal} popup>
        <ModalHeader className='p-6'>Add Exam Type</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Exam Type Title Field */}
            <div>
              <Label htmlFor='examTypeTitle' className='mb-2 block'>
                Title <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id='examTypeTitle'
                placeholder='e.g. Midterm Exam'
                {...register('title')}
              />
              {errors.title && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className='w-full'>
              <Button type='submit' color='primary' className='w-full'>
                Save
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </div>
  )
}

export default AddExamType