// "use client"
import React from "react"
import { X } from "lucide-react";

interface DefaultModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function DefaultModal({ open, onClose, title, children }: DefaultModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#00000042] bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <div>{children}</div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 px-2 py-2 rounded-4xl hover:bg-gray-300 absolute -top-3 -right-3"
          >
            <X />
          </button>
        </div>
      </div>
    </div>
  )
}
