import { EnrichedOrders } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface OrderItemsTableProps {
  order: EnrichedOrders;
  isEditing: boolean;
  updateOrderItems: (newItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    itemLocationId: string;
  }>) => void;
}

export function OrderItemsTable({ order, isEditing, updateOrderItems }: OrderItemsTableProps) {
  // Safely cast and handle potentially undefined orderItems
  const orderItems = Array.isArray(order.items) ? order.items : [];


  if (!orderItems.length) {
    return (
      <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Order Items</CardTitle>
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
        <CardTitle className="text-lg font-bold">Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {isEditing ? (
                      <Input value={item.itemName || "Unknown Item"} onChange={(e) => {
                        const newItems = [...orderItems];
                        newItems[index] = { ...newItems[index], itemName: e.target.value };
                        updateOrderItems(newItems);

                      }}/>
                    ) : (
                      item.itemName || "Unknown Item"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                  {isEditing ? (
                      <Input 
                        type="number"
                        min="1"
                        value={item.quantity} 
                        onChange={(e) => {
                          const newItems = [...orderItems];
                          newItems[index] = { 
                            ...newItems[index], 
                            quantity: Number(e.target.value) || 1 
                          };
                          updateOrderItems(newItems);
                        }}/>
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
