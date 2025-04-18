'use client';
import { keepPreviousData, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { type ItemSchemaType } from "@/types/items";
import { CustomerList, EnrichedCustomer } from "@/types/customer";
import { EnrichedOrders, InsertOrder, type OrderFilters, type OrderSort, UpdateOrderInput } from "@/types/orders";
import { getSession } from 'next-auth/react';
import { getOrders, getOrderById, updateOrder } from "@/server/actions/orders";
import { EnrichedStockMovementView, StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { orderStatusSchema, StockMovement } from "@/server/db/schema";
import { getStockMovements } from "@/server/actions/getStockMovements";
import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { z } from "zod";
import { fetchCustomers } from "@/server/DB-Queries/customers-queries";


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

// Simplify the order details hook to work better with the store
// export function useOrderDetails(orderId: string | null) {
//   // const queryClient = useQueryClient();
//   const selectOrder = useOrdersStore(state => state.selectOrder);
//   const { selectedOrderData } = useOrdersStore();
//   return useQuery({
//     queryKey: ['order', orderId],
//     queryFn: async () => {
//       if (!orderId) return null;
      
      // const result = await getOrderById(orderId);
//       if (!result.success) {
//         throw new Error(result.error || 'Failed to fetch order');
//       }
      
//       // Use selectOrder instead of setSelectedOrderData to ensure consistent state
//       // This updates the store with fresh data while maintaining proper state transitions
//       selectOrder(orderId, result.data);
//       return result.data;
//     },
//     placeholderData: selectedOrderData,
//     enabled: !!orderId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//     retry: 1,
//     refetchOnWindowFocus: false
//   });
// }

// Completely refactored orders query for much better performance
// export function useOrdersQuery(params: OrdersQueryParams = {}) {
//   const queryClient = useQueryClient();
  
//   // Convert params to a stable string key to prevent unnecessary refetches
//   const stableQueryKey = useMemo(() => {
//     return [
//       'orders',
//       params.page || 1,
//       params.pageSize || 10,
//       JSON.stringify(params.filters || {}),
//       `${params.sort?.field || 'createdAt'}-${params.sort?.direction || 'desc'}`
//     ];
//   }, [params.page, params.pageSize, params.filters, params.sort]);

//   const query = useQuery({
//     queryKey: stableQueryKey,
//     queryFn: async () => {
//       const result = await getOrders(
//         params.page || 1,
//         params.pageSize || 10,
//         params.filters || {},
//         params.sort || { field: 'createdAt', direction: 'desc' }
//       );

//       if (!result.success) {
//         throw new Error(result.error || 'Failed to fetch orders');
//       }
      
//       return {
//         orders: result.data!.orders,
//         pagination: result.data!.pagination
//       };
//     },
//     refetchOnMount: false,
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//     placeholderData: keepPreviousData,
//   });

//   // Use a cleaner return pattern with more informative loading states
//   return {
//     data: query.data?.orders || [],
//     pagination: query.data?.pagination,
//     // Only show loading state for initial data load, not refetches
//     isInitialLoading: query.isLoading && query.fetchStatus === 'fetching' && !query.data,
//     // isFetching indicates any background loading (useful for subtle indicators)
//     isFetching: query.isFetching, 
//     // Add a status indicator for dev purposes
//     status: query.status,
//     fetchStatus: query.fetchStatus,
//     // Keep other states
//     isError: query.isError,
//     error: query.error,
//   };
// }

// Enhanced order update mutation that properly handles the cache



// export function useCustomers(enabled: boolean = true) {
//   return useQuery<EnrichedCustomer[]>({
//     queryKey: ['customers'],
//     queryFn: async () => {
//       const session = await getSession()
//       const res = await fetch('/api/customers', {
//         headers: {
//           'Authorization': `Bearer ${session}` // Include token in header
//         }
//       }); // Call API route
//       if (!res.ok) {
//         throw new Error('Failed to fetch customers');
//       }
//       return res.json();
//     },
//     refetchOnMount: false,
//     refetchOnWindowFocus: false,
//     staleTime: 100 * 100 * 100 * 100,
//     placeholderData: keepPreviousData,
//     enabled: enabled
//   });
// }
export function useCustomers(enabled: boolean = true) {
  return useQuery<EnrichedCustomer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      return await fetchCustomers()
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 100 * 100 * 100 * 100,
    placeholderData: keepPreviousData,
    enabled: enabled
  });
}
// export function useSelectCustomerList() {
//   return useQuery<CustomerList[]>({
//     queryKey: ['customersList'],
//     queryFn: async () => {
//       const session = await getSession()
//       const res = await fetch('/api/customers/list', {
//         headers: {
//           'Authorization': `Bearer ${session}` // Include token in header
//         }
//       }); // Call API route
//       if (!res.ok) {
//         throw new Error('Failed to fetch customers');
//       }
//       return res.json();
//     },
//     refetchOnMount: false,
//     refetchOnWindowFocus: false,
//     staleTime: 100 * 100 * 100 * 100,
//     placeholderData: keepPreviousData,
//   });
// }

// export function useItems() {
//   return useQuery<ItemSchemaType[]>({
//     queryKey: ['items'],
//     queryFn: async () => {
//       const session = await getSession();

//       const res = await fetch('/api/items', {
//         headers: {
//           'Authorization': `Bearer ${session}`
//         }
//       });
//       if (!res.ok) {
//         let errorResponse;
//         try {
//           errorResponse = await res.json();
//         } catch (jsonError) {
//           errorResponse = { message: 'Failed to parse error response as JSON', rawResponse: await res.text() };
//           console.error("JSON parsing error:", jsonError);
//         }
//         console.error("API error response:", errorResponse);
//         throw new Error(`Failed to fetch items. API Response: ${JSON.stringify(errorResponse)}`);
//       }
//       return res.json();
//     },
//     staleTime: 60 * 60 * 1000, // 5 minutes
//     // gcTime: 60 * 60 * 1000, // 30 minutes
//     refetchOnMount: true,
//     refetchOnWindowFocus: true,


//   });
// }

