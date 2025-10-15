// EvaluateModal.tsx
"use client";

import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button, Label } from "flowbite-react";

type Props = {
  show: boolean;
  onClose: () => void;
  marks: number | "";
  onMarksChange: (v: number | "") => void;
  comments: string;
  onCommentsChange: (v: string) => void;
  onSave: () => Promise<void> | void;
  loading?: boolean;
  title?: string;
};

export default function EvaluateModal({
  show,
  onClose,
  marks,
  onMarksChange,
  comments,
  onCommentsChange,
  onSave,
  loading = false,
  title = "Evaluate",
}: Props) {
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!comments.trim()) {
      setError("Comments are required.");
      return;
    }
    setError("");
    await onSave();
  };

  return (
    <Modal show={show} size="md" onClose={onClose} popup>
      <ModalHeader className="px-6 py-3">{title}</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {/* Marks field if needed */}
          {/* <div>
            <Label htmlFor="marks" className="mb-2">Marks</Label>
            <TextInput
              id="marks"
              type="number"
              value={marks as any}
              onChange={(e) =>
                onMarksChange(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Enter marks"
              disabled={loading}
            />
          </div> */}

          <div>
            {/* ⚠️ Warning Line */}
            <div className="flex mb-4 gap-2 text-sm text-red-600 font-medium">
              <span className="text-lg">⚠️</span>
              <span>Please note: If you submit an incorrect request, your marks may be reduced.</span>
            </div>
            <Label htmlFor="comments" className="mb-2">
              Comments <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              rows={4}
              placeholder="Add feedback for student"
              disabled={loading}
              required
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
