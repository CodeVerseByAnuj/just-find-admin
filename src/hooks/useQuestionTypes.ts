import { useState, useEffect } from 'react';
import { getQuestionTypes } from '@/app/router/exam.router';

interface QuestionType {
  id: number;
  title: string;
  // Add other properties if needed based on your API response
}

export const useQuestionTypes = () => {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const types = await getQuestionTypes();
        setQuestionTypes(types);
      } catch (err) {
        setError('Failed to fetch question types');
        console.error('Error fetching question types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionTypes();
  }, []);

  return { questionTypes, loading, error };
};
