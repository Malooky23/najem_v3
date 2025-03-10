import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderNotesCard } from "./OrderNotesCard";
import { EnrichedOrders, OrderStatus } from "@/types/orders";
import { useState, useMemo } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useOrderDetails } from "@/hooks/data-fetcher";
import { useOrderStatusMutation } from "@/hooks/use-order-status";
import { showStatusUpdateErrorToast } from "@/lib/order-status-errors";
import { toast } from "@/hooks/use-toast";

interface OrderDetailsProps {
  selectedOrderId: string | null;
  isMobile?: boolean;
  onClose: () => void;
  orders: EnrichedOrders[]; // This prop is no longer needed for caching
}

export function OrderDetails({
  selectedOrderId,
  isMobile = false,
  onClose,
  orders // No longer used for caching
}: OrderDetailsProps) {
    // Key for OrderHeader to force re-render on status update error
    const [updateKey, setUpdateKey] = useState(0);

    // Get detailed order data - rely entirely on useOrderDetails
  const { data: order, isLoading, isFetching, isError, error, status, fetchStatus } = useOrderDetails(selectedOrderId);

    // Status mutation hook with explicit typing
  const statusMutation = useOrderStatusMutation();

  // Container and card classes
  const containerClass = isMobile
    ? "p-4 h-full overflow-scroll"
    : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden";

  const cardClass = isMobile
    ? "bg-white"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl";

  // Handle status change with improved error handling
  const handleStatusChange = (status: OrderStatus) => {
      if (!selectedOrderId || !order) {
        toast({
          title: "Error",
          description: "Cannot update order: missing order data",
          variant: "destructive"
        });
        return;
      }

      // Don't update if status hasn't changed
      if (order.status === status) return;

      statusMutation.mutate({
        orderId: selectedOrderId,
        status
      }, {
        // These callbacks are properly typed now
        onError: (error: Error) => {
          showStatusUpdateErrorToast(status, {
            message: error.message,
            code: 'UPDATE_ERROR'
          });
          // Increment updateKey to force re-render of OrderHeader
          setUpdateKey(prevKey => prevKey + 1);
        },
        onSuccess: (data) => {
          // Only proceed if the mutation was successful
          if (data && data.success) {
          } else {
            // Handle the case where the server returned success: false
            showStatusUpdateErrorToast(status, data?.error || {
              message: 'Failed to update order status'
            });
          }
        }
      });
    };

  // Loading state
  if (isLoading && !order) {
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
              onClick={onClose}
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
            key={updateKey} // Add key prop here
            orderNumber={order.orderNumber.toString()}
            status={order.status}
            isEditing={false}
            isMobile={isMobile}
            isLoading={isLoading}
            statusUpdating={null}
            onStatusChange={handleStatusChange}
            onClose={onClose}
          />

          <OrderInfoCard order={order} />
          <OrderItemsTable order={order} />
          <OrderNotesCard order={order} />
        </div>
      </div>
    </div>
  );
}