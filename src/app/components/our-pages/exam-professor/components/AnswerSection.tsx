import React from 'react';
import { Button, Textarea } from 'flowbite-react';
import Link from 'next/link';
import Compiler from '../../comiler/Compiler';

interface AnswerSectionProps {
    rubric?: string;
    studentAnswerContent?: string;
    studentAnswerURL?: string;
    questionType?: string;
    compilerCode?: string;
}

const AnswerSection: React.FC<AnswerSectionProps> = ({
    rubric,
    studentAnswerContent,
    studentAnswerURL,
    questionType,
    compilerCode
}) => {
    return (
        <div className="space-y-4">
            {rubric && (
                <div>
                    <strong>Rubric:</strong>
                    <Textarea
                        rows={4}
                        value={rubric.replace(/\\n/g, '\n')}
                        readOnly
                    />
                </div>
            )}

            {(studentAnswerContent || studentAnswerURL) && (
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-normal font-semibold">Answer:</span>
                        <div className="flex items-center gap-2">
                            {studentAnswerURL && (
                                <Link target="_blank" href={studentAnswerURL}>
                                    <Button>Download PDF</Button>
                                </Link>
                            )}
                            {questionType === 'code' && (
                                <Compiler 
                                    language_id={50} 
                                    stdin="" 
                                    source_code={compilerCode ?? ""} 
                                />
                            )}
                        </div>
                    </div>
                    {studentAnswerContent && (
                        <textarea
                            className="w-full border resize-none border-gray-200 !bg-white rounded-md p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            rows={5}
                            value={studentAnswerContent.replace(/\\n/g, '\n')}
                            disabled
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default AnswerSection;