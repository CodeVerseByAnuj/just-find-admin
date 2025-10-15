import { useQuery } from '@tanstack/react-query';
import { getAllDepartments } from '@/app/router/department.router';
import { Department } from '@/lib/schemas/department.schema';

export interface UseFetchDepartmentsOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

/**
 * 🔹 Special hook to fetch departments with enhanced error handling and caching
 * This hook provides a robust way to fetch departments with proper loading states,
 * error handling, and retry logic specifically designed for professor department assignment.
 * 
 * @param options - Configuration options for the query
 * @returns Query result with departments data, loading state, and error information
 */
export const useFetchDepartments = (options: UseFetchDepartmentsOptions = {}) => {
  const {
    staleTime = 10 * 60 * 1000, // 10 minutes default
    gcTime = 15 * 60 * 1000, // 15 minutes default
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ['departments-for-professors'],
    queryFn: async (): Promise<{ data: Department[] }> => {
      try {
        const response = await getAllDepartments();
        
        if (!response) {
          throw new Error('No response received from departments API');
        }

        if (!response.data) {
          console.warn('⚠️ No departments data in response, returning empty array');
          return { data: [] };
        }
        
        const departments = Array.isArray(response.data) ? response.data : [];
        
        return { data: departments };
      } catch (error) {
        console.error('❌ Failed to fetch departments:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Unable to load departments: ${errorMessage}`);
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
      errorMessage: 'Failed to load departments for professor assignment',
    },
  });
};

/**
 * 🔹 Hook to get formatted department options for select dropdowns
 * 
 * @param options - Configuration options for the departments query
 * @returns Object containing department options, loading state, and error information
 */
export const useDepartmentOptions = (options: UseFetchDepartmentsOptions = {}) => {
  const { data, isLoading, error } = useFetchDepartments(options);
  
  const departmentOptions = (data?.data || []).map((department) => ({
    value: department.id,
    label: department.name,
    department,
  }));

  return {
    departmentOptions,
    isLoading,
    error,
    departmentsCount: data?.data?.length || 0,
  };
};
