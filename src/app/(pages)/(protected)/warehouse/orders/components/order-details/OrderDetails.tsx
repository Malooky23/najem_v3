import { OrderHeader } from "./OrderHeader"
import { OrderInfoCard } from "./OrderInfoCard"
import { OrderItemsTable } from "./OrderItemsTable"
import { OrderNotesCard } from "./OrderNotesCard"
import { EnrichedOrders, OrderStatus } from "@/types/orders"
import { useOrderForm } from "../hooks/useOrderForm"
import { toast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useOrderDetails } from "@/hooks/data-fetcher"

interface OrderDetailsProps {
  order: EnrichedOrders | null
  isMobile?: boolean
  isLoading?: boolean
  onSave?: (updatedOrder: EnrichedOrders) => void
  handleClose: () => void
}

export function OrderDetails({ 
  order, 
  isMobile = false,
  isLoading = false,
  onSave, 
  handleClose 
}: OrderDetailsProps) {
  const containerClass = isMobile
    ? "p-4 h-full overflow-scroll"
    : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden"

  const cardClass = isMobile
    ? "bg-white"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl"

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} flex items-center justify-center min-h-[200px]`}>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {

    return (
      <div className={containerClass}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} text-center text-gray-500`}>
            <p>Order not found or no longer available.</p>
            <button
              onClick={handleClose}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              Return to Orders List
            </button>
          </div>
        </div>
      </div>
    )
  }

  const {
    form,
    isEditing,
    isSaving,
    handleSave,
    handleEdit,
    handleCancel
  } = useOrderForm({ 
    order, 
    onSave: async (values: EnrichedOrders) => {
      if (!onSave) {
        throw new Error('Cannot save: save callback is not provided')
      }
      await onSave(values)
    }
  })

  const handleStatusChange = async (status: OrderStatus) => {
    // Don't proceed if status hasn't changed
    if (status === order.status) {
      toast({
        description: "Status is already " + status,
        variant: "default",
      })
      return
    }

    try {
      form.setValue("status", status)
      if (!isEditing) {
        await handleSave()
      }
    } catch (error) {
      // Revert on error
      form.setValue("status", order.status)
      throw error
    }
  }

  return (
    <div className={containerClass}>
      <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
        <div className={isMobile ? "p-4" : "p-6"}>
          <OrderHeader
            orderNumber={order.orderNumber.toString()}
            status={order.status}
            isEditing={isEditing}
            isMobile={isMobile}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onSave={handleSave}
            onClose={handleClose}
          />

          <OrderInfoCard
            order={order}
            form={form}
            isEditing={isEditing}
          />

          <OrderItemsTable
            order={order}
            form={form}
            isEditing={isEditing}
          />

          <OrderNotesCard
            order={order}
            form={form}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  )
}