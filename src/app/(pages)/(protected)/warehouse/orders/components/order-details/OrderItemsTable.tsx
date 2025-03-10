import { EnrichedOrders } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderItemsTableProps {
  order: EnrichedOrders;
}

interface OrderItemDisplayProps {
  id?: string;
  itemId: string;
  item?: {
    name: string;
    [key: string]: any;
  };
  quantity?: number;
  unitPrice?: number;
  [key: string]: any;
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  // Safely cast and handle potentially undefined orderItems
  const orderItems = Array.isArray(order.items) ? order.items : [];

  if (!orderItems.length) {
    return (
      <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">No items in this order</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Item #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={ index}>
                  <TableCell className="font-medium">{item.itemId}</TableCell>
                  <TableCell>{item.itemName || "Unknown Item"}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50">
                <TableCell colSpan={4} className="text-right font-medium">Total</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
