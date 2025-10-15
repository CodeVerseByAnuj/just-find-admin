"use client";
import React from "react";
import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface ErrorModalProps {
  msg: string;
  showModal: boolean;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ msg, showModal, onClose }) => {
  return (
    <Modal show={showModal} size="md" onClose={onClose} popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          {/* Red icon with background circle */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <HiOutlineExclamationCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Bold heading */}
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Validation Error
          </h3>

          {/* Subtext message */}
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            {msg}
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-3">
            <Button color="danger" className="!bg-red-600 !text-white" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ErrorModal;
