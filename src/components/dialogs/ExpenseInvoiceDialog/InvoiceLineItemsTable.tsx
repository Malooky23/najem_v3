// // src/components/dialogs/ExpenseInvoiceDialog/InvoiceLineItemsTable.tsx
// 'use client'

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useFormContext, useWatch, UseFieldArrayRemove, UseFieldArrayAppend } from "react-hook-form"; // Import UseFieldArrayAppend
// import { InvoiceFormData, LineItemFormData } from "@/types/type.invoice"; // Import types
// import { InvoiceLineItemRow } from "./InvoiceLineItemRow";
// import { useMemo } from "react";
// import { Button } from "@/components/ui/button"; // Import Button
// import { Plus } from "lucide-react"; // Import Plus icon
// import { tax_id } from "@/types/types.zoho"; // Import tax_id for default value
// import { selectExpenseSchemaType } from "@/types/expense"; // Import type
// import { formatCurrency } from "./InvoiceHelper";

// interface InvoiceLineItemsTableProps {
//   isLoading: boolean;
//   orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined;
//   // RHF Props
//   fields: any[];
//   remove: UseFieldArrayRemove;
//   append: UseFieldArrayAppend<InvoiceFormData, "lineItems">;
//   isProcessing: boolean;
//   expenseItemsData: selectExpenseSchemaType[] | undefined; // Add prop
// }

// export function InvoiceLineItemsTable({
//     isLoading,
//     orderDetailsMap,
//     fields,
//     remove,
//     append,
//     isProcessing,
//     expenseItemsData // Destructure prop
// }: InvoiceLineItemsTableProps) {
//   const { control } = useFormContext<InvoiceFormData>();

//   // Watch the entire lineItems array to calculate overall total
//   const lineItems = useWatch({ control, name: "lineItems" });

//   const overallTotal = useMemo(() => {
//     return lineItems?.reduce((sum, item) => {
//       const itemTotal = (item.quantity ?? 0) * (item.rate ?? 0);
//       return sum + itemTotal;
//     }, 0) ?? 0;
//   }, [ lineItems ]);

//   // --- Handler to add a new line item ---
//   const handleAddLineItem = () => {
//     const defaultNewLineItem: LineItemFormData = {
//         // No orderExpenseId, orderId, orderNumber as it's manual
//         // expenseItemId: "MANUAL",
//         expenseItemName: "", // Start empty, user must fill
//         description: "",
//         quantity: 1,
//         rate: 0,
//         tax: tax_id.five, // Default tax
//         // orderNumber: 0,
//         // orderExpenseId:""
//     };
//     append(defaultNewLineItem);
//   };

//   return (
//     <Card className="flex flex-col overflow-hidden shadow-md border h-full">
//       <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-green-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
//         <CardTitle className="text-lg font-semibold">Invoice Line Items</CardTitle>
//         {/* --- Add Item Button --- */}
//         <Button
//             onClick={handleAddLineItem}
//             variant="outline" size="sm"
//             className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
//             disabled={isProcessing || isLoading} // Disable when processing or initial loading
//         >
//             <Plus className="h-4 w-4" /> Add Invoice Item
//         </Button>
//       </CardHeader>

//       <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
//         <ScrollArea className="flex-grow">
//           <Table>
//             <TableHeader className="sticky top-0 bg-gray-100 z-10">
//               <TableRow>
//                 <TableHead className="w-[50px] text-center">#</TableHead>
//                 <TableHead>Item Name</TableHead> {/* Changed from Expense Item */}
//                 <TableHead className="w-[90px] text-center">Qty</TableHead>
//                 <TableHead className="w-[110px] text-center">Rate</TableHead>
//                 <TableHead className="w-[100px] text-center">Tax</TableHead> {/* Adjusted width/label */}
//                 <TableHead className="w-[120px] text-center">Total</TableHead>
//                 <TableHead className="w-[50px] text-center"></TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {isLoading && fields.length === 0 ? ( // Show loading only if fields are empty
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
//                     Loading initial items...
//                   </TableCell>
//                 </TableRow>
//               ) : fields && fields.length > 0 ? (
//                 // fields.map((field, index) => (

//                 //   <InvoiceLineItemRow
//                 //     key={field.id}
//                 //     index={index}
//                 //     remove={remove}
//                 //     orderDetailsMap={orderDetailsMap}
//                 //     expenseItemsData={expenseItemsData} // Pass data down
//                 //   />
//                 // ))

//                   fields.map((field, index) => (
//                     // Wrap each InvoiceLineItemRow in its own tbody
//                     // Move the key to the tbody element
//                     <TableBody key={field.id} className="border-b last:border-b-0"> {/* Add border to tbody */}
//                       <InvoiceLineItemRow
//                         index={index}
//                         remove={remove}
//                         orderDetailsMap={orderDetailsMap}
//                         expenseItemsData={expenseItemsData}
//                       />
//                     </TableBody>
//                   ))

//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
//                     No invoice line items found or added. Click "Add Item".
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </ScrollArea>

//         {/* Overall Total Footer (based on form values) */}
//         {fields && fields.length > 0 && ( // Show total even during loading if fields exist
//           <div className="flex justify-end items-center p-3 border-t bg-gray-50/50 flex-shrink-0">
//             <span className="text-sm font-medium text-muted-foreground mr-2">Overall Total:</span>
//             <span className="text-lg font-semibold text-gray-800">{formatCurrency(overallTotal)}</span>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// src/components/dialogs/ExpenseInvoiceDialog/InvoiceLineItemsTable.tsx
'use client'

import {
  Table,
  TableBody, // Keep TableBody for the main structure if needed, or remove if only using multiple tbody
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFormContext, useWatch, UseFieldArrayRemove, UseFieldArrayAppend } from "react-hook-form";
import { InvoiceFormData, LineItemFormData } from "@/types/type.invoice";
import { InvoiceLineItemRow } from "./InvoiceLineItemRow";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { tax_id } from "@/types/types.zoho";
import { selectExpenseSchemaType } from "@/types/expense";
import { formatCurrency } from "./InvoiceHelper";

interface InvoiceLineItemsTableProps {
  isLoading: boolean;
  orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined;
  fields: any[];
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<InvoiceFormData, "lineItems">;
  isProcessing: boolean;
  expenseItemsData: selectExpenseSchemaType[] | undefined;
}

export function InvoiceLineItemsTable({
  isLoading,
  orderDetailsMap,
  fields,
  remove,
  append,
  isProcessing,
  expenseItemsData
}: InvoiceLineItemsTableProps) {
  const { control } = useFormContext<InvoiceFormData>();
  const lineItems = useWatch({ control, name: "lineItems" });

  const overallTotal = useMemo(() => {
    return lineItems?.reduce((sum, item) => {
      const itemTotal = (item.quantity ?? 0) * (item.rate ?? 0);
      return sum + itemTotal;
    }, 0) ?? 0;
  }, [ lineItems ]);

  const handleAddLineItem = () => {
    const defaultNewLineItem: LineItemFormData = {
      expenseItemName: "",
      description: "",
      quantity: 1,
      rate: 0,
      tax: tax_id.five,
    };
    append(defaultNewLineItem);
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-md border h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-green-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
        <CardTitle className="text-lg font-semibold">Invoice Line Items</CardTitle>
        <Button
          onClick={handleAddLineItem}
          variant="outline" size="sm"
          className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
          disabled={isProcessing || isLoading}
          type="button"
        >
          <Plus className="h-4 w-4" /> Add Invoice Item
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
        <ScrollArea className="flex-grow">
          {/* Use role="table" for accessibility if not using native table elements throughout */}
          <Table>
            <TableHeader className="sticky top-0 bg-gray-100 z-10">
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="w-[90px] text-center">Qty</TableHead>
                <TableHead className="w-[110px] text-center">Rate</TableHead>
                <TableHead className="w-[100px] text-center">Tax</TableHead>
                <TableHead className="w-[120px] text-center">Total</TableHead>
                <TableHead className="w-[50px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            {/* Remove the single TableBody wrapper */}
            {/* Map fields to individual tbody elements */}
            {isLoading && fields.length === 0 ? (
              // Show loading message within a single tbody/row structure for consistency
              <tbody>
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading initial items...
                  </TableCell>
                </TableRow>
              </tbody>
            ) : fields && fields.length > 0 ? (
              fields.map((field, index) => (
                // Wrap each InvoiceLineItemRow in its own tbody
                // Move the key to the tbody element
                <tbody key={field.id} className="group border-b last:border-b-0">
                  <InvoiceLineItemRow
                    index={index}
                    remove={remove}
                    orderDetailsMap={orderDetailsMap}
                    expenseItemsData={expenseItemsData}
                  />
                </tbody>
              ))
            ) : (
              // Show empty message within a single tbody/row structure
              <tbody>
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No invoice line items found or added. Click "Add Item".
                  </TableCell>
                </TableRow>
              </tbody>
            )}
          </Table>
        </ScrollArea>

        {fields && fields.length > 0 && (
          <div className="flex justify-end items-center p-3 border-t bg-gray-50/50 flex-shrink-0">
            <span className="text-sm font-medium text-muted-foreground mr-2">Overall Total:</span>
            <span className="text-lg font-semibold text-gray-800">{formatCurrency(overallTotal)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}