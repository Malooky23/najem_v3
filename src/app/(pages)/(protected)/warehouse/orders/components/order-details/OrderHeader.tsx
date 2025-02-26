import { OrderStatus } from "@/types/orders"
import { Button } from "@/components/ui/button"
import { StatusDropdown } from "./StatusDropdown"
import { X } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface OrderHeaderProps {
  orderNumber: string
  status: OrderStatus
  isEditing: boolean
  isMobile?: boolean
  isLoading?: boolean
  onStatusChange: (status: OrderStatus) => Promise<void>
  onEdit: () => void
  onSave: () => void
  onClose: () => void
}

export function OrderHeader({ 
  orderNumber, 
  status, 
  isEditing, 
  isMobile = false,
  isLoading = false,
  onStatusChange, 
  onEdit, 
  onSave, 
  onClose 
}: OrderHeaderProps) {
  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await onStatusChange(newStatus)
    } catch (error) {
      // Error handling is done in the StatusDropdown component
      throw error
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner />
            <span className="text-gray-500">Loading order details...</span>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold">
              Order #{orderNumber}
            </h2>
            <StatusDropdown
              currentStatus={status}
              onStatusChange={handleStatusChange}
              isEditing={isEditing}
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isLoading && (
          isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Edit Order
            </Button>
          )
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