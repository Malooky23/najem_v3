import { OrderStatus } from "@/types/orders"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface OrderHeaderProps {
  status: OrderStatus
  orderNumber: string
  isLoading: boolean
  onClose: () => void
}

export function OrderHeader({ 
  status, 
  orderNumber, 
  isLoading, 
  onClose 
}: OrderHeaderProps) {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "PROCESSING": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-medium">Order #{orderNumber}</h3>
        <Badge className={`mt-1 ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </div>
      {isLoading && <LoadingSpinner className="h-5 w-5" />}
    </div>
  )
}