"use client"

import { memo, useCallback, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateOrder } from "@/server/actions/orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSelectedOrderId, useSelectedOrderData, useOrdersStore } from "@/stores/orders-store"
import { z } from "zod"
import { orderStatusSchema } from "@/server/db/schema"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type OrderStatus = z.infer<typeof orderStatusSchema>

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY', label: 'Ready' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusColors: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-500 focus:text-white focus:bg-gray-600",
  PENDING: "bg-yellow-500 focus:text-white focus:bg-yellow-600",
  PROCESSING: "bg-blue-500 focus:text-white focus:bg-blue-600",
  READY: "bg-purple-500 focus:text-white focus:bg-purple-600",
  COMPLETED: "bg-green-500 focus:text-white focus:bg-green-600",
  CANCELLED: "bg-red-500 focus:text-white focus:bg-red-600",
};


interface StatusDropdownProps {
  className?: string;
}

export const StatusDropdown = memo(function StatusDropdown({ className }: StatusDropdownProps) {
  const orderId = useSelectedOrderId();
  const orderData = useSelectedOrderData();
  const updateSelectedOrderStatus = useOrdersStore(state => state.updateSelectedOrderStatus);

  const currentStatus = orderData?.status || "DRAFT" as OrderStatus;

  const [ pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [ showConfirmDialog, setShowConfirmDialog ] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: updateOrderStatus, isPending } = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      if (!orderId) throw new Error("No order selected");

      const result = await updateOrder({
        orderId,
        status: newStatus
      });

      if (!result.success) {
        throw new Error(result.error || '<GENERIC> Failed to update status');
      }
      return { data: result.data, newStatus };
    },
    onSuccess: (result) => {
      const { newStatus } = result;

      updateSelectedOrderStatus(newStatus);

      queryClient.invalidateQueries({ queryKey: [ 'orders' ] });
      queryClient.invalidateQueries({ queryKey: [ 'order', result.data?.orderId ] });
      queryClient.invalidateQueries({ queryKey: [ 'stockMovements' ] });

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
  }, [ pendingStatus, updateOrderStatus]);

  const handleStatusSelect = useCallback((newStatus: OrderStatus) => {
    if (newStatus !== currentStatus) {
      setPendingStatus(newStatus);
      setShowConfirmDialog(true);
    }
  }, [ currentStatus ]);

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "h-7 px-3 cursor-pointer transition-all duration-300 ease-in-out text-white",
              statusColors[ currentStatus ],
              isPending && "opacity-50 cursor-not-allowed",
            )}
          >
            {currentStatus}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 p-0">
          {statusOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value}
              className={cn(
                "cursor-pointer text-white transition-all duration-200",
                statusColors[ option.value as OrderStatus],
                " hover:translate-x-1",
                isPending && "opacity-50 cursor-not-allowed pointer-events-none",
                option.value === currentStatus && "font-semibold"
              )}
              onSelect={() => !isPending && handleStatusSelect(option.value as OrderStatus)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
    </div>
  );
});
