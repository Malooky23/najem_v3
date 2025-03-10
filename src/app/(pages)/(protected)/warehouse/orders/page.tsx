"use client";
import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOrdersStore } from "@/stores/orders-store";
import { useOrdersQuery } from "@/hooks/data-fetcher";
import { CreateOrderDialog } from "./components/order-form/create-order-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderSort } from "@/types/orders";

// Dynamically loaded components with loading fallbacks
const OrderFilters = dynamic(() => import('./components/order-filters/OrderFilters'), { 
  ssr: false,
  loading: () => <div className="h-12 animate-pulse bg-gray-100 rounded-md"></div>
});

const OrdersTable = dynamic(() => import('./components/order-table/OrdersTableContainer'), {
  ssr: false,
  loading: () => <div className="flex-1 animate-pulse bg-gray-100 rounded-md"></div>
});

const OrderDetails = dynamic(() => import('./components/order-details/OrderDetailsContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
});

// Main page component using Zustand for state
export default function OrdersPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const store = useOrdersStore();
  
  // Extract all state from store
  const { 
    page, pageSize, sort, filters,
    selectedOrderId, isDetailsOpen,
    selectOrder, setPage, setPageSize, 
    setSort, setFilter, resetFilters
  } = store;
  
  // Data fetching with query params from store state
  const {
    data: orders,
    pagination,
    isInitialLoading,
    isFetching
  } = useOrdersQuery({ page, pageSize, sort, filters });

  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      <div className="flex justify-between m-2">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <CreateOrderDialog isMobile={isMobile} />
      </div>
      
      <OrderFilters 
        status={filters.status || null}
        customerId={filters.customerId || null}
        movement={filters.movement || null}
        dateRange={filters.dateRange || null}
        isLoading={isFetching}
        onStatusChange={(value) => setFilter('status', value)}
        onCustomerChange={(value) => setFilter('customerId', value)}
        onMovementChange={(value) => setFilter('movement', value)}
        onDateRangeChange={(value) => setFilter('dateRange', value)}
        onResetFilters={resetFilters}
      />
      
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<div className="flex-1 animate-pulse bg-gray-100 rounded-md"></div>}>
          <OrdersTable 
            isDetailsOpen={isDetailsOpen}
            isMobile={isMobile}
            orders={orders || []}
            selectedOrderId={selectedOrderId}
            isLoading={isInitialLoading}
            pagination={pagination}
            sort={sort}
            onOrderClick={(order) => selectOrder(order.orderId)}
            onSortChange={setSort }
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </Suspense>
        
        {isDetailsOpen && selectedOrderId && (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>}>
            <OrderDetails
              isMobile={isMobile}
              selectedOrderId={selectedOrderId}
              onClose={() => selectOrder(null)}
              orders={orders || []}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}