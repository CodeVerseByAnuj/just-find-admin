'use client'

import { useState } from 'react'
import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { publishedExams } from '@/app/router/exam.router'
import { Icon } from '@iconify/react'

interface DeleteExamProps {
  id: number
  name: string | null
  refetch: () => void
}

const PublishedExam = ({ id, name, refetch }: DeleteExamProps) => {
  const [popupModal, setPopupModal] = useState(false)

  const handlePublish = () => {
    const promise = publishedExams(id)
    if (!promise) return

    promise
      .then(() => {
        setPopupModal(false)
        refetch()
      })
      .catch((error) => {
        console.error('Failed to delete exam:', error)
      })
  }


  return (
    <div>
      <Button
        className='bg-gray-400'
        size="sm"
        onClick={() => setPopupModal(true)}
      >
        Unpublished
      </Button>

      <Modal
        show={popupModal}
        size='md'
        onClose={() => setPopupModal(false)}
        popup>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to publish <b>{name}</b> exam?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="error" onClick={handlePublish}>
                Yes
              </Button>
              <Button color="gray" onClick={() => setPopupModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </ModalBody>

      </Modal>
    </div>
  )
}



export default PublishedExam