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
import { CategoryFormSchema } from '@/lib/schemas/category.schema'
import { updateCategory } from '@/app/router/category.router'
import { HiOutlinePencil } from 'react-icons/hi'


type CategoryFormData = z.infer<typeof CategoryFormSchema>
interface EditCategoryProps {
  category: { id: string; name: string }
  refetch: () => void
  buttonWidth?: string
}

const EditCategory = ({ category, refetch, buttonWidth }: EditCategoryProps) => {
  const [formModal, setFormModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: category.name || '',
    },
  })

  function onCloseModal() {
    setFormModal(false)
    reset({ name: category.name })
    setIsSubmitting(false)
  }

  const onSubmit = async (data: CategoryFormData) => {
    if (isSubmitting) return // Prevent multiple submissions
    setIsSubmitting(true)
    try {
      await updateCategory(category.id, data)
      reset()
      refetch()
      onCloseModal()
    } catch (error) {
      console.error('Error updating category:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Button
        onClick={() => setFormModal(true)}
        color='primary'
        className={buttonWidth}
      >
        <HiOutlinePencil className='mr-2' />
        Edit Category
      </Button>

      <Modal show={formModal} size='md' onClose={onCloseModal} popup>
        <ModalHeader className='p-6'>Edit Category</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Category Name Field */}
            <div>
              <Label htmlFor='categoryName' className='mb-2 block'>
                Name <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id='categoryName'
                placeholder='e.g. Electronics'
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className='w-full'>
              <Button 
                type='submit' 
                color='primary' 
                className='w-full'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </div>
  )
}

export default EditCategory
