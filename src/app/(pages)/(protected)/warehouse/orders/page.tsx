"use client";
import React, { memo } from "react";
import dynamic from 'next/dynamic';
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOrdersStore } from "@/stores/orders-store";
import { useOrdersQuery } from "@/hooks/data-fetcher";
import { useOrdersManager } from "@/hooks/useOrdersManager";
import { CreateOrderDialog } from "./components/order-form/create-order-dialog";

// Split the page into smaller dynamic components for better performance
const OrderFilters = dynamic(() => import('./components/order-filters/OrderFilters'), { 
  ssr: false,
  loading: () => <div className="h-12 animate-pulse bg-gray-100 rounded-md"></div>
});

const OrdersTable = dynamic(() => import('./components/order-table/OrdersTableContainer'), {
  ssr: false,
  loading: () => <div className="flex-1 animate-pulse bg-gray-100 rounded-md"></div>
});

const OrderDetails = dynamic(() => import('./components/order-details/OrderDetailsContainer'), {
  ssr: false 
});



// Simple header component
const PageHeader = memo(function PageHeader({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="flex justify-between m-2">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <CreateOrderDialog isMobile={isMobile} />
    </div>
  );
});

// Main page component is now very lean
export default function OrdersPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const store = useOrdersStore();
  
  // Get all the manager state & actions
  const {
    page,
    pageSize,
    sort,
    filters,
    selectedOrderId,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterChange,
    handleDateRangeChange,
    handleResetFilters,
    selectOrder,
    isPending
  } = useOrdersManager();

  // Data fetching with optimized query - now with better loading states
  const {
    data: orders,
    pagination,
    isInitialLoading, // Only true for initial load with no data
    isFetching,      // True for any background loading
    updateOrder,
    isUpdating,
  } = useOrdersQuery({ page, pageSize, sort, filters });

  // Only show loading on initial data load, not on refetches
  const showTableLoading = isInitialLoading; 
  
  // Subtle loading indication for filters
  const showFilterLoading = isFetching && isPending;

  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      <PageHeader isMobile={isMobile} />
      
      <OrderFilters 
        status={filters.status || null}
        customerId={filters.customerId || null}
        movement={filters.movement || null}
        dateRange={filters.dateRange || null}
        isLoading={showFilterLoading}
        onStatusChange={(value) => handleFilterChange('status', value)}
        onCustomerChange={(value) => handleFilterChange('customerId', value)}
        onMovementChange={(value) => handleFilterChange('movement', value)}
        onDateRangeChange={handleDateRangeChange}
        onResetFilters={handleResetFilters}
      />
      
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        <OrdersTable 
          isDetailsOpen={store.isDetailsOpen}
          isMobile={isMobile}
          orders={orders || []}
          selectedOrderId={selectedOrderId}
          isLoading={showTableLoading} // Only show loading when truly needed
          isFetching={isFetching}     // Pass fetching state for subtle indicators
          pagination={pagination}
          sort={sort}
          onOrderClick={(order) => selectOrder(order.orderId)}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
        
        {store.isDetailsOpen && (
          <OrderDetails
            isMobile={isMobile}
            selectedOrderId={selectedOrderId}
            onClose={() => selectOrder(null)}
            onSave={updateOrder}
            isUpdating={isUpdating}
            orders={orders}
          />
        )}
      </div>
    </div>
  );
}