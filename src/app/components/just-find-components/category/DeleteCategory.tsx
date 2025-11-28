"use client"

import { useState } from 'react'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'flowbite-react'
import { deleteCategory } from '@/app/router/category.router'
import { HiOutlineTrash } from 'react-icons/hi'

interface DeleteCategoryProps {
  categoryId: string
  refetch: () => void
  buttonWidth?: string
}

const DeleteCategory = ({ categoryId, refetch, buttonWidth }: DeleteCategoryProps) => {
  const [formModal, setFormModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  function onCloseModal() {
    setFormModal(false)
    setIsDeleting(false)
  }

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await deleteCategory(categoryId)
      refetch()
      onCloseModal()
    } catch (error) {
      console.error('Error deleting category:', error)
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <Button
        onClick={() => setFormModal(true)}
        color='failure'
        className={buttonWidth}
      >
        <HiOutlineTrash className='mr-2' />
        Delete Category
      </Button>

      <Modal show={formModal} size='md' onClose={onCloseModal} popup>
        <ModalHeader className='p-6'>Delete Category</ModalHeader>
        <ModalBody>
          <div className='space-y-6'>
            <p>Are you sure you want to delete this category?</p>
            <div className='w-full flex gap-2'>
              <Button
                color='failure'
                onClick={handleDelete}
                disabled={isDeleting}
                className='w-full'
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                color='gray'
                onClick={onCloseModal}
                disabled={isDeleting}
                className='w-full'
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}

export default DeleteCategory
