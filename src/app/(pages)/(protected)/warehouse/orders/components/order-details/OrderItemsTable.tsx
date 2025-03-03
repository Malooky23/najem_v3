import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UseFormReturn } from "react-hook-form"
import { EnrichedOrders } from "@/types/orders"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface OrderItemsTableProps {
  order: EnrichedOrders
  form: UseFormReturn<EnrichedOrders>
  isEditing: boolean
}

export function OrderItemsTable({ order, form, isEditing }: OrderItemsTableProps) {
  return (
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
                      value={form.watch(`items.${index}.itemName`)}
                      onChange={(e) => {
                        const newItems = [...form.getValues("items")]
                        newItems[index] = { ...newItems[index], itemName: e.target.value }
                        form.setValue("items", newItems)
                      }}
                    />
                  ) : (
                    <Link 
                    href={{
                      pathname: '/warehouse/items/tx',
                      query: { itemName: item.itemName },
                    }}>  {item.itemName}  </Link>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="1"
                      value={form.watch(`items.${index}.quantity`)}
                      onChange={(e) => {
                        const newItems = [...form.getValues("items")]
                        newItems[index] = { 
                          ...newItems[index], 
                          quantity: Math.max(1, parseInt(e.target.value) || 1) 
                        }
                        form.setValue("items", newItems)
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
  )
}


