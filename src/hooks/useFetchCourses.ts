import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/app/router/course.router';
import { Course } from '@/lib/schemas/course.schema';

export interface UseFetchCoursesOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

/**
 * 🔹 Special hook to fetch courses with enhanced error handling and caching
 * This hook provides a robust way to fetch courses with proper loading states,
 * error handling, and retry logic specifically designed for professor course assignment.
 * 
 * @param options - Configuration options for the query
 * @returns Query result with courses data, loading state, and error information
 */
export const useFetchCourses = (options: UseFetchCoursesOptions = {}) => {
  const {
    staleTime = 10 * 60 * 1000, // 10 minutes default
    gcTime = 15 * 60 * 1000, // 15 minutes default
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ['courses-for-professors'],
    queryFn: async (): Promise<{ data: Course[] }> => {
      try {
        console.log('🔄 Fetching courses for professor assignment...');
        const response = await getCourses();
        console.log('Response received:', response);
        
        if (!response) {
          throw new Error('No response received from courses API');
        }

        if (!response) {
          console.warn('⚠️ No courses data in response, returning empty array');
          return { data: [] };
        }
        
        const courses = Array.isArray(response) ? response : [];
       
        return { data: courses };
      } catch (error) {
        console.error('❌ Failed to fetch courses:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Unable to load courses: ${errorMessage}`);
      }
    },
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus,
    enabled,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: {
      errorMessage: 'Failed to load courses for professor assignment',
    },
  });
};

/**
 * 🔹 Hook to get formatted course options for select dropdowns
 * 
 * @param options - Configuration options for the courses query
 * @returns Object containing course options, loading state, and error information
 */
export const useCourseOptions = (options: UseFetchCoursesOptions = {}) => {
  const { data, isLoading, error } = useFetchCourses(options);
  
  const courseOptions = (data?.data || []).map((course) => ({
    value: course.id,
    label: `${course.title} (${course.code})`,
    course,
  }));

  return {
    courseOptions,
    isLoading,
    error,
    coursesCount: data?.data?.length || 0,
  };
};
