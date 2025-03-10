import { OrderStatus } from "@/types/orders"
import { Button } from "@/components/ui/button"
import { StatusDropdown } from "./StatusDropdown"
import { Printer, X } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"

interface OrderHeaderProps {
  orderNumber: string
  status: OrderStatus
  isEditing?: boolean
  isMobile?: boolean
  isLoading?: boolean
  statusUpdating: OrderStatus | null
  // Make sure this matches the function type from OrderDetails
  onStatusChange: (status: OrderStatus) => void
  onEdit?: () => void
  onSave?: () => Promise<any>
  onClose: () => void
}

export function OrderHeader({
  orderNumber,
  status,
  isMobile = false,
  isLoading = false,
  statusUpdating,
  onStatusChange,
  onClose
}: OrderHeaderProps) {
  // Simple pass-through function, no async
  const handleStatusChange = (newStatus: OrderStatus) => {
    onStatusChange(newStatus);
  }

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner />
            <span className="text-gray-500">Loading order details...</span>
          </div>
        ) : (
          <>
            <Badge variant="outline" className="h-7 px-3 text-lg border-2 border-black bg-white">
              <p className="whitespace-nowrap">Order #{orderNumber}</p>
            </Badge>
            <StatusDropdown
              currentStatus={status}
              onStatusChange={handleStatusChange}
              isLoading={!!statusUpdating}
              loadingStatus={statusUpdating}
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isLoading && (
          <Button
            className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors"
            size="sm"
          >
            <Printer className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={isMobile ? "absolute right-4 top-4" : ""}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}