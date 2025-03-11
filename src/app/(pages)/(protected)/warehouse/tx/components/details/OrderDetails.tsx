"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderHeader } from "./OrderHeader"
import { OrderInfoCard } from "./OrderInfoCard"
import { OrderItemsTable } from "./OrderItemsTable"
import { OrderNotesCard } from "./OrderNotesCard"
import { EnrichedOrders, OrderStatus } from "@/types/orders"

import { toast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface OrderDetailsProps {
  order: EnrichedOrders | null
  isMobile: boolean
  handleClose: () => void
  isLoading: boolean
}

export function OrderDetails({ 
  order, 
  isMobile, 
  handleClose, 
  isLoading 
}: OrderDetailsProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col overflow-auto">
        <div className="flex-none flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            <Skeleton className="h-6 w-32" />
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }
  
  // Show not found state
  if (!order) {
    return (
      <div className="h-full flex flex-col overflow-auto">
        <div className="flex-none flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Order Not Found</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center p-6 text-gray-500">
            <p>The requested order could not be found.</p>
            <p className="mt-2">It may have been deleted or the reference is invalid.</p>
          </div>
        </div>
      </div>
    )
  }

  // Safety check for order structure
  const hasValidOrderData = order && 
                          typeof order === 'object' && 
                          (order.orderId);

  if (!hasValidOrderData) {
    return (
      <div className="h-full flex flex-col overflow-auto">
        <div className="flex-none flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Invalid Order Data</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center p-6 text-gray-500">
            <p>The order data structure is invalid.</p>
            <p className="mt-2">Please contact support if this issue persists.</p>
          </div>
        </div>
      </div>
    );
  }

  // Display order details - uses your existing components
  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex-none flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Order Details</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Only render components when we have valid order data */}
        <OrderHeader 
          status={order.status}
          orderNumber={order.orderNumber.toString()}
          isLoading={isLoading}
          onClose={handleClose}
        />
        <OrderInfoCard order={order} />
        <OrderItemsTable order={order} />
        <OrderNotesCard order={order} />
      </div>
    </div>
  )
}