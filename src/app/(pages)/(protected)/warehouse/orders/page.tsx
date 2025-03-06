"use client"
import { useEffect, useCallback, useState, useMemo, useTransition, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { OrdersTable } from "./components/order-table/orders-table"
import { ordersColumns } from "./components/order-table/orders-columns"
import { OrderDetails } from "./components/order-details/OrderDetails"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useOrderDetails, useOrdersQuery } from "@/hooks/data-fetcher"
import { type EnrichedOrders, type OrderSort, type OrderSortField, type OrderStatus, type MovementType } from "@/types/orders"
import { CreateOrderDialog } from "./components/order-form/create-order-dialog"
import { updateOrder } from "@/server/actions/orders"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { RowSelectionState } from "@tanstack/react-table"
import { OrderFilters } from "./components/order-filters/OrderFilters"
import { useDebounce } from "@/hooks/use-debounce" // Add this import

// Helper function to normalize dates to avoid timezone issues
function normalizeDate(dateString: string): Date {
  const date = new Date(dateString)
  // Set time to noon to avoid timezone issues
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
}

// Helper function to extract just the date portion of a date
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isPending, startTransition] = useTransition();

  // Get URL parameters with enhanced filter support
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 10
  const sortField = (searchParams.get('sort') || 'createdAt') as OrderSortField
  const sortDirection = (searchParams.get('direction') || 'desc') as 'asc' | 'desc'
  const status = searchParams.get('status') as OrderStatus | undefined
  const customerId = searchParams.get('customerId')
  const dateRangeFrom = searchParams.get('dateFrom')
  const dateRangeTo = searchParams.get('dateTo')
  const movement = searchParams.get('movement')

  // Local UI state for optimistic updates
  const [localStatus, setLocalStatus] = useState<OrderStatus | null>(status || null);
  const [localCustomerId, setLocalCustomerId] = useState<string | null>(customerId || null);
  const [localMovement, setLocalMovement] = useState<MovementType | null>((movement as MovementType) || null);
  const [localDateRange, setLocalDateRange] = useState<{ from: Date, to: Date } | null>(null);
  
  // Update local state when URL params change
  useEffect(() => {
    setLocalStatus(status || null);
    setLocalCustomerId(customerId || null);
    setLocalMovement((movement as MovementType) || null);
    
    if (dateRangeFrom && dateRangeTo) {
      setLocalDateRange({
        from: new Date(dateRangeFrom.split('T')[0]),
        to: new Date(dateRangeTo.split('T')[0])
      });
    } else {
      setLocalDateRange(null);
    }
  }, [status, customerId, movement, dateRangeFrom, dateRangeTo]);

  // Get orderId from URL for details view
  const selectedOrderId = searchParams.get('orderId')
  const isDetailsOpen = !!selectedOrderId

  const sort: OrderSort = {
    field: sortField,
    direction: sortDirection
  }

  const dateRange = useMemo(() =>
    dateRangeFrom && dateRangeTo ? {
      from: new Date(dateRangeFrom.split('T')[0]),
      to: new Date(dateRangeTo.split('T')[0])
    } : null,
    [dateRangeFrom, dateRangeTo]);

  // Add this to memoize filters construction
  const filters = useMemo(() => ({
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...(movement && { movement: movement as MovementType }),
    ...(dateRange && { dateRange })
  }), [status, customerId, movement, dateRange]);

  // Create debounced URL update function
  const debouncedUpdateUrl = useDebounce((params: string) => {
    router.replace(`?${params}`, { scroll: false });
  }, 10);

  const { data: orders, pagination, isLoading, error, invalidateOrders } = useOrdersQuery({
    page,
    pageSize,
    sort,
    filters
  })

  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const previousOrdersRef = useRef<EnrichedOrders[] | null>(null);

  // Store the current orders whenever they successfully load
  useEffect(() => {
    if (orders && !isLoading) {
      previousOrdersRef.current = orders;
      setIsLocalLoading(false);
    }
  }, [orders, isLoading]);

  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    // Set local loading state immediately
    setIsLocalLoading(true);
    
    // Apply the URL change with optimistic UI updates
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      
      // Update local state immediately for optimistic UI
      switch (key) {
        case 'status':
          setLocalStatus(value as OrderStatus | null);
          break;
        case 'customerId':
          setLocalCustomerId(value);
          break;
        case 'movement':
          setLocalMovement(value as MovementType | null);
          break;
        case 'dateFrom':
        case 'dateTo':
          // Handle date updates when both from and to are available
          if (key === 'dateFrom' && (value || params.has('dateTo'))) {
            const from = value ? new Date(value) : null;
            const toValue = params.get('dateTo');
            const to = toValue ? new Date(toValue) : null;
            if (from && to) {
              setLocalDateRange({ from, to });
            } else if (value === null && toValue === null) {
              setLocalDateRange(null);
            }
          }
          break;
      }
    });
    
    // Debounced URL update
    debouncedUpdateUrl(params.toString());
    
  }, [searchParams, debouncedUpdateUrl]);
  
  // Generic filter handler creator to reduce code duplication
  const createFilterHandler = useCallback((paramName: string) =>
    (value: any) => {
      updateUrlParams({ [paramName]: value || null, page: '1' })
    },
    [updateUrlParams]);

  const handleCloseDetails = useCallback(() => {
    updateUrlParams({ orderId: null })
  }, [updateUrlParams])

  const handleOrderClick = useCallback((order: EnrichedOrders) => {
    updateUrlParams({ orderId: order.orderId })
  }, [updateUrlParams])

  const handlePageChange = useCallback((newPage: number) => {
    setIsLocalLoading(true);
    updateUrlParams({ page: newPage.toString() })
  }, [updateUrlParams])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setIsLocalLoading(true);
    updateUrlParams({
      pageSize: newPageSize.toString(),
      page: '1' // Reset to first page when changing page size
    })
  }, [updateUrlParams])

  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    if (field !== sortField || direction !== sortDirection) {
      setIsLocalLoading(true);
      updateUrlParams({
        sort: field,
        direction: direction,
        page: '1' // Reset to first page when changing sort
      });
    }
  }, [sortField, sortDirection, updateUrlParams]);

  const handleStatusChange = createFilterHandler('status');
  const handleCustomerChange = createFilterHandler('customerId');
  const handleMovementChange = createFilterHandler('movement');

  // Update the date range handling to use YYYY-MM-DD strings only
  const handleDateRangeChange = useCallback((from: Date | null, to: Date | null) => {
    if (from && to) {
      // Update local state immediately for optimistic UI
      setLocalDateRange({ from, to });
      
      updateUrlParams({
        // Store only the date part (YYYY-MM-DD) to avoid timezone issues
        dateFrom: getDateString(from),
        dateTo: getDateString(to),
        page: '1'
      })
    } else {
      // Update local state immediately
      setLocalDateRange(null);
      
      updateUrlParams({
        dateFrom: null,
        dateTo: null,
        page: '1'
      })
    }
  }, [updateUrlParams])

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    // Update local state immediately
    setLocalStatus(null);
    setLocalCustomerId(null);
    setLocalMovement(null);
    setLocalDateRange(null);
    
    updateUrlParams({
      status: null,
      customerId: null,
      movement: null,
      dateFrom: null,
      dateTo: null,
      page: '1'
    })
  }, [updateUrlParams])

  const selectedOrder = useMemo(() =>
    orders?.find(order => order.orderId === selectedOrderId) ?? null,
    [orders, selectedOrderId]);

  const { data: orderDetails } = useOrderDetails(selectedOrderId, selectedOrder);
  const finalSelectedOrder = selectedOrder ?? orderDetails ?? null;

  // Display data - use previous data during loading for smoother transitions
  const displayOrders = isLocalLoading && previousOrdersRef.current ? previousOrdersRef.current : orders || [];


  const handleUpdateOrder = useCallback(async (updatedOrder: EnrichedOrders) => {
    try {
      // Optimistically update the UI
      if (selectedOrder && previousOrdersRef.current) {
        const updatedOrders = previousOrdersRef.current.map(order => 
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        );
        previousOrdersRef.current = updatedOrders;
      }
      
      const result = await updateOrder(updatedOrder)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update order')
      }

      await invalidateOrders()
      return result
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }, [invalidateOrders, selectedOrder]);

  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  // Optimize row selection handling
  const handleRowSelection = useCallback((selection: RowSelectionState) => {
    setSelectedRows(selection);
  }, []);

  // Memoize selected items calculation
  const selectedItems = useMemo(() =>
    Object.keys(selectedRows)
      .filter(key => selectedRows[key])
      .map(key => orders?.[parseInt(key)])
      .filter(Boolean),
    [selectedRows, orders]);

  // Clear selection when data changes significantly
  useEffect(() => {
    if (status || customerId || movement || dateRange) {
      setSelectedRows({});
    }
  }, [status, customerId, movement, dateRange]);

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
        Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }


  // Memoize OrderFilters props - now using local state for UI
  const orderFiltersProps = useMemo(() => ({
    status: localStatus,
    customerId: localCustomerId,
    movement: localMovement,
    dateRange: localDateRange,
    onStatusChange: handleStatusChange,
    onCustomerChange: handleCustomerChange,
    onMovementChange: handleMovementChange,
    onDateRangeChange: handleDateRangeChange,
    onResetFilters: handleResetFilters,
    isLoading: isLoading,
  }), [localStatus, localCustomerId, localMovement, localDateRange,
    handleStatusChange, handleCustomerChange, handleMovementChange,
    handleDateRangeChange, handleResetFilters, isLoading]);

  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">

      <div className="flex justify-between m-2">
        <h1 className="text-2xl font-bold text-gray-900 ">
          Orders
        </h1>
        <CreateOrderDialog isMobile={isMobile} />
      </div>

      <OrderFilters {...orderFiltersProps} />

      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Table section - responsive width */}
        <div
          className={cn(
            "flex flex-col rounded-md transition-all duration-300",
            isMobile ? (isDetailsOpen ? "hidden" : "w-full") : (isDetailsOpen ? "w-[40%]" : "w-full"),
          )}
        >
          <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200 ">
            <OrdersTable
              columns={ordersColumns}
              data={displayOrders}
              // isLoading={isLoading || isLocalLoading}
              isLoading={isLoading }
              onRowClick={handleOrderClick}
              selectedId={selectedOrderId || undefined}
              isCompact={isDetailsOpen || isMobile}
              onSort={handleSortChange}
              sortField={sortField}
              sortDirection={sortDirection}
              onRowSelectionChange={handleRowSelection}
              selectedRows={selectedRows}
            />
          </div>

          {pagination && (
            <div className="p-2 flex w-full justify-center min-w-0">
              <div className="">
                <PaginationControls
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  selectedRows={Object.keys(selectedRows).filter(key => selectedRows[key]).length}
                  // isLoading={isLocalLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Details section - responsive */}
        {isDetailsOpen && (
          <div
            className={cn(
              "bg-white rounded-md border relative transition-all duration-300 flex-1 w-[100%] overflow-auto",
              isMobile ? "fixed inset-0 z-50 m-0" : "w-[70%]"
            )}
          >
            <OrderDetails
              order={finalSelectedOrder}
              isMobile={isMobile}
              handleClose={handleCloseDetails}
              onSave={handleUpdateOrder}
            />
          </div>
        )}
      </div>
    </div>
  )
}