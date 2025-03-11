import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Box, Calendar, Package, Truck, User } from "lucide-react"
import { EditableField } from "@/components/ui/EditableField"
import { UseFormReturn } from "react-hook-form"
import { EnrichedOrders, MovementType, DeliveryMethod, OrderType, PackingType, movementType, deliveryMethod, orderType, packingType } from "@/types/orders"

interface OrderInfoCardProps {
  order: EnrichedOrders
  form: UseFormReturn<EnrichedOrders>
  isEditing: boolean
}

export function OrderInfoCard({ order, form, isEditing }: OrderInfoCardProps) {
  return (
    <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow mt-2">
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-gray-700">Order Information</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <EditableField
            label="Movement Type"
            value={form.watch("movement")}
            icon={<ArrowUpRight className="w-4 h-4 text-blue-500" />}
            isEditing={isEditing}
            type="select"
            options={movementType.options.map(type => ({
              value: type,
              label: type
            }))}
            onChange={(value: string) => form.setValue("movement", value as MovementType)}
          />

          <EditableField
            label="Delivery Method"
            value={form.watch("deliveryMethod")}
            icon={<Truck className="w-4 h-4 text-green-500" />}
            isEditing={isEditing}
            type="select"
            options={deliveryMethod.options.map(type => ({
              value: type,
              label: type.charAt(0) + type.slice(1).toLowerCase()
            }))}
            onChange={(value: string) => form.setValue("deliveryMethod", value as DeliveryMethod)}
          />

          <EditableField
            label="Order Type"
            value={form.watch("orderType")}
            icon={<Package className="w-4 h-4 text-purple-500" />}
            isEditing={isEditing}
            type="select"
            options={orderType.options.map(type => ({
              value: type,
              label: type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
            }))}
            onChange={(value: string) => form.setValue("orderType", value as OrderType)}
          />

          <EditableField
            label="Packing Type"
            value={form.watch("packingType")}
            icon={<Box className="w-4 h-4 text-orange-500" />}
            isEditing={isEditing}
            type="select"
            options={packingType.options.map(type => ({
              value: type,
              label: type.charAt(0) + type.slice(1).toLowerCase()
            }))}
            onChange={(value: string) => form.setValue("packingType", value as PackingType)}
          />

          <EditableField
            label="Customer"
            value={form.watch("customerName")}
            icon={<User className="w-4 h-4 text-indigo-500" />}
            isEditing={isEditing}
            onChange={(value: string) => form.setValue("customerName", value)}
          />

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Date</label>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>{order.createdAt.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}