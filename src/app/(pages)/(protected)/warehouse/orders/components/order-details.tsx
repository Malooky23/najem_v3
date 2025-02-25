
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Truck, Calendar, User, Box, ArrowUpRight, Printer, ChevronDown, Edit, Save } from "lucide-react"
import type { EnrichedOrders } from "@/types/orders"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { toast } from "sonner"

const statusColors = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
}

type Status = keyof typeof statusColors

const StatusDropdown = ({
  currentStatus,
  onStatusChange,
  isEditing,
}: { currentStatus: Status; onStatusChange: (status: Status) => void; isEditing: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (isEditing) {
    return (
      <Select onValueChange={(value) => onStatusChange(value as Status)} defaultValue={currentStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(statusColors).map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="relative">
      <Badge
        variant="secondary"
        className={`h-7 px-3 cursor-pointer transition-all hover:shadow-md ${statusColors[currentStatus]} text-white`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentStatus}
        <ChevronDown className="w-4 h-4 ml-1" />
      </Badge>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden z-10">
          {Object.keys(statusColors).map((status) => (
            <div
              key={status}
              className={`px-4 py-2 cursor-pointer ${statusColors[status as Status]} text-white hover:opacity-80 transition-opacity`}
              onClick={() => {
                onStatusChange(status as Status)
                setIsOpen(false)
              }}
            >
              {status}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface OrderDetailsProps {
  order: EnrichedOrders | null
  isMobile?: boolean
  onSave?: (updatedOrder: EnrichedOrders) => void
}

export function OrderDetails({ order: order, isMobile = false, onSave }: OrderDetailsProps) {
  const form = useForm<EnrichedOrders>({
    defaultValues: order || {},
    mode: "onChange"
  })

  const [isEditing, setIsEditing] = useState(false)
  const [orderData, setOrderData] = useState<EnrichedOrders>(order ?? {} as EnrichedOrders)

  const handleInputChange = (field: keyof EnrichedOrders, value: any) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!order) {
    return <div className="p-6 text-center">No order details available.</div>
  }

  const containerClass = isMobile
    ? "p-4 h-full overflow-scroll"
    : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden "
  const cardClass = isMobile
    ? "bg-white"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl"

  const handleSave = async (data: EnrichedOrders) => {
    try {
      if (!onSave) {
        throw new Error('Cannot save: save callback is not provided');
      }

      console.group('Order Save Operation');
      console.log('Saving order with ID:', data.orderId);
      console.log('Current Status:', data.status);
      console.log('Full Order Details:', data);
      console.groupEnd();

      await onSave(data);
      toast.success('Order updated successfully');
      setIsEditing(false);
    } catch (error:any) {
      console.error('Save operation failed:', error.message);
      toast.error('Failed to update order: ' + error.message);
    }
    return
      {success: true}
    
  }

  return (
    <div className={containerClass}>
      <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
        <div className={isMobile ? "p-4" : "p-6"}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
              <Badge variant="outline" className="h-7 px-3 text-lg border-2 bg-white">
                #{order.orderNumber}
              </Badge>
              <StatusDropdown
                currentStatus={order.status as Status}
                onStatusChange={(status) => handleInputChange("status", status)}
                // onStatusChange={(status) => handleInputChange("status", status)}
                isEditing={isEditing}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors">
                <Printer className="w-4 h-4" />
                Print Order
              </Button>
              {isEditing ? (
                <Button
                  size="sm"
                  className="gap-2 bg-green-500 hover:bg-green-600 transition-colors"
                  onClick={() => handleSave(form.getValues() as EnrichedOrders)}
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
                  onClick={() => 
                  console.log(form.getValues())}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-gray-700">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Movement Type</label>
                  {isEditing ? (
                    <Input value={order.movement} onChange={(e) => handleInputChange("movement", e.target.value)} />
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ArrowUpRight className="w-4 h-4 text-blue-500" />
                      <span>{order.movement}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Delivery Method</label>
                  {isEditing ? (
                    <Input
                      value={order.deliveryMethod}
                      onChange={(e) => handleInputChange("deliveryMethod", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Truck className="w-4 h-4 text-green-500" />
                      <span>{order.deliveryMethod}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Order Type</label>
                  {isEditing ? (
                    <Input value={order.orderType} onChange={(e) => handleInputChange("orderType", e.target.value)} />
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Package className="w-4 h-4 text-purple-500" />
                      <span>{order.orderType}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Packing Type</label>
                  {isEditing ? (
                    <Input
                      value={order.packingType}
                      onChange={(e) => handleInputChange("packingType", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Box className="w-4 h-4 text-orange-500" />
                      <span>{order.packingType}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Customer</label>
                  {isEditing ? (
                    <Input
                      value={order.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>{order.customerName}</span>
                    </div>
                  )}
                </div>
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

          <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-gray-700">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100/50">
                    <TableHead className="w-[70%]">Item</TableHead>
                    <TableHead className="w-[30%]">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={`${item.itemId}-${index}`} className="hover:bg-gray-100/50 transition-colors">
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <Input
                            value={item.itemName}
                            onChange={(e) => {
                              const newItems = [...order.items]
                              newItems[index] = { ...newItems[index], itemName: e.target.value }
                              handleInputChange("items", newItems)
                            }}
                          />
                        ) : (
                          item.itemName
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...order.items]
                              newItems[index] = { ...newItems[index], quantity: Math.max(1, Number.parseInt(e.target.value) || 1) }
                              handleInputChange("items", newItems)
                            }}
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-gray-700">Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {isEditing ? (
                <Textarea
                  value={order.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add notes here..."
                />
              ) : (
                <p className="text-sm text-gray-600">{order.notes || "No notes available."}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

