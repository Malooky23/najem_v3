'use client';
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ItemSchemaType } from "@/types/items";
import { CustomerList, EnrichedCustomer } from "@/types/customer";
import { EnrichedOrders, type OrderFilters, type OrderSort } from "@/types/orders";
import { getSession } from 'next-auth/react';
import { getOrders, getOrderById } from "@/server/actions/orders";
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

// Update the useOrderDetails hook to better handle errors and missing IDs
export function useOrderDetails(
  orderId: string | null,
  selectedOrder: any | null = null // add parameter
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) {
        console.log("No order ID provided to fetch");
        return null;
      }
      console.log("Fetching order details for ID:", orderId);
      try {
        const result = await getOrderById(orderId);
        if (!result.success) {
          console.error("Error fetching order:", result.error);
          throw new Error(result.error || 'Failed to fetch order');
        }
        return result.data;
      } catch (error) {
        console.error("Exception in order fetch:", error);
        throw error;
      }
    },
    enabled: !!orderId,
    staleTime: 60 * 60 * 1000,
    retry: 2, // Retry failed requests twice
    retryDelay: attempt => Math.min(attempt * 1000, 3000), // Exponential backoff
  });
}

export function useOrdersQuery(params: OrdersQueryParams = {}) {
  const queryClient = useQueryClient();

  const query = useQuery<OrdersQueryResult>({
    queryKey: ['orders', params],
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
      if (!result.data) {
        throw new Error('Failed to fetch orders');
      }

      return {
        orders: result.data.orders,
        pagination: result.data.pagination
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000,
    placeholderData: keepPreviousData,

  });

  const invalidateOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
      queryClient.invalidateQueries({ queryKey: ['items'] }),
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] })
    ]);

    return Promise.all([
      query.refetch(),
      queryClient.refetchQueries({ queryKey: ['items'] }),
      queryClient.refetchQueries({ queryKey: ['stockMovements'] })
    ]);
  };
  return {
    ...query,
    invalidateOrders,
    data: query.data?.orders || [],
    pagination: query.data?.pagination
  };
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
    gcTime: 60 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,


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
      
//       const queryParams = new URLSearchParams();
//       if (params.page) queryParams.set('page', String(params.page));
//       if (params.pageSize) queryParams.set('pageSize', String(params.pageSize));
//       if (params.filters) queryParams.set('filters', JSON.stringify(params.filters));
//       if (params.sort) queryParams.set('sort', JSON.stringify(params.sort));
      
//       // Create an AbortController for timeout handling
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
      
//       try {
//         const res = await fetch(`/api/stock-movements?${queryParams.toString()}`, {
//           headers: {
//             'Authorization': `Bearer ${session}`
//           },
//           signal: controller.signal
//         });
        
//         clearTimeout(timeoutId);
        
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
        
//         const data = await res.json();
        
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

