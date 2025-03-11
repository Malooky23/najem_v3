import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { OrderStatus } from "@/types/orders"

interface StatusDropdownProps {
  /** The current status of the order. */
  currentStatus: OrderStatus;
  /** Callback function to handle status changes. */
  onStatusChange: (status: OrderStatus) => void;
  /** Whether the order status is currently being updated. */
  isLoading: boolean;
}

export function StatusDropdown({
  currentStatus,
  onStatusChange,
  isLoading,
}: StatusDropdownProps) {

  // Get color based on status
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "READY": return "bg-purple-100 text-purple-800";
      case "COMPLETED": return "bg-green-100 text-green-800"; // Completed is green
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
            case "COMPLETED": return "text-green-800"; // Completed is green
            case "CANCELLED": return "text-red-800";
            default: return "text-gray-800";
        }
    }

  // Handle status change without async
  const handleChange = (value: string) => {
    const newStatus = value as OrderStatus;
    if (isLoading || newStatus === currentStatus) return;
    onStatusChange(newStatus);
  }

  return (
    <div className="relative">
      <Select
        value={currentStatus}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger className={`w-[180px] font-medium rounded-full ${getStatusColor(currentStatus)}`}> {/* Apply color and rounding */}
          <SelectValue>
            <div className={`flex items-center gap-2 ${getStatusFontColor(currentStatus)}`}>
              {isLoading && (
                <LoadingSpinner className="w-4 h-4" />
              )}
              {/* Keep the text, apply correct font color */}
              <span className={getStatusFontColor(currentStatus)}>{currentStatus}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT" className={getStatusColor("DRAFT")}>DRAFT</SelectItem>
          <SelectItem value="PENDING" className={getStatusColor("PENDING")}>PENDING</SelectItem>
          <SelectItem value="PROCESSING" className={getStatusColor("PROCESSING")}>PROCESSING</SelectItem>
          <SelectItem value="READY" className={getStatusColor("READY")}>READY</SelectItem>
          <SelectItem value="COMPLETED" className={getStatusColor("COMPLETED")}>COMPLETED</SelectItem>
          <SelectItem value="CANCELLED" className={getStatusColor("CANCELLED")}>CANCELLED</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}