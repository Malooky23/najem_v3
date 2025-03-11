"use client"

import { useCallback, useEffect, memo, useState, useRef } from "react"
import { useOrdersStore } from "@/stores/orders-store"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { EnrichedOrders, OrderSortField } from "@/types/orders"
import { useOrders, usePrefetchOrders } from "@/hooks/useOrdersManager"

import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface OrdersTableProps {
  isMobile: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry: () => void;
}

interface TablePaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onNextPageHover?: () => void;
}

// Memoized error component
const ErrorDisplay = memo<ErrorDisplayProps>(function ErrorDisplay({
  error,
  onRetry
}) {
  return (
    <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
      Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
      <button
        className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-800"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
});

// Memoized pagination component
const TablePagination = memo<TablePaginationProps>(function TablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  onNextPageHover
}) {
  return (
    <div className="p-2 flex w-full justify-center min-w-0">
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        selectedRows={0}
        onNextPageHover={onNextPageHover}
      />
    </div>
  );
});

// Status badge component
const StatusBadge = memo<{ status: string }>(function StatusBadge({ status }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  
  switch (status) {
    case "COMPLETED":
      variant = "default";
      break;
    case "PENDING":
      variant = "secondary";
      break;
    case "PROCESSING":
      variant = "outline";
      break;
    case "CANCELED":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant} className="capitalize">
      {status.toLowerCase().replace("_", " ")}
    </Badge>
  );
});

// Table row loading skeleton
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
  </TableRow>
);

export const OrdersTable = memo<OrdersTableProps>(function OrdersTable({
  isMobile,
  onLoadingChange
}) {
  const {
    page,
    pageSize,
    sortField,
    sortDirection,
    selectedOrderId,
    isDetailsOpen,
    setPage,
    setPageSize,
    setSort,
    selectOrder,
    getFilters,
    getSort,
  } = useOrdersStore();

  // Get filters and sort once per render
  const filters = getFilters();
  const sort = getSort();

  // Track previous state to avoid unnecessary actions
  const lastPageRef = useRef(page);

  // Fetch data
  const {
    data: orders,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useOrders({
    page,
    pageSize,
    filters,
    sort
  });

  // Create prefetch function for next page
  const prefetchNextPage = usePrefetchOrders({
    page: page + 1,
    pageSize,
    filters,
    sort
  });

  // Handle next page hover - prefetch data
  const handleNextPageHover = useCallback(() => {
    if (page < (pagination?.totalPages || 0)) {
      prefetchNextPage();
    }
  }, [page, pagination?.totalPages, prefetchNextPage]);

  // Track loading states
  useEffect(() => {
    onLoadingChange?.(isLoading || isFetching);
  }, [isLoading, isFetching, onLoadingChange]);

  // Scroll to top when page changes
  useEffect(() => {
    if (lastPageRef.current !== page) {
      window.scrollTo(0, 0);
      lastPageRef.current = page;
    }
  }, [page]);

  // Memoized callbacks
  const handleRowClick = useCallback((order: EnrichedOrders) => {
    selectOrder(selectedOrderId === order.orderId ? null : order.orderId);
  }, [selectedOrderId, selectOrder]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, [setPage]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
  }, [setPageSize]);

  const handleSortChange = useCallback((field: OrderSortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSort(field, newDirection);
  }, [sortField, sortDirection, setSort]);

  // Error handling
  if (isError) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  // Render optimized table
  return (
    <>
      <div className="flex-1 overflow-auto flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[100px] cursor-pointer"
                onClick={() => handleSortChange('orderNumber')}
              >
                <div className="flex items-center">
                  Order #
                  {sortField === 'orderNumber' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSortChange('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSortChange('createdAt')}
              >
                <div className="flex items-center">
                  Date
                  {sortField === 'createdAt' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Show loading skeletons
              Array(5).fill(0).map((_, index) => (
                <TableRowSkeleton key={`skeleton-${index}`} />
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              // Render orders
              orders.map((order: EnrichedOrders) => (
                <TableRow 
                  key={order.orderId}
                  className={cn(
                    "cursor-pointer",
                    selectedOrderId === order.orderId && "bg-slate-100"
                  )}
                  onClick={() => handleRowClick(order)}
                >
                  <TableCell className="font-medium">
                    #{order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {order.customerName}
                  </TableCell>
                  <TableCell>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onNextPageHover={handleNextPageHover}
        />
      )}
    </>
  );
});