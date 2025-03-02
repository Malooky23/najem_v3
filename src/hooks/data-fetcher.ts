'use client';
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ItemSchemaType } from "@/types/items";
import { EnrichedCustomer } from "@/types/customer";
import { EnrichedOrders, type OrderFilters, type OrderSort } from "@/types/orders";
import { getSession } from 'next-auth/react';
import { getOrders, getOrderById } from "@/server/actions/orders";
import { getStockMovements } from "@/server/actions/actn_stockMovements";
import { EnrichedStockMovementView, StockMovementFilters, StockMovementSort } from "@/types/stockMovement";
import { StockMovement } from "@/server/db/schema";


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

export function useOrderDetails(
  orderId: string | null,
  selectedOrder: any | null = null // add parameter

) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const result = await getOrderById(orderId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order');
      }
      return result.data;
    },
    enabled: !!orderId && selectedOrder === null, // add condition
    // placeholderData: () => {
    //   const orders = queryClient.getQueryData(['orders']) as EnrichedOrders[];
    //   return orders?.find((order:EnrichedOrders) => order.orderId === orderId) || null ;

    //   // Use the smaller/preview version of the blogPost from the 'blogPosts'
    //   // query as the placeholder data for this blogPost query
    //   // return queryClient
    //   //   .getQueryData(['orders'])?.find((d) => d.orderId === orderId)
    //   },

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
    staleTime: 60 * 60 * 1, 
    placeholderData: keepPreviousData,
    
  });

  const invalidateOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
      queryClient.invalidateQueries({ queryKey: ['items'] })
    ]);
    
    return Promise.all([
      query.refetch(),
      queryClient.refetchQueries({ queryKey: ['items'] })
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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false, 

    
  });
}


export interface StockMovementsQueryParams {
  page?: number;
  pageSize?: number;
  filters?: StockMovementFilters;
  sort?: StockMovementSort;
}
export interface StockMovementsQueryResult {
  data: EnrichedStockMovementView[];
  pagination: {
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}


export function useStockMovements(params: StockMovementsQueryParams = {}) {
  const queryClient = useQueryClient();
  
  const query = useQuery<StockMovementsQueryResult>({
    queryKey: ['stockMovements', params],
    queryFn: async () => {
      // await new Promise((resolve) => setTimeout(resolve, 3000))
      const result = await getStockMovements(
        params.page || 1,
        params.pageSize || 10,
        params.filters || {},
        params.sort || { field: 'createdAt', direction: 'desc' }
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stock Movements, no success');
      }
      if (!result.data) {
        throw new Error('Failed to fetch stock Movements, no data');
      }

      return {
        data: result.data.data,
        pagination: result.data.pagination
      };
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1, 
    // placeholderData: keepPreviousData,
    refetchInterval: 1000 * 10,
    refetchOnReconnect: true,
    retry: 1
    
  });

  const invalidateOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
      queryClient.invalidateQueries({ queryKey: ['items'] })
    ]);
    
    return Promise.all([
      query.refetch(),
      queryClient.refetchQueries({ queryKey: ['items'] })
    ]);
  };
  return {
    ...query,
    invalidateOrders,
    data: query.data?.data || [],
    pagination: query.data?.pagination
  };
}