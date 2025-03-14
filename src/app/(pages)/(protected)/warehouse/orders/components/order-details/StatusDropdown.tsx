"use client"

import { memo, useCallback, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { OrderStatus } from "@/types/orders"
import { updateOrder } from "@/server/actions/orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSelectedOrderId, useSelectedOrderData, useOrdersStore } from "@/stores/orders-store"

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY', label: 'Ready' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusColors: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-500",
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  READY: "bg-purple-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export const StatusDropdown = memo(function StatusDropdown() {
  // Use separate selectors to prevent unnecessary renders
  const orderId = useSelectedOrderId();
  const orderData = useSelectedOrderData();
  const updateSelectedOrderStatus = useOrdersStore(state => state.updateSelectedOrderStatus);
  
  // Get current status safely
  const currentStatus = orderData?.status || "DRAFT" as OrderStatus;
  
  const [isOpen, setIsOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: updateOrderStatus, isPending } = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      if (!orderId) throw new Error("No order selected");
      
      const result = await updateOrder({
        orderId,
        status: newStatus
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update status');
      }
      return { data: result.data, newStatus };
    },
    onSuccess: (result) => {
      const { newStatus } = result;

      // Update store state
      updateSelectedOrderStatus(newStatus);
      
      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast.success(`Order status updated to ${newStatus}`);
      setShowConfirmDialog(false);
      setPendingStatus(null);
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowConfirmDialog(false);
      setPendingStatus(null);
    }
  });

  const handleConfirm = useCallback(() => {
    if (!pendingStatus) return;
    updateOrderStatus(pendingStatus);
  }, [pendingStatus, updateOrderStatus]);

  const handleStatusSelect = useCallback((newStatus: OrderStatus) => {
    if (newStatus !== currentStatus) {
      setPendingStatus(newStatus);
      setShowConfirmDialog(true);
    }
    setIsOpen(false);
  }, [currentStatus]);

  return (
    <>
      <div className="relative">
        <Badge
          variant="secondary"
          className={cn(
            "h-7 px-3 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md text-white",
            statusColors[currentStatus],
            isPending && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !isPending && setIsOpen(!isOpen)}
        >
          {currentStatus}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Badge>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden z-10">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "px-4 py-2 cursor-pointer text-white transition-all duration-200",
                  statusColors[option.value as OrderStatus],
                  "hover:opacity-80 hover:translate-x-1",
                  isPending && "opacity-50 cursor-not-allowed pointer-events-none",
                  option.value === currentStatus && "font-semibold"
                )}
                onClick={() => !isPending && handleStatusSelect(option.value as OrderStatus)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Order Status</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              Are you sure you want to change the order status from {currentStatus} to {pendingStatus}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              onClick={() => {
                setPendingStatus(null);
                setShowConfirmDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className={cn(
                "relative",
                isPending && "text-transparent"
              )}
            >
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});