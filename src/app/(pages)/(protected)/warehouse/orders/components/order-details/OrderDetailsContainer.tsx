import { memo, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { EnrichedOrders, OrderStatus } from "@/types/orders";
import { OrderDetails } from "./OrderDetails";
import { useOrderDetails } from "@/hooks/data-fetcher";
import { useOrderStatusMutation } from "@/hooks/use-order-status"; 
import { showStatusUpdateErrorToast } from "@/lib/order-status-errors";
import { toast } from "@/hooks/use-toast";

interface OrderDetailsContainerProps {
  isMobile: boolean;
  selectedOrderId: string | null;
  onClose: () => void;
  orders: EnrichedOrders[];
}

const OrderDetailsContainer = memo(function OrderDetailsContainer({
  isMobile,
  selectedOrderId,
  onClose,
  orders
}: OrderDetailsContainerProps) {
  // Find order in the list for initial data
  const cachedOrder = useMemo(() => 
    selectedOrderId ? orders?.find(order => order.orderId === selectedOrderId) : null, 
    [orders, selectedOrderId]
  );
  
  // Get detailed order data
  const { data: orderDetails, isLoading } = useOrderDetails(selectedOrderId, cachedOrder);
  
  // Status mutation hook with explicit typing
  const statusMutation = useOrderStatusMutation();
  
  // The order to display - ensure it's never undefined
  const order = orderDetails || cachedOrder || null; // Fix: add null fallback
  
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
      },
      onSuccess: (data) => {
        if (!data || !data.success) {
          showStatusUpdateErrorToast(status, data?.error || {
            message: 'Failed to update order status'
          });
        }
      }
    });
  };

  return (
    <div
      className={cn(
        "bg-white rounded-md border relative transition-all duration-300 flex-1 w-[100%] overflow-auto",
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[70%]"
      )}
    >
      <OrderDetails
        selectedOrderId={order?.orderId ?? ""} // Now this is guaranteed to be EnrichedOrders | null
        isMobile={isMobile}
        onClose={onClose}
        orders={orders}
        // isLoading={isLoading && !cachedOrder}
        // isProcessing={statusMutation.isPending}
        // onStatusChange={handleStatusChange}
      />
    </div>
  );
});

export default OrderDetailsContainer;
