'use client';
import { keepPreviousData, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { type ItemSchemaType } from "@/types/items";
import { CustomerList, EnrichedCustomer } from "@/types/customer";
import { EnrichedOrders, type OrderFilters, type OrderSort, OrderStatus, UpdateOrderInput } from "@/types/orders";
import { getSession } from 'next-auth/react';
import { getOrders, getOrderById, updateOrder } from "@/server/actions/orders";
import { EnrichedStockMovementView, StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { StockMovement } from "@/server/db/schema";
import { getStockMovements } from "@/server/actions/getStockMovements";
import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useOrdersStore } from "@/stores/orders-store";


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
export function useOrderDetails(orderId: string | null) {
  const queryClient = useQueryClient();
  const selectOrder = useOrdersStore(state => state.selectOrder);
  const { selectedOrderData } = useOrdersStore();
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const result = await getOrderById(orderId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order');
      }
      
      // Use selectOrder instead of setSelectedOrderData to ensure consistent state
      // This updates the store with fresh data while maintaining proper state transitions
      selectOrder(orderId, result.data);
      return result.data;
    },
    initialData: selectedOrderData,
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
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

// Add a new mutation for updating the entire order
export function useOrderUpdateMutation() {
  const queryClient = useQueryClient();
  
  return useMutation<
    OrderUpdateResult,
    Error,
    UpdateOrderInput,
    { previousData: EnrichedOrders | undefined }
  >({
    mutationFn: async (updatedOrder) => {
      // Call the API to update the order
      const result = await updateOrder(updatedOrder);
      return result;
    },
    
    // Optimistically update UI
    onMutate: async (updatedOrder) => {
      const orderId = updatedOrder.orderId;
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<EnrichedOrders>(['order', orderId]);
      
      // Optimistically update the cache with new values
      if (previousData) {
        queryClient.setQueryData<EnrichedOrders>(['order', orderId], {
          ...previousData,
          ...updatedOrder, 
          // Preserve fields that are not updated
          createdAt: previousData.createdAt,
          customerName: previousData.customerName,
          creator: previousData.creator,
          // Items must be properly preserved because they're needed for rendering
          items: updatedOrder.items 
            ? updatedOrder.items.map(item => ({
                itemId: item.itemId,
                itemName: previousData.items.find(i => i.itemId === item.itemId)?.itemName || "Unknown Item",
                quantity: item.quantity,
                itemLocationId: item.itemLocationId
              }))
            : previousData.items
        });
      }
      
      return { previousData };
    },
    
    // Handle errors and revert optimistic update
    onError: (err, updatedOrder, context) => {
      console.error('Error updating order:', err);
      
      if (context?.previousData && updatedOrder.orderId) {
        // Revert the optimistic update
        queryClient.setQueryData(['order', updatedOrder.orderId], context.previousData);
      }
    },
    
    // Refresh data after mutation
    onSettled: (result, error, updatedOrder) => {
      if (updatedOrder.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.orderId] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        // Also invalidate items and stock movements as they may be affected
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      }
    }
  });
}

export function useCustomers(enabled: boolean = true) {
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
    enabled: enabled
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

