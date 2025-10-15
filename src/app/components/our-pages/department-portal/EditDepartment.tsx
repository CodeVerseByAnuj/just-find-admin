'use client'

import { useEffect, useState } from 'react'
import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    TextInput,
    Select
} from 'flowbite-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDepartmentSchema } from '@/lib/schemas/department.schema'
import { updateDepartment } from '@/app/router/department.router' // 🔁 Make sure this function exists
import { HiOutlinePencil } from 'react-icons/hi2'
import { Icon } from '@iconify/react'

type DepartmentFormData = z.infer<typeof addDepartmentSchema>

interface EditDepartmentProps {
    name: string
    type: "department" | "center" | undefined
    code: string | null
    id: number
    refetch: () => void
}

const EditDepartment = ({ name, id, type, code, refetch }: EditDepartmentProps) => {
    const [formModal, setFormModal] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(addDepartmentSchema),
        defaultValues: {
            name,
            type,
            code: code ?? undefined,
        },
    })

    // Reset form when modal opens with current values
    useEffect(() => {
        if (formModal) {
            reset({ name, type, code: code ?? undefined })
        }
    }, [formModal, name, type, code, reset])

    function onCloseModal() {
        setFormModal(false)
        reset()
    }

    const onSubmit = (data: DepartmentFormData) => {
        updateDepartment(id, data)
            .then(() => {
                reset()
                refetch()
                onCloseModal()
            })
    }

    return (
        <div>
            <button
                onClick={() => setFormModal(true)}
                className="text-gray-500"
            >
                <Icon icon="solar:pen-new-square-broken" height={20} />
            </button>

            <Modal show={formModal} size='md' onClose={onCloseModal} popup>
                <ModalHeader className='p-6'>Edit Department</ModalHeader>
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
                                <option value=''>Select Department Type</option>
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
                                placeholder='e.g. CS'
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
                                Update
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default EditDepartment
