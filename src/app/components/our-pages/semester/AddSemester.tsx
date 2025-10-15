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
import { AddSemesterType, addsemesterTypeSchema } from '@/lib/schemas/semester.schema'
import { createSemester } from '@/app/router/semester.router'
import { HiOutlinePlus } from 'react-icons/hi'

type SemesterFormData = z.infer<typeof addsemesterTypeSchema>

interface AddSemesterProps {
  refetch: () => void
  buttonWidth?: string
}

const AddSemester = ({ refetch, buttonWidth }: AddSemesterProps) => {
  const [formModal, setFormModal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SemesterFormData>({
    resolver: zodResolver(addsemesterTypeSchema),
    defaultValues: {
      title: '',
    },
  })

  function onCloseModal() {
    setFormModal(false)
    reset()
  }

  const onSubmit = (data: SemesterFormData) => {
    console.log('Submitted Semester:', data)
    createSemester(data)
      .then(() => {
        reset()
        refetch()
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
        Add Semester
      </Button>

      <Modal show={formModal} size='md' onClose={onCloseModal} popup>
        <ModalHeader className='p-6'>Add Semester</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Exam Type Title Field */}
            <div>
              <Label htmlFor='examTypeTitle' className='mb-2 block'>
                Title <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id='examTypeTitle'
                placeholder='e.g. Semester 1'
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

export default AddSemester