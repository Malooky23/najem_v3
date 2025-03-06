"use client"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { OrderDetails } from "./details/OrderDetails"
import { useOrderDetails } from "@/hooks/data-fetcher"
import { useStockMovementStore } from "@/stores/stock-movement-store"
import { useGetMovementById } from "@/hooks/useGetMovementById"

interface DetailsPanelProps {
  isMobile: boolean
}

export function DetailsPanel({ isMobile }: DetailsPanelProps) {
  // Get state from store
  const { selectedMovementId, selectMovement } = useStockMovementStore()
  
  // Fetch only the specific movement we need
  const { data: movement, isLoading: movementLoading } = useGetMovementById(selectedMovementId)
  
  // Get referenceId from the movement
  const referenceId = useMemo(() => {
    if (!movement) return null
    return movement.referenceId || null
  }, [movement])
  
  // Fetch order details with the reference ID
  const { data: order, isLoading: orderLoading } = useOrderDetails(referenceId)
  
  // Handler for closing the panel
  const handleClose = () => selectMovement(null)
  
  return (
    <div className={cn(
      "bg-white rounded-md border relative transition-all duration-300 flex-1 w-[100%] overflow-auto",
      isMobile ? "fixed inset-0 z-50 m-0" : "w-[70%]"
    )}>
      <OrderDetails
        order={order || null}
        isMobile={isMobile}
        handleClose={handleClose}
        isLoading={orderLoading || movementLoading}
      />
    </div>
  )
}
