import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStockMovements } from '@/server/actions/getStockMovements';
import { StockMovementFilters, StockMovementSort } from '@/types/stockMovement';
import { keepPreviousData } from '@tanstack/react-query';

export { getStockMovements };

export interface StockMovementsQueryParams {
  page?: number;
  pageSize?: number;
  filters?: StockMovementFilters;
  sort?: StockMovementSort;
}

type QueryOptions = {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  notifyOnChangeProps?: any ,
};

export function useStockMovements(
  params: StockMovementsQueryParams = {}, 
  options: QueryOptions = {}
) {
  // Default values
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const filters = params.filters || {};
  const sort = params.sort || { field: 'createdAt', direction: 'desc' };

  // Create a stable query key with a simple string format
  const queryKey = [
    'stockMovements', 
    page.toString(), 
    pageSize.toString(), 
    JSON.stringify(filters), 
    JSON.stringify(sort)
  ];

  // Calculate a reasonable stale time based on search
  const hasSearch = filters.search && filters.search.trim().length > 0;
  const defaultStaleTime = hasSearch ? 0 : 24 * 60 * 60 * 1000; // No cache when searching

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await getStockMovements(page, pageSize, filters, sort);
        
        if (!result.success) {
          console.error("API error:", result.error);
          throw new Error(result.error || 'Failed to fetch stock movements');
        }
        
        return {
          data: result.data?.data || [],
          pagination: result.data?.pagination || {
            total: 0,
            pageSize,
            currentPage: page,
            totalPages: 0
          }
        };
      } catch (error) {
        console.error("Stock movements fetch error:", error);
        throw error;
      }
    },
    staleTime: options.staleTime ?? defaultStaleTime,
    gcTime: 60000,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnMount: options.refetchOnMount ?? true,
    refetchOnReconnect: options.refetchOnReconnect ?? false,
    retry: 2,
    retryDelay: 1000,
    placeholderData: keepPreviousData
  });
  
  // Ensure we always return a valid data and pagination object
  return {
    ...query,
    data: query.data?.data || [],
    pagination: query.data?.pagination || {
      total: 0,
      pageSize,
      currentPage: page,
      totalPages: 0
    }
  };
}

/////////
export function usePrefetchStockMovements(
  params: StockMovementsQueryParams = {}, 
  options: QueryOptions = {},
) {
  const queryClient = useQueryClient();
  
  // Reuse the same parameter defaults and query key construction logic
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const filters = params.filters || {};
  const sort = params.sort || { field: 'createdAt', direction: 'desc' };

  const queryKey = [
    'stockMovements', 
    page.toString(), 
    pageSize.toString(), 
    JSON.stringify(filters), 
    JSON.stringify(sort)
  ];

  // Use the simplified prefetch function
  return () => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const result = await getStockMovements(page, pageSize, filters, sort);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch stock movements');
        }
        
        return {
          data: result.data?.data || [],
          pagination: result.data?.pagination || {
            total: 0,
            pageSize,
            currentPage: page,
            totalPages: 0
          }
        };
      },
      staleTime: 90 * 1000,
    });
  };
}

