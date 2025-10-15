"use client"
import React from "react"
import { Button, TextInput, Tooltip } from "flowbite-react"

interface PartialMark {
  marks: number
  score: number
  instruction: string
  instruction_label: string | null
}

interface PartialMarksSectionProps {
  // accept nullable fields coming from Zod schema
  question: {
    id: number
    maxMarks?: number | null
    score?: number | null
    aiInsights?: string | null
    examMarkId?: number | null
  }
  scores: Record<string, number>
  partialMarks: Record<string, PartialMark[]> | any
  onPartialMarksChange: (stepKey: string, value: string) => void
  onSavePartialMarks: () => void
  scoreKey: string
}

export default function PartialMarksSection({
  question,
  scores,
  partialMarks,
  onPartialMarksChange,
  onSavePartialMarks,
  scoreKey
}: PartialMarksSectionProps) {
  return (
    <div className="rounded-md mb-4 border border-gray-200 bg-white p-4 py-6 flex gap-6">
      <div className="flex-1 bg-gray-100 p-2 rounded-md">
        {/* Score Input */}
        <div className="flex justify-between items-center gap-4 mb-3">
          <h4 className="text-gray-800 font-semibold">Marks Obtained</h4>
          <TextInput
            type="number"
            value={scores[scoreKey] ?? 0}
            disabled
            max={question.maxMarks ?? 0}
            readOnly
          />
        </div>

        {/* Partial Marks */}
        {partialMarks && Object.keys(partialMarks).length > 0 && (
          <>
            <h4 className="text-gray-800 font-semibold mb-3">Partial Marks</h4>
            <div className="space-y-2">
              {/* Handle different partialMarks formats */}
              {partialMarks.scores ? (
                // New format with scores array
                partialMarks.scores.map((mark: PartialMark, idx: number) => (
                  <PartialMarkRow
                    key={`score-${idx}`}
                    mark={mark}
                    stepKey={`step1-${idx}`}
                    onChange={onPartialMarksChange}
                  />
                ))
              ) : (
                // Old format or Record<string, PartialMark[]>
                Object.entries(partialMarks).flatMap(([step, marksArr]: [string, any]) =>
                  Array.isArray(marksArr) 
                    ? marksArr.map((mark: PartialMark, idx: number) => (
                        <PartialMarkRow
                          key={`${step}-${idx}`}
                          mark={mark}
                          stepKey={`${step}-${idx}`}
                          onChange={onPartialMarksChange}
                        />
                      ))
                    : []
                )
              )}
            </div>
            <div className="flex justify-end items-center mt-3 gap-2">
              <Button size="sm" onClick={onSavePartialMarks}>
                Save
              </Button>
            </div>
          </>
        )}
      </div>

      {/* AI Insights */}
      {question.aiInsights && (
        <div className="flex-1 bg-gray-100 p-2 rounded-md">
          <h4 className="text-gray-800 font-semibold mb-3">AI Remarks</h4>
          <div className="space-y-2">
            <p className="whitespace-pre-wrap">{question.aiInsights?.replace(/\\n/g, '\n')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface PartialMarkRowProps {
  mark: PartialMark
  stepKey: string
  onChange: (stepKey: string, value: string) => void
}

function PartialMarkRow({ mark, stepKey, onChange }: PartialMarkRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm hover:bg-blue-50 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">{mark.instruction_label}</span>
        <Tooltip
          content={
            <div className="max-w-xs break-words p-2 radius-sm">
              {mark.instruction}
            </div>
          }
          trigger="hover"
        >
          <span>
            <svg
              className="w-4 h-4 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </span>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="number"
          min={0}
          value={mark.score || ''}
          max={mark.marks}
          onChange={(e) => onChange(stepKey, e.target.value)}
          placeholder="0"
        />
        <span className="font-medium text-gray-500 text-xs">/ {mark.marks}</span>
      </div>
    </div>
  )
}