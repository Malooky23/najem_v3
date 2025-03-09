import { memo, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { EnrichedOrders } from "@/types/orders";
import { OrderDetails } from "./OrderDetails";
import { useOrderDetails } from "@/hooks/data-fetcher";

interface OrderDetailsContainerProps {
  isMobile: boolean;
  selectedOrderId: string | null;
  onClose: () => void;
  onSave: (order: EnrichedOrders) => void;
  isUpdating: boolean;
  orders: EnrichedOrders[];
}

const OrderDetailsContainer = memo(function OrderDetailsContainer({
  isMobile,
  selectedOrderId,
  onClose,
  onSave,
  isUpdating,
  orders
}: OrderDetailsContainerProps) {
  // Try to find the order in the existing data first
  const cachedOrder = useMemo(() => 
    orders?.find(order => order.orderId === selectedOrderId) ?? null,
  [orders, selectedOrderId]);
  
  // Fetch full order details but show cached data immediately
  const { data: orderDetails, isLoading } = useOrderDetails(selectedOrderId, cachedOrder);
  
  // Use cached order immediately if available, then update with full details when loaded
  const displayOrder = orderDetails || cachedOrder;

  // Only show loading if we have no data to display at all
  const showLoading = isLoading && !displayOrder;

  return (
    <div
      className={cn(
        "bg-white rounded-md border relative transition-all duration-300 flex-1 w-[100%] overflow-auto",
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[70%]"
      )}
    >
      <OrderDetails
        order={displayOrder}
        isMobile={isMobile}
        handleClose={onClose}
        onSave={onSave}
        isProcessing={isUpdating}
        isLoading={showLoading} // Only show loading when we have no data at all
      />
    </div>
  );
});

export default OrderDetailsContainer;
