"use client"

import { useStockMovementContext } from "../../context/stock-movement-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useOrderDetails } from "@/hooks/data-fetcher"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useMemo, useCallback } from "react"

export function DetailsWrapper() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { selectedMovementId, setSelectedMovementId } = useStockMovementContext()
  
  const { 
    data: order, 
    isLoading, 
    isError 
  } = useOrderDetails(selectedMovementId)

  const handleClose = useCallback(() => {
    setSelectedMovementId(null)
  }, [setSelectedMovementId])

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <LoadingSpinner />
        </div>
      )
    }

    if (isError) {
      return (
        <div className="text-red-500 p-4">
          Error loading order details
        </div>
      )
    }

    if (!order) {
      return (
        <div className="text-gray-500 p-4">
          No order details available
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Order ID</label>
            <div>{order.orderId}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div>{order.status}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Customer</label>
            <div>{order.customerName}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date</label>
            <div>
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Items</h3>
            <div className="border rounded-md divide-y">
              {order.items.map((item: any) => (
                <div key={item.itemId} className="p-2 flex justify-between">
                  <span>{item.itemName}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.notes && (
          <div>
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <div className="mt-1 text-sm">{order.notes}</div>
          </div>
        )}
      </div>
    )
  }, [isLoading, isError, order])

  // Early return if no movement selected
  if (!selectedMovementId) return null

  return (
    <div
      className={cn(
        "bg-white rounded-md border relative transition-all duration-300 flex-1 overflow-auto",
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[60%]"
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
        <h2 className="text-lg font-semibold">
          Order Details
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        {content}
      </div>
    </div>
  )
}