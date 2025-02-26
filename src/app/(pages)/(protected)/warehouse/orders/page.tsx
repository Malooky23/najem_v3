"use client"
import { useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { OrdersTable } from "./components/order-table/orders-table"
import { ordersColumns } from "./components/order-table/orders-columns"
import { OrderDetails } from "./components/order-details/OrderDetails"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useOrderDetails, useOrdersQuery } from "@/hooks/data-fetcher"
import { type EnrichedOrders, type OrderSort, type OrderSortField, type OrderStatus } from "@/types/orders"
import { CreateOrderDialog } from "./components/order-form/create-order-dialog"
import { updateOrder } from "@/server/actions/orders"
import { PaginationControls } from "@/components/ui/pagination-controls"

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Get URL parameters
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 10
  const sortField = (searchParams.get('sort') || 'createdAt') as OrderSortField
  const sortDirection = (searchParams.get('direction') || 'desc') as 'asc' | 'desc'

  // Get orderId from URL for details view
  const selectedOrderId = searchParams.get('orderId')
  const isDetailsOpen = !!selectedOrderId

  const sort: OrderSort = {
    field: sortField,
    direction: sortDirection
  }

  const { data: orders, pagination, isLoading, error, invalidateOrders } = useOrdersQuery({
    page,
    pageSize,
    sort
  })

  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.replace(`?${params.toString()}`)
  }, [searchParams, router])

  const handleCloseDetails = useCallback(() => {
    updateUrlParams({ orderId: null })
  }, [updateUrlParams])

  const handleOrderClick = useCallback((order: EnrichedOrders) => {
    updateUrlParams({ orderId: order.orderId })
  }, [updateUrlParams])

  const handlePageChange = useCallback((newPage: number) => {
    updateUrlParams({ page: newPage.toString() })
  }, [updateUrlParams])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    updateUrlParams({
      pageSize: newPageSize.toString(),
      page: '1' // Reset to first page when changing page size
    })
  }, [updateUrlParams])

  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    updateUrlParams({
      sort: field,
      direction: direction
    })
  }, [updateUrlParams])

  const handleUpdateOrder = async (updatedOrder: EnrichedOrders) => {
    try {
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
  }

  // Close details view when switching to mobile
  useEffect(() => {
    if (isMobile && selectedOrderId) {
      handleCloseDetails()
    }
  }, [isMobile, selectedOrderId, handleCloseDetails])

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
        Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  // const selectedOrder = orders?.find(order => order.orderId === selectedOrderId) ?? null
  // const { data: orderDetails } = useOrderDetails(selectedOrderId, {
  //   enabled: selectedOrder === null // Only fetch if selectedOrder is null
  // })
  const selectedOrder = orders?.find(order => order.orderId === selectedOrderId) ?? null
  const {data: orderDetails} = useOrderDetails(selectedOrderId, selectedOrder)
    
  const finalSelectedOrder = selectedOrder ?? orderDetails ?? null

  useEffect(() => {
    if (pagination?.totalPages && page > pagination.totalPages) {
      updateUrlParams({page: pagination.totalPages.toString()})
    }
  }, [page, pagination?.totalPages, updateUrlParams])

  return (
    <div className="px-4 h-[94vh] flex flex-col">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <CreateOrderDialog isMobile={isMobile} />
      </div>

      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Table section - responsive width */}
        <div
          className={cn(
            "flex flex-col rounded-md transition-all duration-300",
            isMobile ? (isDetailsOpen ? "hidden" : "w-full") : (isDetailsOpen ? "w-[30%]" : "w-full"),
          )}
        >
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <OrdersTable
              columns={ordersColumns}
              data={orders || []}
              isLoading={isLoading}
              onRowClick={handleOrderClick}
              selectedId={selectedOrderId || undefined}
              isCompact={isDetailsOpen || isMobile}
              onSort={handleSortChange}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </div>

          {pagination && (
            <div className="py-4 flex justify-center bg-white border-t">
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
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