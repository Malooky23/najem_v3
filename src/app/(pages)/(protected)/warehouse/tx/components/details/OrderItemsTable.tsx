import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EnrichedOrders, EnrichedOrderSchemaType } from "@/types/orders"

interface OrderItemsTableProps {
  order: EnrichedOrderSchemaType
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  return (
    <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-gray-700">Order Items</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/50">
              <TableHead className="w-[40%]">Item</TableHead>
              <TableHead className="w-[20%]">Quantity</TableHead>
              <TableHead className="w-[20%]">Price</TableHead>
              <TableHead className="w-[20%]">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items?.map((item, index) => (
              <TableRow key={index} className="hover:bg-gray-100/50 transition-colors">
                <TableCell className="font-medium">{item.itemName || item.itemId}</TableCell>
                <TableCell>{item.quantity}</TableCell>
              </TableRow>
            ))}
            {(!order.items || order.items.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No items found in this order</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}