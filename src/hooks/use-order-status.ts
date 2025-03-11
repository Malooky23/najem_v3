import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderStatus, EnrichedOrders } from "@/types/orders";
import { updateOrder } from "@/server/actions/orders";
import { toast } from "@/hooks/use-toast";
import { showStatusUpdateErrorToast } from "@/lib/order-status-errors";
import { OrdersQueryResult, OrderUpdateResult } from "./data-fetcher";

import { useRouter } from "next/navigation";

interface StatusUpdateParams {
  orderId: string;
  status: OrderStatus;
}

interface MutationContext {
  previousData: EnrichedOrders | undefined;
}

export function useOrderStatusMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<
    OrderUpdateResult,
    Error,
    StatusUpdateParams,
    MutationContext
  >({
    mutationFn: async ({ orderId, status }) => {
      // Get the current order from cache
      const currentOrder = queryClient.getQueryData<EnrichedOrders>(['order', orderId]);

      if (!currentOrder) {
        throw new Error('Order not found in cache');
      }

      // Create updated order with new status
      const updatedOrder: EnrichedOrders = {
        ...currentOrder,
        status
      };

      // Call the API
      const result = await updateOrder(updatedOrder);

      if (!result) {
        throw new Error('No response received from server'); // Throw error for no response
      }

      if (!result.success) {
        // Throw an error if the update failed
        let errorMessage: string;
        if (typeof result.error?.message === 'string') {
          errorMessage = result.error.message;
        } else if (typeof result.error?.message === 'object' && result.error.message) {
          errorMessage = result.error.message;
        } else {
          errorMessage = 'Failed to update order status';
        }
        throw new Error(errorMessage); // Throw the error
      }

      // Show success toast
      toast({
        title: "Status Updated",
        description: `Order status changed to ${status}`,
      });

      return {
        success: true,
        data: result.data as EnrichedOrders
      };

    },

    // Handle errors and revert optimistic update
    onError: (err, { orderId, status }, context) => {
      // Show error toast
      showStatusUpdateErrorToast(status, {
        message: err.message || 'Failed to update order status',
        code: 'UPDATE_ERROR'
      });
    },

    // Refresh data after mutation
    onSettled: (result, error, { orderId }) => {
      if (error || (result && !result.success)) {
        // If there was an error, immediately refetch to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        router.refresh();
      } else {
        // On success, wait a bit before refetching to avoid flickering
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }, 500);
      }
    },
  });
}
