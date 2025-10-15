'use client'

import { useEffect, useState } from 'react'
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
import { updateExamType } from '@/app/router/exam-type.router'
import { Icon } from '@iconify/react'

type ExamTypeFormData = z.infer<typeof addExamTypeSchema>

interface EditExamTypeProps {
    title: string
    id: number
    refetch: () => void
}

const EditExamType = ({ title, id, refetch }: EditExamTypeProps) => {
    const [formModal, setFormModal] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditExamTypeProps>({
        resolver: zodResolver(addExamTypeSchema),
        defaultValues: {
            title: '',
        },
    })

    // Reset form when modal opens with current title
    useEffect(() => {
        if (formModal) {
            reset({ title })
        }
    }, [formModal, title, reset])

    function onCloseModal() {
        setFormModal(false)
        reset()
    }

    const onSubmit = (data: ExamTypeFormData) => {
        updateExamType(id, data)
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
                <ModalHeader className='p-6'>Edit Exam Type</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Exam Type Title Field */}
                        <div>
                            <Label htmlFor='examTypeTitle' className='mb-2 block'>
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id='examTypeTitle'
                                placeholder='e.g. Computer Science'
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
                                Update
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default EditExamType
