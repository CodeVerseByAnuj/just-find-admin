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
import { addQuestionTypeSchema } from '@/lib/schemas/question-type.schema'
import { updateQuestionType } from '@/app/router/question-types.router'
import { Icon } from '@iconify/react'

type QuestionTypeFormData = z.infer<typeof addQuestionTypeSchema>

interface EditQuestionTypeProps {
    title: string
    id: number
    refetch: () => void
}

const EditQuestionType = ({ title, id, refetch }: EditQuestionTypeProps) => {
    const [formModal, setFormModal] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditQuestionTypeProps>({
        resolver: zodResolver(addQuestionTypeSchema),
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

    const onSubmit = (data: QuestionTypeFormData) => {
        updateQuestionType(id, data)
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
                className="text-blue-500"
            >
                <Icon icon="solar:pen-new-square-broken" height={20} />
            </button>

            <Modal show={formModal} size='md' onClose={onCloseModal} popup>
                <ModalHeader className='p-6'>Edit Question Type</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Question Type Title Field */}
                        <div>
                            <Label htmlFor='questionTypeTitle' className='mb-2 block'>
                                Type <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id='questionTypeTitle'
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
                            <Button type='submit' color='gray' className='w-full'>
                                Update
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default EditQuestionType
