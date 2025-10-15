import React from 'react';

interface AIRemarksSectionProps {
  aiInsights?: string | null;
}

/**
 * Displays AI generated insights / remarks for a question or sub-question.
 * Renders nothing if no insights are provided.
 */
const AIRemarksSection: React.FC<AIRemarksSectionProps> = ({ aiInsights }) => {
  if (!aiInsights) return null;

  return (
    <div className="flex-1 border border-gray-200 rounded-md p-4 bg-gray-50 max-h-[300px] overflow-auto">
      <h4 className="font-semibold text-sm mb-2">AI Insights</h4>
      <p className="text-sm whitespace-pre-wrap leading-relaxed">
        {aiInsights.replace(/\\n/g, '\n')}
      </p>
    </div>
  );
};

export default AIRemarksSection;
