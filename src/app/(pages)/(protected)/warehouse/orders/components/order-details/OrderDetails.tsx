import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderNotesCard } from "./OrderNotesCard";
import { EnrichedOrders, OrderStatus } from "@/types/orders";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface OrderDetailsProps {
  order: EnrichedOrders | null;
  isMobile?: boolean;
  isLoading?: boolean;
  isProcessing?: boolean;
  onStatusChange: (status: OrderStatus) => void;
  handleClose: () => void;
}

export function OrderDetails({
  order,
  isMobile = false,
  isLoading = false,
  isProcessing = false,
  onStatusChange,
  handleClose
}: OrderDetailsProps) {
  const [statusUpdating, setStatusUpdating] = useState<OrderStatus | null>(null);
  
  // Container and card classes
  const containerClass = isMobile
    ? "p-4 h-full overflow-scroll"
    : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden";

  const cardClass = isMobile
    ? "bg-white"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl";
  
  // Handle status change - simplified
  const handleStatusChange = (status: OrderStatus) => {
    if (!order || status === order.status) return;
    
    // Set loading state
    setStatusUpdating(status);
    
    try {
      // Call parent handler
      onStatusChange(status);
    } catch (error) {
      console.error("Error in status change:", error);
    }
    
    // Clear status after a delay to ensure loading indicator shows
    setTimeout(() => {
      setStatusUpdating(null);
    }, 500);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} flex items-center justify-center min-h-[200px]`}>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  // No order state
  if (!order) {
    return (
      <div className={containerClass}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} text-center text-gray-500`}>
            <p>Order details not found or no longer available.</p>
            <button
              onClick={handleClose}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              Return to Orders List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal render with order
  return (
    <div className={containerClass}>
      <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
        <div className={isMobile ? "p-4" : "p-6"}>
          <OrderHeader
            orderNumber={order.orderNumber.toString()}
            status={order.status}
            isEditing={false}
            isMobile={isMobile}
            isLoading={isLoading}
            statusUpdating={statusUpdating}
            onStatusChange={handleStatusChange}
            onClose={handleClose}
          />

          <OrderInfoCard order={order} />
          <OrderItemsTable order={order} />
          <OrderNotesCard order={order} />
        </div>
      </div>
    </div>
  );
}