'use client'

import { useState } from 'react'
import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { deleteProfessor } from '@/app/router/professor.router'
import { Icon } from '@iconify/react'

interface DeleteProfessorProps {
    id: number
    name: string
    refetch: () => void
}

const DeleteProfessor = ({ id, name, refetch }: DeleteProfessorProps) => {
    const [popupModal, setPopupModal] = useState(false)

    const handleDelete = () => {
        deleteProfessor(id)
            .then(() => {
                setPopupModal(false)
                refetch()
            })
            .catch((error) => {
                console.error('Failed to delete professor:', error)
            })
    }

    return (
        <div>
            <button
                onClick={() => setPopupModal(true)}
                className="text-gray-500 hover:text-gray-700"
            >
                <Icon icon="solar:trash-bin-trash-broken" height={20} />
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
                            Are you sure you want to delete professor <b>{name}</b>?
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

export default DeleteProfessor
