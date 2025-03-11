'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  itemLocationId?: string;
}

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  if (!items || !items.length) {
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
              {items.map((item, index) => (
                <TableRow key={item.itemId || index}>
                  <TableCell className="font-medium">
                    {item.itemName || "Unknown Item"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity}
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