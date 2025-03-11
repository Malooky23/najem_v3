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
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrder } from "@/server/actions/orders";
import { OrderUpdateResult } from "@/hooks/data-fetcher";
import { UpdateOrderInput } from "@/types/orders"; // Correct import

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
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

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

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

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

      setIsStatusUpdating(true); // Set loading state to true

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
          setIsStatusUpdating(false); // Set loading state to false
        },
        onSuccess: (data) => {
          // Only proceed if the mutation was successful
          if (data && data.success) {
              //Success handled in useOrderStatus hook
          } else {
            // Handle the case where the server returned success: false
            showStatusUpdateErrorToast(status, data?.error || {
              message: 'Failed to update order status'
            });
          }
            setIsStatusUpdating(false); //set loading state to false
        }
      });
    };

    // Callbacks to update order information.
    const updateOrderInfo = (newOrderInfo: Partial<EnrichedOrders>) => {
        if (order) {
            // Update the local order state.
            Object.assign(order, newOrderInfo);
        }
    };

    const updateOrderItems = (newItems: Array<{
        itemId: string;
        itemName: string;
        quantity: number;
        itemLocationId: string;
    }>) => {
        if (order) {
          order.items = newItems;
        }
    };

    const updateOrderNotes = (newNotes: string) => {
        if (order) {
            order.notes = newNotes;
        }
    };

  // Mutation for updating the entire order
    const updateOrderMutation = useMutation<OrderUpdateResult, Error, UpdateOrderInput>({
        mutationFn: async (updatedOrder: UpdateOrderInput) => {
            const result = await updateOrder(updatedOrder);
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to update order');
            }
            return result;
        },
        onSuccess: (data) => {
            // Invalidate and refetch the order details
            if (selectedOrderId) {
                queryClient.invalidateQueries({queryKey: ['order', selectedOrderId]});
                // Also invalidate orders list to reflect the changes
                queryClient.invalidateQueries({queryKey: ['orders']});
            }
            toast({
                title: "Order Updated",
                description: "The order has been updated successfully.",
            });
            setIsEditing(false); // Exit editing mode
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const handleSave = async () => {
      if (order && selectedOrderId) {
        const updateData: UpdateOrderInput = {
          orderId: order.orderId, // Required
          customerId: order.customerId,
          orderType: order.orderType,
          movement: order.movement,
          packingType: order.packingType,
          deliveryMethod: order.deliveryMethod,
          status: order.status,
          notes: order.notes,
          items: order.items,
          addressId: order.addressId,
        };
        await updateOrderMutation.mutateAsync(updateData);
      }
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
        <div className={isMobile ? "p-4" : ""}>
          <OrderHeader
            key={updateKey}
            orderNumber={order.orderNumber.toString()}
            status={order.status}
            isEditing={isEditing}
            isMobile={isMobile}
            isLoading={isLoading}
            statusUpdating={isStatusUpdating}
            onStatusChange={handleStatusChange}
            onClose={onClose}
            onEdit={handleEditToggle}
            onSave={handleSave} // Pass handleSave to OrderHeader
          />
            <OrderInfoCard order={order} isEditing={isEditing} updateOrderInfo={updateOrderInfo} />
            <OrderItemsTable order={order} isEditing={isEditing} updateOrderItems={updateOrderItems}/>
            <OrderNotesCard order={order} isEditing={isEditing} updateOrderNotes={updateOrderNotes}/>
        </div>
      </div>
    </div>
  );
}