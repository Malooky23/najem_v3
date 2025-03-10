"use client";
import React, { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOrdersStore } from "@/stores/orders-store";
import { useOrdersQuery, useSelectCustomerList } from "@/hooks/data-fetcher";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderSort, OrderSortField } from "@/types/orders";
import { PageHeader } from "./components/PageHeader";
import  ContentLayout  from "./components/ContentLayout";
import { OrdersTable } from "./components/order-table/orders-table";
import { OrderDetails } from "./components/order-details/OrderDetails";
import { useUrlSync } from "@/hooks/useUrlSync";
import Loading from "@/components/ui/loading";
import { EnrichedOrders } from "@/types/orders";

// Main page component using Zustand for state
export default function OrdersPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const store = useOrdersStore();

  // Extract all state from store
  const {
    page,
    pageSize,
    sort,
    filters,
    selectedOrderId,
    isDetailsOpen,
    selectOrder,
    setPage,
    setPageSize,
    setSort,
    setFilter,
    resetFilters,
  } = store;

  // Data fetching with query params from store state
  const { data: orders, pagination, isInitialLoading, isFetching } = useOrdersQuery({
    page,
    pageSize,
    sort,
    filters,
  });

    const [temp, setTemp] = useState(false);

  // Setup URL synchronization
    useUrlSync(useOrdersStore, {
        syncedKeys: ['page', 'pageSize', 'sort', 'filters']
    });

    useEffect(() => {
        setTemp(t => !t); // force re-render
    }, []);

    const { data: customers, isLoading: isLoadingCustomers } = useSelectCustomerList();

    const handleStatusChange = useCallback((value: any) => setFilter('status', value), [setFilter]);
    const handleCustomerChange = useCallback((value: any) => setFilter('customerId', value), [setFilter]);
    const handleMovementChange = useCallback((value: any) => setFilter('movement', value), [setFilter]);
    const handleDateRangeChange = useCallback((from: Date | null, to: Date | null) => setFilter('dateRange', { from, to }), [setFilter]);


  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      <PageHeader
        isMobile={isMobile}
        isFetching={isFetching}
        customers={customers}
        isLoadingCustomers={isLoadingCustomers}
        onStatusChange={handleStatusChange}
        onCustomerChange={handleCustomerChange}
        onMovementChange={handleMovementChange}
        onDateRangeChange={handleDateRangeChange}
        onResetFilters={resetFilters}
        filters={filters}
      />

      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        <ContentLayout isMobile={isMobile} isDetailsOpen={isDetailsOpen}>
          <OrdersTable
            data={orders || []}
            selectedOrderId={selectedOrderId || undefined}
            isLoading={isInitialLoading}
            pagination={pagination}
            sort={sort}
            onRowClick={(order: EnrichedOrders) => selectOrder(order.orderId)}
            onSortChange={(newSort: { field: string, direction: 'asc' | 'desc' }) => setSort({field: newSort.field as OrderSortField, direction: newSort.direction})}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </ContentLayout>

        {isDetailsOpen && selectedOrderId && (
            <OrderDetails
              key={selectedOrderId}
              isMobile={isMobile}
              selectedOrderId={selectedOrderId}
              onClose={() => selectOrder(null)}
              orders={orders || []}
            />
        )}
      </div>
    </div>
  );
}