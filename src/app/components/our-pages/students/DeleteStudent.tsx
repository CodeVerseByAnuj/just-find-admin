'use client'

import { useState } from 'react'
import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { deleteQuestionType } from '@/app/router/question-types.router'
import { deleteStudent } from '@/app/router/student.router'
import { Icon } from '@iconify/react'

interface DeleteStudentProps {
    id: number
    name: string
    refetch: () => void
}

const DeleteStudent = ({ id, name, refetch }: DeleteStudentProps) => {
    const [popupModal, setPopupModal] = useState(false)

    const handleDelete = () => {
        deleteStudent(id)
            .then(() => {
                setPopupModal(false)
                refetch()
            })
            .catch((error) => {
                console.error('Failed to delete student:', error)
            })
    }

    return (
        <div>
            <button
                onClick={() => setPopupModal(true)}
                className="text-gray-500"
            >
                <Icon icon="solar:trash-bin-minimalistic-outline" className='mr-2' height={20} />
            </button>

            <Modal
                show={popupModal}
                size='md'
                onClose={() => setPopupModal(false)}
                popup>
                <ModalHeader />
                <ModalBody>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200' />
                        <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
                            Are you sure you want to delete <b>{name}</b> student?
                        </h3>
                        <div className='flex justify-center gap-4'>
                            <Button color='error' onClick={handleDelete}>
                                Delete
                            </Button>
                            <Button color='gray' onClick={() => setPopupModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default DeleteStudent
