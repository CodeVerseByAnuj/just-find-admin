// ...existing code...
// ...existing code...
// Rubric JSON string
const rubricJSONString = `{"instructions":[{"marks":2,"instruction":"Ensure the student has written all instructions from the question paper's top and within each question, demonstrating comprehension of the guidelines provided.","instruction_label":"Comprehension of instructions"},{"marks":2,"instruction":"Confirm that the student has followed the specific guidelines such as boxing answers, avoiding cutting, and planning pages appropriately as outlined in the rubric.","instruction_label":"Guideline adherence"}],"expected_answer":"This question is a pledge that 1800 students will write a clean readable exam, with proper order, box the answer and avoid cutting.","original_rubric":"General Exam Instructions: Solve only 5 questions in order. A new problem should start on a new page. If not sure about a problem, leave appropriate pages for the leftovers. Plan on the last page before writing to avoid cutting. No partial credit and no rechecking for the mess. Specific Guidelines for Answering: Q1: Demands highlighting the answer in the box.","output_json_scheme":{"scores":[{"marks":2,"score":0,"instruction":"Ensure the student has written all instructions from the question paper's top and within each question, demonstrating comprehension of the guidelines provided.","instruction_label":"Comprehension of instructions"},{"marks":2,"score":0,"instruction":"Confirm that the student has followed the specific guidelines such as boxing answers, avoiding cutting, and planning pages appropriately as outlined in the rubric.","instruction_label":"Guideline adherence"}]}}`;

// Parse the string to object
const rubric = JSON.parse(rubricJSONString);

// Render rubric instructions
function RubricInstructions() {
    return (
        <div style={{ margin: '1em 0' }}>
            <h3>Rubric Instructions</h3>
            <ul>
                {rubric.instructions.map((item: any, idx: number) => (
                    <li key={idx} style={{ marginBottom: '1em', padding: '0.5em', border: '1px solid #eee', borderRadius: '6px' }}>
                        <strong>Label:</strong> {item.instruction_label} <br />
                        <strong>Instruction:</strong> {item.instruction} <br />
                        <strong>Marks:</strong> {item.marks}
                    </li>
                ))}
            </ul>
        </div>
    );
}
// ...existing code...
// ...existing code...
// Example usage inside your component's JSX:
// <RubricInstructions />

import React from 'react';
import RubricTable from './RubricTable';
import { useState } from 'react';
import {
    Label,
    TextInput,
    Select,
    Button,
    Checkbox,
    Textarea,
} from 'flowbite-react';
import { useFieldArray, Controller } from 'react-hook-form';
import SubQuestionField from './SubQuestionField';
import MyEditor from '../MyEditor';

interface QuestionFieldProps {
    qIndex: number;
    control: any;
    register: any;
    errors: any;
    watchedQuestions: any[];
    removeQuestion: (index: number) => void;
    trigger: any;
    setValue: any;
    isSubmitted: boolean;
    questionId?: number; // Optional ID for existing questions
    originalQuestionData?: any; // Original question data from API
    questionTypes: any[]; // Add questionTypes prop
    loading?: boolean; // Add loading prop
}


const QuestionField = ({ qIndex, control, register, errors, watchedQuestions, removeQuestion, trigger, setValue, isSubmitted, questionId, originalQuestionData, questionTypes, loading = false }: QuestionFieldProps) => {
    const { fields: subQuestionFields, append: appendSubQuestion, remove: removeSubQuestion } = useFieldArray({
        control,
        name: `questions.${qIndex}.sub_questions`,
    });

    // Add setValue to destructuring

    const [content, setContent] = useState('')
    const currentQuestion = watchedQuestions[qIndex];
    const hasSub = currentQuestion?.has_sub_question;

    // Uncheck has_sub_question if all sub-questions are deleted
    React.useEffect(() => {
        if (subQuestionFields.length === 0 && hasSub) {
            setValue(`questions.${qIndex}.has_sub_question`, false, { shouldValidate: true });
        }
    }, [subQuestionFields.length, hasSub, setValue, qIndex]);

    const addSubQuestion = () => {
        const qNum = currentQuestion?.question_number || (qIndex + 1).toString();
        const existingCount = subQuestionFields.length;
        const newSubNum = `${qNum}${String.fromCharCode(97 + existingCount)}`;

        appendSubQuestion({
            has_sub_question: false,
            sub_question_number: newSubNum,
            question: '',
            question_type_id: "",
            max_marks: '',
            rubric_json: '',
        });
    };

    return (
        <div className="col-span-12 border rounded p-4 mb-6 space-y-4">
            <div className="grid grid-cols-12 gap-4">
                {/* Only show Question Number if it has a value */}
                {currentQuestion?.question_number && (
                    <div className="col-span-12 lg:col-span-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor={`qnumber-${qIndex}`}>Question Number:</Label>
                            <p className='text-gray-600'>{currentQuestion?.question_number}</p>
                        </div>
                        {/* <TextInput
                            id={`qnumber-${qIndex}`}
                            {...register(`questions.${qIndex}.question_number`)}
                            readOnly
                        />
                        {errors.questions?.[qIndex]?.question_number && isSubmitted && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.questions[qIndex].question_number.message}
                            </p>
                        )} */}
                    </div>
                )}

                {/* Only show Max Marks if it has a value */}
                {currentQuestion?.max_marks && (
                    <div className="col-span-12 lg:col-span-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor={`maxMarks-${qIndex}`}>Max Marks:</Label>
                            <p className='text-gray-600'>{currentQuestion?.max_marks}</p>
                        </div>
                        {/* <TextInput
                            id={`maxMarks-${qIndex}`}
                            type="text"
                            inputMode="numeric"
                            readOnly
                            pattern="[0-9]*"
                            placeholder="10"
                            {...register(`questions.${qIndex}.max_marks`, {
                                onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    e.target.value = value;
                                    await trigger(`questions.${qIndex}.sub_questions`);
                                }
                            })}
                        /> */}
                        {/* {errors.questions?.[qIndex]?.max_marks && (errors.questions[qIndex].max_marks.type !== 'required' || isSubmitted) && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.questions[qIndex].max_marks.message}
                            </p>
                        )} */}
                    </div>
                )}

                {/* Only show Question Type if it has a value */}
                {/* {currentQuestion?.question_type_id && (
                    <div className="col-span-12 lg:col-span-4">
                        <div className="mb-2">
                            <Label htmlFor={`questionType-${qIndex}`}>Question Type</Label>
                        </div>
                        <TextInput
                            id={`questionType-${qIndex}`}
                            value={currentQuestion?.question_type_id || ''}
                            readOnly
                            placeholder={'Enter question type'}
                        />
                        {errors.questions?.[qIndex]?.question_type_id && isSubmitted && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.questions[qIndex].question_type_id.message}
                            </p>
                        )}
                    </div>
                )} */}

                {/* Only show Question if it has content */}
                {currentQuestion?.question && (
                    <div className="col-span-12">
                        <div className="mb-2">
                            <Label htmlFor={`question-${qIndex}`}>Question </Label>
                        </div>
                        <MyEditor
                            id={`question-${qIndex}`}
                            value={currentQuestion?.question || ''}
                            placeholder="Enter question"
                            readOnly={true}
                            onChange={(val: string) => setValue(`questions.${qIndex}.question`, val, { shouldValidate: true })}
                        />
                        {errors.questions?.[qIndex]?.question && isSubmitted && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.questions[qIndex].question.message}
                            </p>
                        )}
                    </div>
                )}

                {/* Only show Rubric if it has content */}
                {currentQuestion?.rubric_json && (
                    <div className="col-span-12">
                        <div className="mb-2">
                            <Label htmlFor={`rubric-q-${qIndex}`}>Rubric </Label>
                        </div>
                        {/* Show formatted rubric instructions as table if valid JSON, else fallback to textarea */}
                        {(() => {
                            let rubricObj;
                            try {
                                rubricObj = JSON.parse(currentQuestion.rubric_json);
                            } catch {
                                rubricObj = null;
                            }
                            if (rubricObj && rubricObj.instructions && Array.isArray(rubricObj.instructions)) {
                                return <RubricTable rubric={rubricObj} />;
                            } else {
                                return (
                                    <Textarea
                                        rows={6}
                                        readOnly
                                        id={`rubric-q-${qIndex}`}
                                        type="text"
                                        placeholder="https://example.com/rubric"
                                        {...register(`questions.${qIndex}.rubric_json`)}
                                        color={errors.questions?.[qIndex]?.rubric_json ? 'failure' : undefined}
                                    />
                                );
                            }
                        })()}
                        {errors.questions?.[qIndex]?.rubric_json && isSubmitted && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.questions[qIndex].rubric_json.message}
                            </p>
                        )}
                    </div>
                )}

                {/* Only show Has Sub Questions checkbox if the question has sub questions or the data exists */}
                {(currentQuestion?.has_sub_question || hasSub) && (
                    <div className="col-span-12 flex items-center gap-2">
                        <Controller
                            name={`questions.${qIndex}.has_sub_question`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id={`hasSub-${qIndex}`}
                                    disabled
                                    checked={field.value}
                                    onChange={async (e) => {
                                        field.onChange(e.target.checked);
                                        if (e.target.checked && subQuestionFields.length === 0) {
                                            addSubQuestion();
                                        }
                                    }}
                                    onSubmit={async () => {  // Trigger validation for this question when hasSub changes
                                        await trigger(`questions.${qIndex}`);
                                    }}
                                />
                            )}
                        />
                        <Label htmlFor={`hasSub-${qIndex}`}>Has Sub Questions</Label>
                    </div>
                )}

                {hasSub && subQuestionFields.map((subField, sIndex) => {
                    // Get the sub-question data from the original API response
                    const originalSubQuestionData = originalQuestionData?.sub_questions?.[sIndex];
                    return (
                        <SubQuestionField
                            key={subField.id}
                            qIndex={qIndex}
                            sIndex={sIndex}
                            register={register}
                            errors={errors}
                            removeSubQuestion={removeSubQuestion}
                            trigger={trigger}
                            questionTypes={questionTypes} // Pass questionTypes prop
                            loading={loading} // Pass loading prop
                            isSubmitted={isSubmitted}
                            subQuestionId={originalSubQuestionData?.question_type_id} // Pass original ID from API
                            questions={watchedQuestions}
                            setValue={setValue}
                        />
                    );
                })}

                {hasSub && (
                    <div className="col-span-12">
                        {/* <Button disabled size="sm" color="gray" onClick={addSubQuestion} type="button" className="mt-2">
                            + Add Sub Question
                        </Button> */}
                    </div>
                )}

                {/* Display validation error for sub-questions marks exceeding parent question marks */}
                {/* Show sub-question marks error always, not just on submit */}
                {/* Show root-level error for sub-question marks validation */}
                {errors.questions?.[qIndex]?.sub_questions?.root?.message && (
                    <div className="col-span-12">
                        <p className="text-red-500 text-sm mt-1">
                            {errors.questions[qIndex].sub_questions.root.message}
                        </p>
                    </div>
                )}

                {/* Only show Delete button if there's actual question data */}
                {(currentQuestion?.question_number || currentQuestion?.question || currentQuestion?.max_marks) && (
                    <div className="col-span-12 flex justify-end">
                        {/* <Button disabled color="error" size="sm" onClick={() => removeQuestion(qIndex)} type="button">
                            Delete Question
                        </Button> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionField
