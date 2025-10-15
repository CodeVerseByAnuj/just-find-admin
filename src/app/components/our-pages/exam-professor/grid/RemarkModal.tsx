"use client";

import React from "react";
import { Modal, ModalHeader, ModalBody, Button, Label } from "flowbite-react";
import { raiseExamFlag } from "@/app/router/examProfessor.router";
import { Score } from '@/lib/schemas/examResult.schema';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Accept numbers or the Score shape from the schema (allows nullable fields)
type PartialValue = number | Score;

type Props = {
    show: boolean;
    onClose: () => void;
    // partialMarks can be either a simple Record<string, number> (old format)
    // or Record<string, PartialValue> where the value contains marks/score and labels.
    remarkModalData?: {
        examStudentMarks_id: number;
        partialMarks?: Record<string, PartialValue>;
        // Directly provide already formatted JSON (takes priority if present)
        partialMarksJson?: { scores: Array<{ marks: number; score: number; instruction: string; instruction_label: string | null; }> }
    };
    onSuccess?: () => void; // ✅ Callback to refetch data after successful submit
};

// ✅ Zod schema for remark
const remarkSchema = z.object({
    comments: z.string().trim().min(1, "Remark is required"),
});

type RemarkForm = z.infer<typeof remarkSchema>;

function RemarkModal({ show, onClose, remarkModalData, onSuccess }: Props) {
    console.log("🔍 RemarkModal rendered with show:", show, "data:", remarkModalData);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<RemarkForm>({
        resolver: zodResolver(remarkSchema),
        defaultValues: { comments: "" },
    });

    const onSubmit = async (data: RemarkForm) => {
        console.log("🔥 Form submitted with data:", data);
        console.log("📋 RemarkModalData:", remarkModalData);
        
        try {
            const partialMarksJson = remarkModalData?.partialMarksJson || (() => {
                const partialMarks = remarkModalData?.partialMarks ?? {};
                return {
                    scores: Object.entries(partialMarks).map(([key, val]) => {
                        const isObj = typeof val === "object" && val !== null;
                        const score = isObj ? Number((val as any).score ?? (val as any).marks ?? 0) : Number(val);
                        const marks = isObj ? Number((val as any).marks ?? (val as any).score ?? 0) : Number(val);
                        const instruction = isObj ? ((val as any).instruction ?? key) : key;
                        const instruction_label = isObj
                            ? ((val as any).instruction_label ?? instruction)
                            : instruction;
                        return {
                            score: score || 0,
                            marks: marks || 0,
                            instruction,
                            instruction_label,
                        };
                    }),
                };
            })();

            const totalMarks = partialMarksJson.scores.reduce((sum, s) => sum + (Number(s.score) || 0), 0);

            const payload = {
                examStudentMarks_id: remarkModalData?.examStudentMarks_id ?? 0,
                professor_remarks: data.comments, // ✅ This will be string from validation
                marks_obtained: totalMarks,
                partial_marks_json: partialMarksJson, // ✅ Correct property name
                total_score: totalMarks,
            };

            console.log("📤 Sending API payload:", payload);

            await raiseExamFlag(payload);

            console.log("✅ Remark saved successfully");

            reset(); // clear after save
            onClose(); // close modal
            
            // ✅ Call the refetch callback after successful submit with small delay
            if (onSuccess) {
                console.log("🔄 Calling refetch after successful remark submission");
                // Add small delay to ensure API response is processed
                setTimeout(() => {
                    onSuccess();
                }, 100);
            } else {
                console.log("⚠️ No onSuccess callback provided");
            }
        } catch (err) {
            console.error("❌ Failed to save remark:", err);
        }
    };

    return (
        <Modal show={show} size="md" onClose={onClose} popup>
            <ModalHeader className="px-6 py-3">Remarks <span className="text-red-500">*</span></ModalHeader>
            <ModalBody>
                <form 
                    onSubmit={(e) => {
                        console.log("📝 Form onSubmit triggered");
                        handleSubmit(onSubmit)(e);
                    }} 
                    className="space-y-4"
                >
                    <div>
                        {/* <div className="flex mb-4 gap-2 text-sm text-red-600 font-medium">
                            <span className="text-lg">⚠️</span>
                            <span>Please note: If you submit an incorrect request, your marks may be reduced.</span>
                        </div> */}
                        {/* <Label htmlFor="comments" className="mb-2">
                            Comments 
                        </Label> */}
                        <textarea
                            id="comments"
                            {...register("comments")}
                            className={`mt-1 w-full rounded-md border px-3 py-2 ${errors.comments ? "border-red-500" : "border-gray-300"
                                }`}
                            rows={4}
                            placeholder="Add feedback for student"
                            disabled={isSubmitting}
                        />
                        {errors.comments && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.comments.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            color="gray"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            onClick={() => console.log("🔥 Submit button clicked")}
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </ModalBody>
        </Modal>
    );
}

export default RemarkModal;
