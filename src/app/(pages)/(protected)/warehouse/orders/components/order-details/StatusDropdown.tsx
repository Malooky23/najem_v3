"use client"

import { memo, useCallback, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatus } from "@/types/orders"
import { updateOrder } from "@/server/actions/orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface StatusDropdownProps {
  /** The current status of the order. */
  currentStatus: OrderStatus;
  /** The order ID */
  orderId: string;
}

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY', label: 'Ready' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const StatusDropdown = memo(function StatusDropdown({
  currentStatus,
  orderId
}: StatusDropdownProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const queryClient = useQueryClient();

  // Get color based on status
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "READY": return "bg-purple-100 text-purple-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  // Get font color based on status
  const getStatusFontColor = (status: OrderStatus): string => {
    switch (status) {
      case "DRAFT": return "text-gray-800";
      case "PENDING": return "text-yellow-800";
      case "PROCESSING": return "text-blue-800";
      case "READY": return "text-purple-800";
      case "COMPLETED": return "text-green-800";
      case "CANCELLED": return "text-red-800";
      default: return "text-gray-800";
    }
  }

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const result = await updateOrder({
        orderId,
        status: newStatus
      });
      console.log(result)
      if (!result.success) {
        console.log('here')
        throw new Error(result.error?.message || 'Failed to update status');
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Order status updated to ${status}`);
    },
    onError: (error) => {
      // Revert to original status on error
      console.log('ERRRRRRRR')
      setStatus(currentStatus);
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);

    }
  });

  const handleStatusChange = useCallback((value: string) => {
    const newStatus = value as OrderStatus;
    if (isPending || newStatus === status) return;
    setStatus(newStatus);
    updateStatus(newStatus);
  }, [isPending, status, updateStatus]);

  return (
    <div className="relative">
      <Select
        value={status}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className={`w-[180px] font-medium rounded-full ${getStatusColor(status)}`}>
          <SelectValue>
            <div className={`flex items-center gap-2 ${getStatusFontColor(status)}`}>
              {isPending ? (
                <Skeleton className="w-4 h-4" />
              ) : (
                <span className={getStatusFontColor(status)}>{status}</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={getStatusColor(option.value as OrderStatus)}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
});