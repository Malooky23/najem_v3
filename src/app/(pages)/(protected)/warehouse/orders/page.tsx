"use client"

import { useState, useEffect } from "react"
import { OrdersTable } from "./components/orders-table"
import { ordersColumns } from "./components/orders-columns"
import { OrderDetails } from "./components/order-details"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

// Example data - replace with your actual data fetching logic
const exampleOrders = [
  {
    orderId: "1",
    orderNumber: "ORD001",
    customerName: "John Doe",
    status: "PENDING",
    date: "2024-02-20",
    total: 299.99
  },
  {
    orderId: "2",
    orderNumber: "ORD002",
    customerName: "Jane Smith",
    status: "PROCESSING",
    date: "2024-02-19",
    total: 149.50
  },
  {
    orderId: "3",
    orderNumber: "ORD003",
    customerName: "Bob Johnson",
    status: "SHIPPED",
    date: "2024-02-18",
    total: 499.99
  }
]

interface Order {
  orderId: string
  orderNumber: string
  customerName: string
  status: string
  date: string
  total: number
}

export default function OrdersPage() {
  const isLoading = false
  const data = exampleOrders
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Close details view when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsDetailsOpen(false)
    }
  }, [isMobile])

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    if (isMobile) {
      setSelectedOrder(null)
    }
  }

  return (
    <div className="p-2 mx-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        {/* Add your create order button or other actions here */}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Table section - responsive width */}
        <div 
          className={cn(
            "flex flex-col rounded-md border transition-all duration-300",
            isMobile ? (isDetailsOpen ? "hidden" : "w-full") : (isDetailsOpen ? "w-[30%]" : "w-full"),
            "overflow-hidden"
          )}
        >
          <OrdersTable
            columns={ordersColumns}
            data={data}
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
              "bg-white rounded-md border relative transition-all duration-300",
              isMobile ? "fixed inset-0 z-50 m-0" : "w-[70%]"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2",
                isMobile ? "top-4" : "top-2"
              )}
              onClick={handleCloseDetails}
            >
              <X className="h-4 w-4" />
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