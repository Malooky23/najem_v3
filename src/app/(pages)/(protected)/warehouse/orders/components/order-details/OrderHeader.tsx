import { OrderStatus } from "@/types/orders"
import { Button } from "@/components/ui/button"
import { StatusDropdown } from "./StatusDropdown"
import { Printer, X, Edit, Save } from "lucide-react" // Added Save icon
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderHeaderProps {
  /** The order number to display. */
  orderNumber: string;
  /** The current status of the order. */
  status: OrderStatus;
  /** Whether the order is currently being edited. */
  isEditing?: boolean;
  /** Whether the component is being rendered on a mobile device. */
  isMobile?: boolean;
  /** Whether the order details are currently loading. */
  isLoading?: boolean;
  /** Whether the order status is currently being updated. */
  statusUpdating: boolean;
  /** Callback function to handle status changes. */
  onStatusChange: (status: OrderStatus) => void;
  /** Callback function to handle edit events. */
  onEdit?: () => void;
  /** Callback function to handle save events. */
  onSave?: () => Promise<void>; // Changed onSave to be async
  /** Callback function to handle close events. */
  onClose: () => void;
}

export function OrderHeader({
  orderNumber,
  status,
  isMobile = false,
  isLoading = false,
  statusUpdating,
  onStatusChange,
  onClose,
  isEditing,
  onEdit,
  onSave // Added onSave
}: OrderHeaderProps) {
  // Simple pass-through function, no async
  const handleStatusChange = (newStatus: OrderStatus) => {
    onStatusChange(newStatus);
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4 flex-wrap">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner />
            <span className="text-gray-500">Loading order details...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {statusUpdating ? (
              <Skeleton className="h-8 w-[150px] rounded-full" />
            ) : (
              <>
                <Badge variant="outline" className="h-8 px-3 text-lg font-bold border-2 border-black rounded-full whitespace-nowrap">
                  <span>Order #{orderNumber}</span>
                </Badge>
                <StatusDropdown
                  currentStatus={status}
                  onStatusChange={handleStatusChange}
                  isLoading={statusUpdating}
                />
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isLoading && (
          <>
            {/* Edit/Save buttons - conditionally rendered */}
            {isEditing ? (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 transition-colors"
                onClick={onSave} // Call onSave when clicked
              >
                <Save className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 transition-colors"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              className="hover:bg-gray-100 transition-colors"
              size="icon"
            >
              <Printer className="w-4 h-4" />
            </Button>
          </>
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