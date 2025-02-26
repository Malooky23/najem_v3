import { OrderStatus } from "@/types/orders"
import { Button } from "@/components/ui/button"
import { StatusDropdown } from "./StatusDropdown"
import { Edit, Printer, Save, X } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SaveButton } from "@/components/ui/SaveButton"
import { Badge } from "@/components/ui/badge"

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
              isEditing={isEditing}
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isLoading && (
          isEditing ? (

            <SaveButton
              onClick={async () => onSave()}
            />
          ) : (
            <>
              <Button
                className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors"
                size="sm"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
                // variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4" />
              </Button>

            </>
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