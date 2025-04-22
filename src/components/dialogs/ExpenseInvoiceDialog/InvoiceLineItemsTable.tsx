'use client'

import {
  Table,
  TableBody,
  TableCell, // Keep TableCell for empty/loading states
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormContext, useWatch, UseFieldArrayRemove } from "react-hook-form"; // Import hooks
import { InvoiceFormData } from "@/types/type.invoice"; // Import types
import { InvoiceLineItemRow } from "./InvoiceLineItemRow"; // Import the new row component
import { useMemo } from "react";

interface InvoiceLineItemsTableProps {
  isLoading: boolean;
  orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined;
  // RHF Props
  fields: any[]; // Type from useFieldArray: FieldArrayWithId<InvoiceFormData, "lineItems", "id">[]
  remove: UseFieldArrayRemove;
}

// Helper to format currency
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "AED 0.00";
  return `AED ${amount.toFixed(2)}`;
};

export function InvoiceLineItemsTable({ isLoading, orderDetailsMap, fields, remove }: InvoiceLineItemsTableProps) {
  const { control } = useFormContext<InvoiceFormData>();

  // Watch the entire lineItems array to calculate overall total
  const lineItems = useWatch({ control, name: "lineItems" });

  const overallTotal = useMemo(() => {
    return lineItems?.reduce((sum, item) => {
      const itemTotal = (item.quantity ?? 0) * (item.rate ?? 0);
      return sum + itemTotal;
    }, 0) ?? 0;
  }, [ lineItems ]);


  return (
    <Card className="flex flex-col overflow-hidden shadow-md border h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-green-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
        <CardTitle className="text-lg font-semibold">Invoice Line Items</CardTitle>
        {/* Optional: Add button here if needed */}
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
        <ScrollArea className="flex-grow">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-100 z-10">
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Expense Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[90px] text-center">Qty</TableHead>
                <TableHead className="w-[110px] text-right">Rate</TableHead>
                <TableHead className="w-[90px] text-right">Tax %</TableHead>
                <TableHead className="w-[120px] text-right">Total</TableHead>
                <TableHead className="w-[50px] text-center">Act</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  {/* Adjust colspan */}
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Loading initial items...
                  </TableCell>
                </TableRow>
              ) : fields && fields.length > 0 ? (
                fields.map((field, index) => (
                  <InvoiceLineItemRow
                    key={field.id} // Use field.id provided by useFieldArray
                    index={index}
                    remove={remove}
                    orderDetailsMap={orderDetailsMap}
                  />
                ))
              ) : (
                <TableRow>
                  {/* Adjust colspan */}
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No invoice line items found or added.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Overall Total Footer (based on form values) */}
        {fields && fields.length > 0 && !isLoading && (
          <div className="flex justify-end items-center p-3 border-t bg-gray-50/50 flex-shrink-0">
            <span className="text-sm font-medium text-muted-foreground mr-2">Overall Total:</span>
            <span className="text-lg font-semibold text-gray-800">{formatCurrency(overallTotal)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
