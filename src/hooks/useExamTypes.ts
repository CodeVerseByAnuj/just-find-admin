import { useState, useEffect } from 'react';
import { getExamTypes } from '@/app/router/exam.router';

interface ExamType {
  id: number;
  title: string;
  // Add other properties if needed based on your API response
}

export const useExamTypes = () => {
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const types = await getExamTypes();
        setExamTypes(types);
      } catch (err) {
        setError('Failed to fetch exam types');
        console.error('Error fetching exam types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamTypes();
  }, []);

  return { examTypes, loading, error };
};
