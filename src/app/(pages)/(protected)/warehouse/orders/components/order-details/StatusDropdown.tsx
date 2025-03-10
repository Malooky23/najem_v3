import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { OrderStatus } from "@/types/orders"

interface StatusDropdownProps {
  currentStatus: OrderStatus
  onStatusChange: (status: OrderStatus) => void // Matches OrderHeader's type
  isLoading: boolean
  loadingStatus: OrderStatus | null
}

export function StatusDropdown({
  currentStatus,
  onStatusChange,
  isLoading,
  loadingStatus
}: StatusDropdownProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Combined loading state
  const isUpdating = isLoading || internalLoading;

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

  // Handle status change without async
  const handleChange = (value: string) => {
    const newStatus = value as OrderStatus;
    if (isUpdating || newStatus === currentStatus) return;
    
    setInternalLoading(true);
    try {
      onStatusChange(newStatus);
    } finally {
      // Clean up after a delay to ensure animation is visible
      setTimeout(() => setInternalLoading(false), 100);
    }
  }

  return (
    <div className="relative">
      <Select
        value={currentStatus}
        onValueChange={handleChange}
        disabled={isUpdating}
      >
        <SelectTrigger className={`w-[180px] font-medium ${getStatusColor(currentStatus)}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {isUpdating && loadingStatus === currentStatus && (
                <LoadingSpinner className="w-4 h-4" />
              )}
              {currentStatus}
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
      
      {isUpdating && loadingStatus !== currentStatus && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center mr-8">
          <LoadingSpinner className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}