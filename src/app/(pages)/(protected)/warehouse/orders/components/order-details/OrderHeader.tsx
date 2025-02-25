import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Printer, X } from "lucide-react"
import { OrderStatus } from "@/types/orders"
import { StatusDropdown } from "./StatusDropdown"
import { SaveButton } from "@/components/ui/SaveButton"

interface OrderHeaderProps {
  orderNumber: string
  status: OrderStatus
  isEditing: boolean
  isMobile?: boolean
  onStatusChange: (status: OrderStatus) => Promise<void>
  onEdit: () => void
  onSave: () => Promise<void>
  onClose: () => void
}

export function OrderHeader({
  orderNumber,
  status,
  isEditing,
  isMobile = false,
  onStatusChange,
  onEdit,
  onSave,
  onClose,
}: OrderHeaderProps) {
  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full pb-2 ">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-7 px-3 text-lg border-2 bg-white ">
            <p className="whitespace-nowrap">Order #{orderNumber}</p>
          </Badge>

        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors">
            <Printer className="w-4 h-4" />
          </Button>
          {isEditing ? (
            <SaveButton onClick={onSave} />
          ) : (
            <Button
              size="sm"
              className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={onClose}
            size="sm"
            className="gap-2 bg-red-400 hover:bg-red-600 transition-colors"
            >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-between mx-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 ">
        {/* <h1 className="text-xl font-semibold text-gray-800">Order Details</h1> */}
        <Badge variant="outline" className="h-7 px-3 text-lg border-2 bg-white">
         <p className="whitespace-nowrap">Order #{orderNumber}</p>
        </Badge>
        <StatusDropdown
          currentStatus={status}
          onStatusChange={onStatusChange}
          isEditing={isEditing}
        />
      </div>
      <div className="flex items-end gap-3    ">
        <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors">
          <Printer className="w-4 h-4" />
          Print Order
        </Button>
        {isEditing ? (
          <SaveButton onClick={onSave} showLabel />
        ) : (
          <Button
            size="sm"
            className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        )}
        <Button
          onClick={onClose}
          size="sm"
          className="gap-2 bg-red-400 hover:bg-red-600 transition-colors"
        >
          <X  />
        </Button>
      </div>
    </div>
  )
}