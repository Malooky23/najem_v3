"use client"
import { useState, useEffect } from "react"
import { OrdersTable } from "./components/orders-table"
import { ordersColumns } from "./components/orders-columns"
import { OrderDetails } from "./components/order-details"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useOrders } from "@/hooks/data-fetcher"
import { type EnrichedOrders } from "@/types/orders"
import { CreateOrderDialog } from "./components/create-order-dialog"

export default function OrdersPage() {
  const { data, isLoading, error } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrders | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Close details view when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsDetailsOpen(false)
    }
  }, [isMobile])

  const handleOrderClick = (order: EnrichedOrders) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    if (isMobile) {
      setSelectedOrder(null)
    }
  }

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
        Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }
  console.log(isMobile)

  return (
    // <div className="p-2 mx-6 h-[calc(100vh-4rem)] h-[90vh] flex flex-col ">
    <div className="   px-4 h-[94vh]  overflow- flex flex-col   ">
      <div className="flex justify-between ">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <CreateOrderDialog isMobile={isMobile} />
      </div>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}

      <div className="flex gap-4 flex-1 min-h-0 ">
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
            selectedId={selectedOrder?.orderId}
            isCompact={isDetailsOpen || isMobile}
          />
        </div>

        {/* Details section - responsive */}
        {isDetailsOpen && (
          <div
            className={cn(
              "bg-white rounded-md border relative transition-all duration-300 flex-1 w-[100%] overflow-auto ",
              isMobile ? "fixed inset-0 z-50 m-0" : "w-[70%] "
            )}
          >
            <Button
              variant="default"
              size="icon"
              className={cn(
                "absolute right-2",
                isMobile ? "top-4" : "top-2"
              )}
              onClick={handleCloseDetails}
            >
              <X className="h-6 w-6" />
            </Button>

            <OrderDetails
              order={selectedOrder}
              isMobile={isMobile}
            />

          </div>
        )}
      </div>
    </div>
  )
}