import { toast } from "@/hooks/use-toast";
import { OrderStatus } from "@/types/orders";

export type StatusUpdateError = {
  message: string;
  code?: string;
  field?: string;
};

// Status-specific error messages
const statusErrorMessages: Record<OrderStatus, string> = {
  'DRAFT': 'Could not change order status to draft. Please try again.',
  'PENDING': 'Could not move order to pending status. Please try again.',
  'PROCESSING': 'Could not start processing this order. Please try again.',
  'READY': 'Could not mark order as ready. Please try again.',
  'COMPLETED': 'Could not complete this order. Please verify all items are available.',
  'CANCELLED': 'Could not cancel this order. It may be in a state that cannot be cancelled.'
};

// Get appropriate error message based on target status and error details
export function getStatusErrorMessage(targetStatus: OrderStatus, error?: StatusUpdateError): string {
  // Use specific error message if provided
  if (error?.message) {
    return error.message;
  }
  
  // Use status-specific message
  if (statusErrorMessages[targetStatus]) {
    return statusErrorMessages[targetStatus];
  }
  
  // Default fallback
  return 'Failed to update order status. Please try again.';
}

// Show appropriate error toast for status update failures
export function showStatusUpdateErrorToast(targetStatus: OrderStatus, error?: StatusUpdateError): void {
  toast({
    title: "Status Update Failed",
    description: getStatusErrorMessage(targetStatus, error),
    variant: "destructive",
  });
}
