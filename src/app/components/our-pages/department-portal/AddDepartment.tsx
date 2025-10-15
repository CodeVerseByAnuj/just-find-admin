"use client"

import { useState } from 'react'
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  TextInput,
} from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDepartmentSchema } from '@/lib/schemas/department.schema'
import { createDepartment } from '@/app/router/department.router'
import { HiOutlinePlus } from 'react-icons/hi'

type DepartmentFormData = z.infer<typeof addDepartmentSchema>

interface AddDepartmentProps {
  refetch: () => void
  buttonWidth?: string
}

const AddDepartment = ({ refetch, buttonWidth }: AddDepartmentProps) => {
  const [formModal, setFormModal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(addDepartmentSchema),
    defaultValues: {
      name: '',
    },
  })

  function onCloseModal() {
    setFormModal(false)
    reset()
  }

  const onSubmit = (data: DepartmentFormData) => {
    console.log('Submitted Department:', data)
    // 🛠️ You can replace this with your API call
    createDepartment(data)
      .then(() => {
        // ✅ Reset form and close modal on success
        reset()
        refetch() // Refetch departments to update the list
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
        Add Department
      </Button>

      <Modal show={formModal} size='md' onClose={onCloseModal} popup>
        <ModalHeader className='p-6'>Add Department</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Department Name Field */}
            <div>
              <Label htmlFor='departmentName' className='mb-2 block'>
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                id='departmentName'
                {...register('type')}
              >
                <option value=''>Select Type</option>
                <option value='department'>Department</option>
                <option value='center'>Center</option>
              </Select>
              {errors.type && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.type.message}
                </p>
              )}
            </div>
            {/* Department Name Field */}
            <div>
              <Label htmlFor='departmentName' className='mb-2 block'>
                Name <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id='departmentName'
                placeholder='e.g. Computer Science'
                {...register('name')}
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* Department Name Field */}
            <div>
              <Label htmlFor='departmentCode' className='mb-2 block'>
                Code <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id='departmentCode'
                placeholder='e.g. CS101'
                {...register('code')}
              />
              {errors.code && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.code.message}
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

export default AddDepartment
