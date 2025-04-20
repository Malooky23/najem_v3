"use client"

import { useCallback, useEffect, memo, useState, useRef } from "react"
import { useOrdersStore } from "@/stores/orders-store"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { EnrichedOrders, EnrichedOrderSchemaType, OrderSortField } from "@/types/orders"
import { useOrdersQuery } from "@/hooks/data/useOrders"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"

interface OrdersTableProps {
  isMobile: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry: () => void;
}

interface TablePaginationProps {
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onNextPageHover?: () => void;
  isLoading?: boolean

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
  onNextPageHover,
  isLoading
}) {
  return (
    <div className="p-2 flex w-full justify-center min-w-0">
      <PaginationControls
        currentPage={pagination?.currentPage}
        totalPages={pagination?.totalPages}
        pageSize={pagination?.pageSize}
        total={pagination?.total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        selectedRows={0}
        onNextPageHover={onNextPageHover}
        isLoading={isLoading}
      />
    </div>
  );
});



const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block"
    const statuses: { [ key: string ]: string } = {
      "DRAFT": "bg-gray-500/20 text-gray-700",
      "PENDING": "bg-yellow-500/20 text-yellow-700",
      "PROCESSING": "bg-blue-500/20 text-blue-700",
      "COMPLETED": "bg-green-500/20 text-green-700",
      "READY": "bg-purple-500/20 text-purple-700",
      "CANCELLED": "bg-red-500/20 text-red-700",
    }
    return `${baseStyles} ${statuses[ status ] || statuses[ "PENDING" ]}`
  }

  return (
    <div className="flex items-center  w-full">
      <span className={getStatusStyles(status)}>{status}</span>
    </div>
  )
}

// Table row loading skeleton
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell>
    {/* <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell> */}
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
    selectedOrderData,
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
    data,
    // pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useOrdersQuery({
    page,
    pageSize,
    filters,
    sort
  });


  // Create prefetch function for next page
  // const prefetchNextPage = usePrefetchOrders({
  //   page: page + 1,
  //   pageSize,
  //   filters,
  //   sort
  // });

  // // Handle next page hover - prefetch data
  // const handleNextPageHover = useCallback(() => {
  //   if (page < (pagination?.totalPages || 0)) {
  //     prefetchNextPage();
  //   }
  // }, [page, pagination?.totalPages, prefetchNextPage]);

  // Track loading states
  useEffect(() => {
    onLoadingChange?.(isLoading || isFetching);
  }, [ isLoading, isFetching, onLoadingChange ]);

  // Scroll to top when page changes
  useEffect(() => {
    if (lastPageRef.current !== page) {
      window.scrollTo(0, 0);
      lastPageRef.current = page;
    }
  }, [ page ]);

  // Memoized callbacks
  const handleRowClick = useCallback((order: EnrichedOrderSchemaType) => {
    selectOrder(selectedOrderId === order.orderId ? null : order.orderId, order);
  }, [ selectedOrderId, selectOrder ]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, [ setPage ]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
  }, [ setPageSize ]);

  const handleSortChange = useCallback((field: OrderSortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSort(field, newDirection);
  }, [ sortField, sortDirection, setSort ]);

  // Error handling
  if (isError) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }


  if (!isLoading && !isFetching && (!data || data.orders.length === 0)) {
      return (
        <Alert>
          Error with data. E1337
        </Alert>
      )

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
            {isLoading || isFetching ? (
              // <TableBody>
              Array(20).fill(0).map((_, index) => (
                <TableRowSkeleton key={`skeleton-${index}`} />
              ))
              // </TableBody>
            ) : !data || data.orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              // Render orders

              data?.orders.map((order) => ( // Use EnrichedOrderSchemaType if that's what the hook returns
                <TableRow
                  key={order.orderId}
                  className={cn(
                    "cursor-pointer",
                    selectedOrderId === order.orderId && "bg-slate-100",
                    " hover:outline-amber-400 hover:outline hover:bg-white-200/60"
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

      <TablePagination
        pagination={data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        // onNextPageHover={handleNextPageHover} // Removed prefetching
        isLoading={isFetching}
      />

    </>
  );
});