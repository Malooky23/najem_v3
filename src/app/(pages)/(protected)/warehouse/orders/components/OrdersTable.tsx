"use client"

import { useCallback, useEffect, memo, useState, useRef, Key } from "react"
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
import { ArrowDown, ArrowDownLeft, ArrowUp, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { OrderTableRow } from "./OrderTableRow"
import { OrdersState } from "@/stores/orders-store"
import { useShallow } from "zustand/shallow"

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

interface TableRowSkeletonProps{
  colSpan: number
}
// Table row loading skeleton
const TableRowSkeleton = ({ colSpan }: TableRowSkeletonProps ) => (
  <TableRow>
    <TableCell colSpan={colSpan}><Skeleton className="h-6 w-full" /></TableCell>
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
    // selectedOrderData,
    // isDetailsOpen,
    setPage,
    setPageSize,
    setSort,
    selectOrder,
    getFilters,
    getSort,
  } = useOrdersStore(
      useShallow((state: OrdersState)  => ({
        page: state.page,
        pageSize: state.pageSize,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        selectedOrderId: state.selectedOrderId,
        setPage: state.setPage,
        setPageSize: state.setPageSize,
        setSort: state.setSort,
        selectOrder: state.selectOrder,
        getFilters: state.getFilters, // Assuming these are stable or memoized in the store
        getSort: state.getSort,       // Assuming these are stable or memoized in the store
      }),
    ));


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
              <TableHead>
                <div className="flex justify-center">
                  <ArrowUp className="text-red-500 h-4 w-4" /><ArrowDown className="h-4 w-4 text-green-500" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSortChange('status')}
              >
                <div className="flex justify-center text-center items-center">
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
          {/* <TableBody>
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
                  <TableCell className="font-medium  w-[2px]">
                    <Badge className={cn("w-16 flex justify-center text-center",
                      // "px-2 py-1 rounded-full text-xs font-semibold ",
                      order.movement === "IN" ? " bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                      {order.movement === "IN" ? <ArrowDownLeft className="w-4 h-4 text-green-500" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                      {order.movement}
                    </Badge>
                  </TableCell>
                  <TableCell className="">
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
          </TableBody> */}
          <TableBody>
            {isLoading || isFetching ? (
              Array(pageSize).fill(0).map((_, index) => ( // Show skeletons based on pageSize
                <TableRowSkeleton colSpan={Number(pageSize)} key={`skeleton-${index}`} />
              ))
            ) : (
              data?.orders.map((order) => (
                <OrderTableRow
                  key={order.orderId} // Key is still needed here for map
                  order={order}
                  isSelected={selectedOrderId === order.orderId}
                  onClick={handleRowClick} // Pass the memoized callback
                />
              ))
            )}
          </TableBody>
        </Table>

      </div >

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