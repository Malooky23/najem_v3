'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { EnrichedOrderExpenseSchemaType } from "@/types/expense";

interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  itemLocationId?: string;
}

interface OrderItemsTableProps {
  items: EnrichedOrderExpenseSchemaType[];
  isLoading: boolean;
}

export function SelectedOrderExpensesTable({ items, isLoading }: OrderItemsTableProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-4">
          <CardTitle className="text-lg text-gray-700">Order Expenses</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <Skeleton className="h-12"/>
        </CardContent>
      </Card>
    );
  }


  if (!items || !items.length) {
    return (
      <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-2">
          <CardTitle className="text-sm text-gray-500 text-center flex justify-center items-center">
            <PackageOpen size={30} className="pr-2" />
            <p>No Items in Order</p>
          </CardTitle>
        </CardHeader>
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
              <TableHead className="w-[70%]!">#</TableHead>
              <TableHead className="w-[70%]!">Item</TableHead>
              <TableHead className="w-[30%]!">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}  className="hover:bg-gray-100/50 transition-colors">
                <TableCell>
                  {index+1}
                </TableCell>
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