'use client'

import {
    OrderSchemaType,
    CreateOrderSchemaType,
    UpdateOrderSchemaType,
    OrderFilters,
    OrderSort,
    EnrichedOrderSchemaType,
} from "@/types/orders";
import { Pagination, ApiResponse } from "@/types/common";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
// TODO: Replace these direct imports with service layer functions (e.g., from '@/server/services/orders-services')
//       similar to how useItems uses NEW-items-services.
import { fetchOrders, fetchOrderById, createOrderInDb, updateOrderInDb } from "@/server/queries/orders-queries";
import { createOrderExpenseSchemaType, orderExpenseSchemaType } from "@/types/expense";
import { createOrderExpense } from "@/server/services/order-services";

// --- Reusable Mutation Factory (Consider extracting to a shared utility) ---
// This is copied/adapted from useItems.ts. Ideally, it should live in a shared file.
function useMutationFactory<T, R>(
  mutationFn: (data: T) => Promise<ApiResponse<R>>,
  options?: {
    invalidateQueries?: (data: T) => (string | unknown[])[] // Allow complex query keys, now a function
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: T) => {
      const response = await mutationFn(data);
      if (!response.success) {
        // Include message from API response if available
        throw new Error(response.message || "Operation failed");
      }
      return response.data; // Return data on success
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries
      if (options?.invalidateQueries) {
        const queryKeysToInvalidate = options.invalidateQueries(variables); // Call the function to get query keys

        queryKeysToInvalidate.forEach(queryKey => {
          // Ensure queryKey is treated as an array for invalidation
          queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
        });
      }
      // Optional: Add success toast/notification here
    },
    onError: (error: Error) => {
      // Optional: Add error toast/notification here
      console.error("Mutation failed:", error.message);
      // Consider more specific error handling or user feedback
    }
  });
}

// --- Query Hook ---

export interface UseOrdersQueryParams {
  page?: number;
  pageSize?: number;
  filters?: OrderFilters;
  sort?: OrderSort;
  enabled?: boolean; // Allow disabling the query
}

export function useOrdersQuery({
    page = 1,
    pageSize = 20, // Default page size
    filters = {},
    sort = { field: 'orderNumber', direction: 'desc' }, // Default sort
    enabled = true, // Query is enabled by default
}: UseOrdersQueryParams = {}) {

  // Query key includes all parameters that affect the data
  const queryKey = ['orders', page, pageSize, filters, sort];

  // return useQuery<ApiResponse<{ orders: OrderSchemaType[], pagination: Pagination }>, Error, { orders: OrderSchemaType[], pagination: Pagination }>({
  return useQuery({
    queryKey: queryKey,
    queryFn: async () => { // queryFn returns the data shape
      // Call the server function to fetch ordersx
      const response = await fetchOrders(page, pageSize, filters, sort);
      return response 
    },
    enabled: enabled, // Control query execution
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new page/filters
    refetchOnWindowFocus: false, // Optional: Adjust as needed
  });
}

// --- Query Hook for Single Order ---
export function useOrderByIdQuery(orderId: string | null, options?: { enabled?: boolean }) {
  const queryKey = ['order', orderId];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!orderId) {
        // Should not happen if enabled is false when orderId is null
        throw new Error("Order ID is required to fetch details.");
      }
      const response = await fetchOrderById(orderId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch order details");
      }
      if (!response.data) {
        throw new Error("Order data not found in response.");
      }
      return response.data; // Return the EnrichedOrderSchemaType data directly
    },
    enabled: !!orderId && (options?.enabled ?? true), // Only enable if orderId is present and enabled option is true
    staleTime: 15 * 60 * 1000, // 15 minutes, details might not change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

// --- Mutation Hooks ---

export function useCreateOrder() {
  return useMutationFactory<CreateOrderSchemaType, EnrichedOrderSchemaType>(
    createOrderInDb,
    {
      // Invalidate the base 'orders' query key and potentially specific filtered views
      // A simple invalidation of ['orders'] might suffice if detailed filtering isn't critical after creation
      invalidateQueries:()=> [['orders']]
    }
  );
}

export function useUpdateOrder() {
  return useMutationFactory<UpdateOrderSchemaType, EnrichedOrderSchemaType>(
    updateOrderInDb,
    {
      // Invalidate the base 'orders' query key.
      // Also consider invalidating specific order detail queries if they exist (e.g., ['order', orderId])
      invalidateQueries: ()=> [['orders']]
      // TODO: Add optimistic updates if needed for better UX
    }
  );
}

// TODO: Add useDeleteOrder hook if needed


export function useCreateOrderExpense(){

  return useMutationFactory<createOrderExpenseSchemaType, orderExpenseSchemaType>(
    createOrderExpense,
      {
        invalidateQueries: (data) => [ [ 'orders', [ 'order', data[0].orderId ] ]]
      }
    );
  }