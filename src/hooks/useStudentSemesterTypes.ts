import { useState, useEffect } from 'react';
import { getStudentSemesterTypes } from '@/app/router/StudentDahboard.router';

interface Semester {
  id: number;
  title: string;
}

export const useStudentSemesterTypes = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        setError(null);
        const semesterData = await getStudentSemesterTypes();
        setSemesters(semesterData);
      } catch (err) {
        setError('Failed to fetch semesters');
        console.error('Error fetching semesters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, []);

  return { 
    semesters, 
    loading, 
    error,  
  };
};
