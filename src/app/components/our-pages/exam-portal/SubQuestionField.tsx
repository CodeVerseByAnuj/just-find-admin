
import {
    Label,
    TextInput,
    Select,
    Button,
    Textarea,
} from 'flowbite-react';
import MyEditor from '../MyEditor';
import RubricTable from './RubricTable';

interface QuestionType {
    id: number;
    title: string;
}

interface SubQuestionFieldProps {
    qIndex: number;
    sIndex: number;
    register: any;
    errors: any;
    removeSubQuestion: (index: number) => void;
    trigger: any;
    questionTypes: QuestionType[];
    loading: boolean;
    isSubmitted: boolean;
    subQuestionId?: number; // Optional ID for existing sub-questions
    questions: any;
    setValue: any;
}
const SubQuestionField = ({ qIndex, sIndex, register, errors, removeSubQuestion, trigger, questionTypes, loading, isSubmitted, subQuestionId, questions, setValue }: SubQuestionFieldProps) => {
    console.log(questionTypes, "questionTypes");

    // Parse rubric JSON if available and valid
    let rubricData: any = null;
    try {
        const rubricRaw = questions?.[qIndex]?.sub_questions?.[sIndex]?.rubric_json;
        rubricData = typeof rubricRaw === 'string' ? JSON.parse(rubricRaw) : rubricRaw;
    } catch (e) {
        rubricData = null;
    }

    return (
        <div className="col-span-12 grid grid-cols-12 gap-4 items-start border-t pt-4">
            <div className="col-span-6">
                <div className="flex items-center gap-2 mb-2">
                    <Label>Sub Question Number:</Label>
                    <p className="text-gray-700">{questions[qIndex].sub_questions[sIndex].sub_question_number}</p>
                </div>
                {/* <TextInput
                    type="text"
                    readOnly
                    id={`subQnumber-${qIndex}-${sIndex}`}
                    {...register(`questions.${qIndex}.sub_questions.${sIndex}.sub_question_number`)}
                />
                {errors.questions?.[qIndex]?.sub_questions?.[sIndex]?.sub_question_number && isSubmitted && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.questions[qIndex].sub_questions[sIndex].sub_question_number.message}
                    </p>
                )} */}
            </div>

            <div className="col-span-6">
                <div className="flex items-center gap-2 mb-2">
                    <Label>Max Marks:</Label>
                    <p className="text-gray-700">{questions[qIndex].sub_questions[sIndex].max_marks}</p>
                </div>
                {/* <TextInput
                    type="text"
                    inputMode="numeric"
                    readOnly
                    pattern="[0-9]*"
                    {...register(`questions.${qIndex}.sub_questions.${sIndex}.max_marks`, {
                        onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                            // Trigger validation for the parent question's sub-question marks immediately
                            await trigger(`questions.${qIndex}.sub_questions`);
                        }
                    })}
                /> */}
                {/* {errors.questions?.[qIndex]?.sub_questions?.[sIndex]?.max_marks && (errors.questions[qIndex].sub_questions[sIndex].max_marks.type !== 'required' || isSubmitted) && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.questions[qIndex].sub_questions[sIndex].max_marks.message}
                    </p>
                )} */}
            </div>

            {/* <div className="col-span-12 lg:col-span-4">
                <div className="mb-2">
                    <Label>Question Type </Label>
                </div>
                <TextInput
                    type="text"
                    value={questions?.[qIndex]?.sub_questions?.[sIndex]?.question_type_id || ""}
                    readOnly
                    {...register(`questions.${qIndex}.sub_questions.${sIndex}.question_type_id`, {
                        onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
                            await trigger(`questions.${qIndex}.sub_questions`);
                        }
                    })}
                />
                {errors.questions?.[qIndex]?.sub_questions?.[sIndex]?.question_type_id && isSubmitted && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.questions[qIndex].sub_questions[sIndex].question_type_id.message}
                    </p>
                )}
            </div> */}

            <div className="col-span-12">
                <div className="mb-2">
                    <Label>Sub Question</Label>
                </div>
                <MyEditor
                    id={`sub-question-${qIndex}-${sIndex}`}
                    value={questions?.[qIndex]?.sub_questions?.[sIndex]?.question || ''}
                    placeholder="Enter sub question"
                    readOnly={true}
                    onChange={val => setValue(`questions.${qIndex}.sub_questions.${sIndex}.question`, val, { shouldValidate: true })}
                />
                {errors.questions?.[qIndex]?.sub_questions?.[sIndex]?.question && isSubmitted && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.questions[qIndex].sub_questions[sIndex].question.message}
                    </p>
                )}
            </div>

            <div className="col-span-12">
                <div className="mb-2">
                    <Label>Rubric</Label>
                </div>
                {/* Use common RubricTable component for structured rubric preview */}
                {rubricData && rubricData.instructions && Array.isArray(rubricData.instructions) ? (
                    <RubricTable rubric={rubricData} />
                ) : (
                    <Textarea
                        rows={6}
                        type="text"
                        readOnly
                        placeholder="https://example.com/rubric"
                        {...register(`questions.${qIndex}.sub_questions.${sIndex}.rubric_json`)}
                        color={errors.questions?.[qIndex]?.sub_questions?.[sIndex]?.rubric_json ? 'failure' : undefined}
                    />
                )}
                {errors.questions?.[qIndex]?.sub_questions?.[sIndex]?.rubric_json && isSubmitted && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.questions[qIndex].sub_questions[sIndex].rubric_json.message}
                    </p>
                )}
            </div>

            <div className="col-span-12">
                {/* <Button disabled color="error" size="sm" onClick={() => removeSubQuestion(sIndex)} type="button">
                    Delete Sub Question
                </Button> */}
            </div>
        </div>
    );
};

export default SubQuestionField
