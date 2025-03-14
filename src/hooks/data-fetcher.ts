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

// Add utility functions for localStorage management
export const LOCAL_STORAGE_PREFIX = 'najem_cache_';

// Safe localStorage helpers with error handling
export const getFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    // Clear item if saving failed (e.g. due to size limits)
    try { localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${key}`); } catch {}
  }
};

// Improved localStorage helper to be used safely during initialization
export const getSavedData = <T>(key: string): T | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : undefined;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return undefined;
  }
};

// Simplify the order details hook to work better with the store
export function useOrderDetails(orderId: string | null) {
  const queryClient = useQueryClient();
  const selectOrder = useOrdersStore(state => state.selectOrder);
  const { selectedOrderData } = useOrdersStore();
  const storageKey = `order_${orderId}`;
  
  // Initialize with localStorage data immediately
  const [cachedData] = useState<EnrichedOrders | undefined>(() => {
    if (!orderId) return undefined;
    return getSavedData<EnrichedOrders>(storageKey);
  });
  
  // Use the best available initial data
  const initialData = useMemo(() => {
    return selectedOrderData || cachedData || undefined;
  }, [selectedOrderData, cachedData]);
  
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const result = await getOrderById(orderId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order');
      }
      
      // Save successful result to localStorage
      saveToStorage(storageKey, result.data);
      
      // Update store with fresh data
      selectOrder(orderId, result.data);
      return result.data;
    },
    initialData: initialData,
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

  // Create a stable storage key
  const storageKey = useMemo(() => {
    return `orders_list_${params.page || 1}_${params.pageSize || 10}_${JSON.stringify(params.filters || {})}_${params.sort?.field || 'createdAt'}-${params.sort?.direction || 'desc'}`;
  }, [params.page, params.pageSize, params.filters, params.sort]);
  
  // Initialize with localStorage data immediately
  const [cachedData] = useState<OrdersQueryResult | undefined>(() => {
    return getSavedData<OrdersQueryResult>(storageKey);
  });

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
      
      const data = {
        orders: result.data!.orders,
        pagination: result.data!.pagination
      };
      
      // Save successful result to localStorage
      saveToStorage(storageKey, data);
      
      return data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // placeholderData: cachedData || keepPreviousData,
    initialData: cachedData || undefined,
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
      console.log("settled")
      console.log("Updated Order", updatedOrder)
      queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Also invalidate items and stock movements as they may be affected
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });

      if (updatedOrder.orderId) {
        console.log("settled")
      }
    }
  });
}

export function useCustomers(enabled: boolean = true) {
  const storageKey = 'customers_list';
  
  // Initialize with localStorage data immediately
  const [initialData] = useState<EnrichedCustomer[] | undefined>(() => {
    return getSavedData<EnrichedCustomer[]>(storageKey);
  });
  
  const queryFn = useCallback(async () => {
    const session = await getSession();
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      const res = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${session}`
        },
        signal
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await res.json();
      
      if (!signal.aborted) {
        saveToStorage(storageKey, data);
      }
      return data;
    } catch (error) {
      if (signal.aborted) {
        return initialData || [];
      }
      throw error;
    }
  }, [initialData]);
  
  return useQuery<EnrichedCustomer[]>({
    queryKey: ['customers'],
    queryFn,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: enabled
  });
}

export function useSelectCustomerList() {
  const storageKey = 'customers_select_list';
  
  // Initialize with localStorage data immediately
  const [initialData] = useState<CustomerList[] | undefined>(() => {
    return getSavedData<CustomerList[]>(storageKey);
  });
  
  const queryFn = useCallback(async () => {
    const session = await getSession();
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      const res = await fetch('/api/customers/list', {
        headers: {
          'Authorization': `Bearer ${session}`
        },
        signal
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch customers list');
      }
      
      const data = await res.json();
      
      if (!signal.aborted) {
        saveToStorage(storageKey, data);
      }
      return data;
    } catch (error) {
      if (signal.aborted) {
        return initialData || [];
      }
      throw error;
    }
  }, [initialData]);
  
  return useQuery<CustomerList[]>({
    queryKey: ['customersList'],
    queryFn,
    initialData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}

export function useItems() {
  const storageKey = 'items_list';
  
  // Initialize with localStorage data right away (but only on client)
  // This ensures we have data for the first render if available
  const [initialData] = useState<ItemSchemaType[] | undefined>(() => {
    // This runs once during component initialization
    return getSavedData<ItemSchemaType[]>(storageKey);
  });
  
  const queryFn = useCallback(async () => {
    const session = await getSession();
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      const res = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${session}`
        },
        signal
      });
      
      if (!res.ok) {
        let errorResponse;
        try {
          errorResponse = await res.json();
        } catch (jsonError) {
          errorResponse = { message: 'Failed to parse error response', rawResponse: await res.text() };
        }
        throw new Error(`Failed to fetch items: ${JSON.stringify(errorResponse)}`);
      }
      
      const data = await res.json();
      
      // Only save to storage if the component is still mounted
      if (!signal.aborted) {
        saveToStorage(storageKey, data);
      }
      return data;
    } catch (error) {
      if (signal.aborted) {
        return initialData || [];
      }
      throw error;
    }
  }, [initialData]);

  return useQuery<ItemSchemaType[]>({
    queryKey: ['items'],
    queryFn,
    initialData,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
}

