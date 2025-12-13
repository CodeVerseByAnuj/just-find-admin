import { getCategory } from '@/app/router/category.router';
import { useQuery } from '@tanstack/react-query';

function useCategory() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => await getCategory({ page: 1, limit: 1000 }),
  });

  return {
    categories: data?.categories.data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export default useCategory
