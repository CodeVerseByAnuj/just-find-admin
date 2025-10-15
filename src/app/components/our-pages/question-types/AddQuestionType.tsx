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
import { addQuestionTypeSchema } from '@/lib/schemas/question-type.schema'
import { HiOutlinePlus } from 'react-icons/hi'
import { createQuestionType } from '@/app/router/question-types.router'

type QuestionTypeFormData = z.infer<typeof addQuestionTypeSchema>

interface AddQuestionTypeProps {
  refetch: () => void
  buttonWidth?: string
}

const AddQuestionType = ({ refetch, buttonWidth }: AddQuestionTypeProps) => {
  const [formModal, setFormModal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionTypeFormData>({
    resolver: zodResolver(addQuestionTypeSchema),
    defaultValues: {
      title: '',
    },
  })

  function onCloseModal() {
    setFormModal(false)
    reset()
  }

  const onSubmit = (data: QuestionTypeFormData) => {
    console.log('Submitted Question Type:', data)
    // 🛠️ You can replace this with your API call
    createQuestionType(data)
      .then(() => {
        // ✅ Reset form and close modal on success
        reset()
        refetch() // Refetch question types to update the list
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
        Add Question Type
      </Button>

      <Modal show={formModal} size='md' onClose={onCloseModal} popup>
        <ModalHeader className='p-6'>Add Question Type</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Question Type Title Field */}
            <div>
              <Label htmlFor='questionTypeTitle' className='mb-2 block'>
                Type <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id='questionTypeTitle'
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

export default AddQuestionType