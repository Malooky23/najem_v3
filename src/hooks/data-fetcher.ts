'use client';
import { keepPreviousData, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { type ItemSchemaType } from "@/types/items";
import { CustomerList, EnrichedCustomer } from "@/types/customer";
import { EnrichedOrders, type OrderFilters, type OrderSort, OrderStatus } from "@/types/orders";
import { getSession } from 'next-auth/react';
import { getOrders, getOrderById, updateOrder } from "@/server/actions/orders";
import { EnrichedStockMovementView, StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { StockMovement } from "@/server/db/schema";
import { getStockMovements } from "@/server/actions/getStockMovements";
import { useMemo, useCallback, useEffect, useState, useRef } from "react";


export interface OrdersQueryParams {
  page?: number;
  pageSize?: number;
  filters?: OrderFilters;
  sort?: OrderSort;
}

export interface OrdersQueryResult {
  orders: EnrichedOrders[];
  pagination: {
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}

// Define better types for order update responses
export interface OrderUpdateResult {
  success: boolean;
  data?: EnrichedOrders;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
}

type MutationContext = {
  previousOrders?: OrdersQueryResult;
  previousSingleOrder?: EnrichedOrders;
} | undefined;

// Optimize the order details fetch to minimize unnecessary requests
export function useOrderDetails(
  orderId: string | null,
  selectedOrder: EnrichedOrders | null = null
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      // Use cached order if possible to avoid network request
      if (selectedOrder && selectedOrder.orderId === orderId) {
        return selectedOrder;
      }
      
      const result = await getOrderById(orderId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order');
      }
      return result.data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// Completely refactored orders query for much better performance
export function useOrdersQuery(params: OrdersQueryParams = {}) {
  const queryClient = useQueryClient();
  
  // Convert params to a stable string key to prevent unnecessary refetches
  const stableQueryKey = useMemo(() => {
    return [
      'orders',
      params.page || 1,
      params.pageSize || 10,
      JSON.stringify(params.filters || {}),
      `${params.sort?.field || 'createdAt'}-${params.sort?.direction || 'desc'}`
    ];
  }, [params.page, params.pageSize, params.filters, params.sort]);

  const query = useQuery({
    queryKey: stableQueryKey,
    queryFn: async () => {
      const result = await getOrders(
        params.page || 1,
        params.pageSize || 10,
        params.filters || {},
        params.sort || { field: 'createdAt', direction: 'desc' }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders');
      }
      
      return {
        orders: result.data!.orders,
        pagination: result.data!.pagination
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Use a cleaner return pattern with more informative loading states
  return {
    data: query.data?.orders || [],
    pagination: query.data?.pagination,
    // Only show loading state for initial data load, not refetches
    isInitialLoading: query.isLoading && query.fetchStatus === 'fetching' && !query.data,
    // isFetching indicates any background loading (useful for subtle indicators)
    isFetching: query.isFetching, 
    // Add a status indicator for dev purposes
    status: query.status,
    fetchStatus: query.fetchStatus,
    // Keep other states
    isError: query.isError,
    error: query.error,
  };
}

// Enhanced order update mutation that properly handles the cache
export function useOrderStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation<
    OrderUpdateResult,
    Error,
    { orderId: string; status: OrderStatus },
    { previousData: EnrichedOrders | undefined }
  >({
    mutationFn: async ({ orderId, status }) => {
      // Get the current order from cache
      const currentOrder = queryClient.getQueryData<EnrichedOrders>(['order', orderId]);
      
      if (!currentOrder) {
        throw new Error('Order not found in cache');
      }
      
      // Create updated order with new status
      const updatedOrder: EnrichedOrders = {
        ...currentOrder,
        status
      };
      
      // Call the API
      const result = await updateOrder(updatedOrder);
      return result;
    },
    
    // Optimistically update UI
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<EnrichedOrders>(['order', orderId]);

      // Optimistically update the cache
      if (previousData) {
        queryClient.setQueryData<EnrichedOrders>(['order', orderId], {
          ...previousData,
          status
        });
      }
      
      // Update the order in the list as well
      const ordersKey = queryClient.getQueryCache().findAll({ queryKey: ['orders'] });
      ordersKey.forEach(query => {
        const data = query.state.data as OrdersQueryResult;
        if (data?.orders) {
          queryClient.setQueryData(query.queryKey, {
            ...data,
            orders: data.orders.map(order => 
              order.orderId === orderId ? { ...order, status } : order
            )
          });
        }
      });
      
      return { previousData };
    },
    
    // Handle errors and revert optimistic update
    onError: (err, { orderId }, context) => {
      console.error('Error updating order status:', err);

      // Revert the optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['order', orderId], context.previousData);
        
        // Also revert in the list
        const ordersKey = queryClient.getQueryCache().findAll({ queryKey: ['orders'] });
        ordersKey.forEach(query => {
          const data = query.state.data as OrdersQueryResult;
          if (data?.orders) {
            queryClient.setQueryData(query.queryKey, {
              ...data,
              orders: data.orders.map(order => 
                order.orderId === orderId ? context.previousData : order
              )
            });
          }
        });
      }
    },
    
    // Refresh data after mutation
    onSettled: (result, error, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.refetchQueries({queryKey: ['order', orderId]})
    }
  });
}

export function useCustomers() {
  return useQuery<EnrichedCustomer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const session = await getSession()
      const res = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${session}` // Include token in header
        }
      }); // Call API route
      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }
      return res.json();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 100 * 100 * 100 * 100,
    placeholderData: keepPreviousData,
  });
}
export function useSelectCustomerList() {
  return useQuery<CustomerList[]>({
    queryKey: ['customersList'],
    queryFn: async () => {
      const session = await getSession()
      const res = await fetch('/api/customers/list', {
        headers: {
          'Authorization': `Bearer ${session}` // Include token in header
        }
      }); // Call API route
      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }
      return res.json();
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 100 * 100 * 100 * 100,
    placeholderData: keepPreviousData,
  });
}

export function useItems() {
  return useQuery<ItemSchemaType[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const session = await getSession();

      const res = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${session}`
        }
      });
      if (!res.ok) {
        let errorResponse;
        try {
          errorResponse = await res.json();
        } catch (jsonError) {
          errorResponse = { message: 'Failed to parse error response as JSON', rawResponse: await res.text() };
          console.error("JSON parsing error:", jsonError);
        }
        console.error("API error response:", errorResponse);
        throw new Error(`Failed to fetch items. API Response: ${JSON.stringify(errorResponse)}`);
      }
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 5 minutes
    // gcTime: 60 * 60 * 1000, // 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,


  });
}


// export interface StockMovementsQueryParams {
//   page?: number;
//   pageSize?: number;
//   filters?: StockMovementFilters;
//   sort?: StockMovementSort;
// }
// export interface StockMovementsQueryResult {
//   data: EnrichedStockMovementView[];
//   pagination: {
//     total: number;
//     pageSize: number;
//     currentPage: number;
//     totalPages: number;
//   };
// }

// Fix the stock movements hook to properly handle fetch keys and deduplication
// export function useStockMovements(params: StockMovementsQueryParams = {}) {
//   return useQuery<StockMovementsQueryResult>({
//     queryKey: ['stockMovements', params],
//     queryFn: async () => {
//       const session = await getSession();
//       
//       const queryParams = new URLSearchParams();
//       if (params.page) queryParams.set('page', String(params.page));
//       if (params.pageSize) queryParams.set('pageSize', String(params.pageSize));
//       if (params.filters) queryParams.set('filters', JSON.stringify(params.filters));
//       if (params.sort) queryParams.set('sort', JSON.stringify(params.sort));
//       
//       // Create an AbortController for timeout handling
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
//       
//       try {
//         const res = await fetch(`/api/stock-movements?${queryParams.toString()}`, {
//           headers: {
//             'Authorization': `Bearer ${session}`
//           },
//           signal: controller.signal
//         });
//         
//         clearTimeout(timeoutId);
//         
//         if (!res.ok) {
//           let errorResponse;
//           try {
//             errorResponse = await res.json();
//           } catch (jsonError) {
//             errorResponse = { 
//               message: 'Failed to parse error response as JSON', 
//               rawResponse: await res.text() 
//             };
//             console.error("JSON parsing error:", jsonError);
//           }
//           console.error("API error response:", errorResponse);
//           throw new Error(`Failed to fetch stock movements. API Response: ${JSON.stringify(errorResponse)}`);
//         }
//         
//         const data = await res.json();
//         
//         return {
//           data: data.stockMovements || [],
//           pagination: data.pagination || {
//             total: 0,
//             pageSize: params.pageSize || 10,
//             currentPage: params.page || 1,
//             totalPages: 0
//           }
//         };
//       } catch (error) {
//         clearTimeout(timeoutId);
//         if (error.name === 'AbortError') {
//           throw new Error('Request timeout: The server took too long to respond');
//         }
//         throw error;
//       }
//     },
//     staleTime: 30 * 1000, // 30 seconds instead of very long cache time
//     gcTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//     retry: 1, // Limit retries to prevent infinite loading
//     retryDelay: 1000, // 1 second between retries
//   });
// }
