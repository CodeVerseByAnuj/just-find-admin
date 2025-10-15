"use client"
import React from "react"
import { Button } from "flowbite-react"

interface ModalActionsProps {
  onBack: () => void
  onNext: () => void
}

export default function ModalActions({ onBack, onNext }: ModalActionsProps) {
  return (
    <div className="flex justify-between mt-4">
      <Button
        onClick={onBack}
        color="light"
        size="sm"
      >
        Previous
      </Button>
      <Button onClick={onNext}>
        Next
      </Button>
    </div>
  )
}