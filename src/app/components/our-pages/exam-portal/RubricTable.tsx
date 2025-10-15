import React from 'react';
import { Label } from 'flowbite-react';

interface RubricInstruction {
    marks: number;
    instruction: string;
    instruction_label: string;
}

interface RubricData {
    instructions: RubricInstruction[];
    expected_answer?: string;
    original_rubric?: string;
}

interface RubricTableProps {
    rubric: RubricData | null;
}

const RubricTable: React.FC<RubricTableProps> = ({ rubric }) => {
    if (!rubric || !rubric.instructions || !Array.isArray(rubric.instructions)) return null;
    return (
        <div className="overflow-x-auto mb-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="min-w-full border text-sm">
                <thead>
                    <tr className="bg-blue-200 text-primary">
                        <th className="border px-2 py-1 text-left">Scoring Parameter (s)</th>
                        <th className="border px-2 py-1 text-left">Instruction (s)</th>
                        <th className="border px-2 py-1 text-center">Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {rubric.instructions.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border px-2 py-1 font-semibold">{item.instruction_label}</td>
                            <td className="border px-2 py-1">{item.instruction}</td>
                             <td className="border px-2 py-1 text-center">{item.marks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RubricTable;
