import { useState, useEffect } from 'react';
import { getDepartmentCourses } from '@/app/router/course.router';
import { Course } from '@/lib/schemas/course.schema';
import { DepartmentWiseCourse } from '@/lib/schemas/course.schema';
// Removed incorrect import of 'id' from 'date-fns/locale'

export const useDepartmentCourses = (departmentId?: number) => {
  const [courses, setCourses] = useState<DepartmentWiseCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentId) {
      setCourses([]);
      return;
    }
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesData = await getDepartmentCourses({ id: departmentId });
        setCourses(coursesData);
      } catch (err) {
        setError('Failed to fetch courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [departmentId]);

  return { courses, loading, error };
};
