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
import { addsemesterTypeSchema } from '@/lib/schemas/semester.schema'
import { updateSemester } from '@/app/router/semester.router'
import { Icon } from '@iconify/react'

type SemesterFormData = z.infer<typeof addsemesterTypeSchema>

interface EditSemesterProps {
    title: string
    id: number
    refetch: () => void
}

const EditSemester = ({ title, id, refetch }: EditSemesterProps) => {
    const [formModal, setFormModal] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditSemesterProps>({
        resolver: zodResolver(addsemesterTypeSchema),
        defaultValues: {
            title: '',
        },
    })

    useEffect(() => {
        if (formModal) {
            reset({ title })
        }
    }, [formModal, title, reset])

    function onCloseModal() {
        setFormModal(false)
        reset()
    }

    const onSubmit = (data: SemesterFormData) => {
        updateSemester(id, data)
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
                <ModalHeader className='p-6'>Edit Semester</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div>
                            <Label htmlFor='semesterTitle' className='mb-2 block'>
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <TextInput
                                id='semesterTitle'
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

export default EditSemester
