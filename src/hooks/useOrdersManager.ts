import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useTransition, useEffect, useState } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { OrderSort, OrderSortField, OrderStatus, MovementType, OrderFilters } from "@/types/orders";

// Completely refactored hook using a more efficient pattern
export function useOrdersManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const store = useOrdersStore();
  const [isPending, startTransition] = useTransition();

  // Get all parameters in one pass and memoize the result
  const params = useMemo(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    return {
      page: Number(urlParams.get('page')) || 1,
      pageSize: Number(urlParams.get('pageSize')) || 10,
      sortField: (urlParams.get('sort') || 'createdAt') as OrderSortField,
      sortDirection: (urlParams.get('direction') || 'desc') as 'asc' | 'desc',
      status: urlParams.get('status') as OrderStatus | null,
      customerId: urlParams.get('customerId'),
      dateFrom: urlParams.get('dateFrom'),
      dateTo: urlParams.get('dateTo'),
      movement: urlParams.get('movement') as MovementType | null,
      orderId: urlParams.get('orderId')
    };
  }, [searchParams]);

  // Synchronize URL and store
  useEffect(() => {
    if (params.orderId !== store.selectedOrderId) {
      store.setSelectedOrderId(params.orderId || null);
      store.setIsDetailsOpen(!!params.orderId);
    }
  }, [params.orderId, store]);

  // Batch URL updates to minimize route changes
  const navigateWithParams = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Use transitions to keep the UI responsive
    const newUrl = `${pathname}?${newParams.toString()}`;
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  }, [searchParams, pathname, router]);

  // Optimized sort and filters with proper memoization
  const sort = useMemo(() => ({
    field: params.sortField,
    direction: params.sortDirection
  }), [params.sortField, params.sortDirection]);

  const filters:OrderFilters = useMemo(() => {
    const result: OrderFilters = {};
    
    if (params.status) result.status = params.status;
    if (params.customerId) result.customerId = params.customerId;
    if (params.movement) result.movement = params.movement;
    
    if (params.dateFrom && params.dateTo) {
      result.dateRange = {
        from: new Date(params.dateFrom),
        to: new Date(params.dateTo)
      };
    }
    
    return Object.keys(result).length > 0 ? result : {};
  }, [params.status, params.customerId, params.movement, params.dateFrom, params.dateTo]);

  // Handle actions
  const handlePageChange = useCallback((page: number) => {
    navigateWithParams({ page: page.toString() });
  }, [navigateWithParams]);

  const handlePageSizeChange = useCallback((size: number) => {
    navigateWithParams({ pageSize: size.toString(), page: '1' });
  }, [navigateWithParams]);

  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    navigateWithParams({ sort: field, direction, page: '1' });
  }, [navigateWithParams]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    navigateWithParams({ [key]: value || null, page: '1' });
  }, [navigateWithParams]);

  const handleDateRangeChange = useCallback((from: Date | null, to: Date | null) => {
    navigateWithParams({
      dateFrom: from ? from.toISOString() : null,
      dateTo: to ? to.toISOString() : null,
      page: '1'
    });
  }, [navigateWithParams]);

  const handleResetFilters = useCallback(() => {
    navigateWithParams({
      status: null,
      customerId: null,
      movement: null,
      dateFrom: null,
      dateTo: null,
      page: '1'
    });
  }, [navigateWithParams]);

  const selectOrder = useCallback((orderId: string | null) => {
    navigateWithParams({ orderId: orderId || null });
  }, [navigateWithParams]);

  // Return a clean API
  return {
    // Pagination state
    page: params.page,
    pageSize: params.pageSize,
    
    // Sort & filter state
    sort,
    filters,
    
    // Selected order
    selectedOrderId: params.orderId,
    
    // Actions
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterChange,
    handleDateRangeChange,
    handleResetFilters,
    selectOrder,
    
    // UI state
    isPending
  };
}