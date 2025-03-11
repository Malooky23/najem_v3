'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

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
      <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-4">
          <CardTitle className="text-lg text-gray-700">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">No items in this order</p>
        </CardContent>
      </Card>
    );
  }

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
            {items.map((item, index) => (
              <TableRow key={item.itemId || index} className="hover:bg-gray-100/50 transition-colors">
                <TableCell className="font-medium">
                  <Link 
                    href={{
                      pathname: '/warehouse/items/tx',
                      query: { itemName: item.itemName },
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {item.itemName || "Unknown Item"}
                  </Link>
                </TableCell>
                <TableCell>
                  {item.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}