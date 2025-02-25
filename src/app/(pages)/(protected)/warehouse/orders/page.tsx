"use client"
import { useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { OrdersTable } from "./components/order-table/orders-table"
import { ordersColumns } from "./components/order-table/orders-columns"
import { OrderDetails } from "./components/order-details/OrderDetails"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useOrdersQuery } from "@/hooks/data-fetcher"
import { type EnrichedOrders } from "@/types/orders"
import { CreateOrderDialog } from "./components/order-form/create-order-dialog"
import { updateOrder } from "@/server/actions/orders"

export default function OrdersPage() {
  const { data, isLoading, error, invalidateOrders } = useOrdersQuery()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 950px)")

  // Get orderId from URL
  const selectedOrderId = searchParams.get('orderId')
  const selectedOrder = data?.find(order => order.orderId === selectedOrderId) ?? null
  const isDetailsOpen = !!selectedOrderId

  const handleCloseDetails = useCallback(() => {
    // Remove orderId from URL
    const params = new URLSearchParams(searchParams)
    params.delete('orderId')
    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  const handleOrderClick = useCallback((order: EnrichedOrders) => {
    // Update URL with selected order ID
    const params = new URLSearchParams(searchParams)
    params.set('orderId', order.orderId)
    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  const handleUpdateOrder = async (updatedOrder: EnrichedOrders) => {
    try {
      const result = await updateOrder(updatedOrder)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update order')
      }
      
      // Refresh the orders list
      await invalidateOrders()
      
      return result
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  // Validate orderId exists in data
  useEffect(() => {
    if (selectedOrderId && data && !data.some(order => order.orderId === selectedOrderId)) {
      // If the orderId doesn't exist in the data, remove it from URL
      handleCloseDetails()
    }
  }, [data, selectedOrderId, handleCloseDetails])

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
        Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div className="px-4 h-[94vh] flex flex-col">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-900 pt-2">Orders</h1>
        <CreateOrderDialog isMobile={isMobile} />
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Table section - responsive width */}
        <div
          className={cn(
            "flex flex-col rounded-md transition-all duration-300",
            isMobile ? (isDetailsOpen ? "hidden" : "w-full") : (isDetailsOpen ? "w-[30%]" : "w-full"),
            "overflow-hidden"
          )}
        >
          <OrdersTable
            columns={ordersColumns}
            data={data || []}
            isLoading={isLoading}
            onRowClick={handleOrderClick}
            selectedId={selectedOrderId || undefined}
            isCompact={isDetailsOpen || isMobile}
          />
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
              order={selectedOrder}
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