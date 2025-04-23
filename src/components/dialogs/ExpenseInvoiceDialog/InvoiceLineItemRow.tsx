// // src/components/dialogs/ExpenseInvoiceDialog/InvoiceLineItemRow.tsx
// 'use client'

// import { Controller, useFormContext, useWatch } from "react-hook-form";
// import { TableCell, TableRow } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { ChevronDown, Trash2 } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { format } from 'date-fns';
// import { InvoiceFormData } from "@/types/type.invoice";
// import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
// import { tax_id } from "@/types/types.zoho";
// import { selectExpenseSchemaType } from "@/types/expense"; // Import type
// import { Fragment } from "react";
// import { Label } from "@/components/ui/label";
// import { formatCurrency, formatDate } from "./InvoiceHelper";

// interface InvoiceLineItemRowProps {
//     index: number;
//     remove: (index: number) => void;
//     orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined;
//     expenseItemsData: selectExpenseSchemaType[] | undefined; // Add prop
// }



// export function InvoiceLineItemRow({ index, remove, orderDetailsMap, expenseItemsData }: InvoiceLineItemRowProps) {
//     const { control, getValues, setValue } = useFormContext<InvoiceFormData>(); // Add setValue

//     // Watch values for this row
//     const [ quantity, rate, orderId, orderExpenseId ] = useWatch({ // Removed expenseItemName from watch
//         control,
//         name: [
//             `lineItems.${index}.quantity`,
//             `lineItems.${index}.rate`,
//             `lineItems.${index}.orderId`,
//             `lineItems.${index}.orderExpenseId`
//         ]
//     });

//     const rowTotal = (quantity ?? 0) * (rate ?? 0);
//     const isManualItem = !orderExpenseId; // Item is manual if it doesn't have an original orderExpenseId

//     // --- Dynamic Description Logic (remains mostly the same, uses getValues) ---
//     const getDynamicDescription = (): string => {
//         const currentName = getValues(`lineItems.${index}.expenseItemName`); // Get name from form state
//         const isSackItem = currentName === "Sack Small" || currentName === "Sack Large";
//         if (isSackItem) {
//             const orderDetails = orderId ? orderDetailsMap?.get(orderId) : undefined;
//             if (orderDetails) {
//                 const formattedDate = formatDate(orderDetails.createdAt);
//                 const mark = orderDetails.orderMark ?? 'N/A';
//                 const qty = quantity ?? 0; // Use watched quantity
//                 return `Date: ${formattedDate ?? 'N/A'} | Mark: ${mark} | Total Sacks: ${qty}`;
//             }
//             return 'Loading order details...'; // Fallback if details not ready
//         }
//         const currentDescription = getValues(`lineItems.${index}.description`);
//         return currentDescription || '-';
//     };

//         return (

//             <>
//                 {/* First Row: Main Fields */}
//                 <TableRow className="align-top border-b-0 group-hover:bg-muted/50 data-[state=selected]:bg-muted">
//                     <TableCell className="font-medium text-center text-muted-foreground pt-2 pb-1 w-[50px]">{index + 1}</TableCell>

//                     {/* Item Name (Select Dropdown) */}
//                     {/* Adjust padding */}
//                     <TableCell className="pt-1 pb-1 min-w-[200px]">
//                         <Controller
//                             name={`lineItems.${index}.expenseItemId`}
//                             control={control}
//                             rules={isManualItem ? { required: "Please select an item" } : undefined}
//                             render={({ field, fieldState: { error } }) => (
//                                 <div>
//                                     <Select
//                                         value={field.value ?? ""}
//                                         onValueChange={(value) => {
//                                             field.onChange(value);
//                                             const selectedItem = expenseItemsData?.find(item => item.expenseItemId === value);
//                                             setValue(`lineItems.${index}.expenseItemName`, selectedItem?.expenseName ?? '', { shouldValidate: true });
//                                             setValue(`lineItems.${index}.rate`, selectedItem?.defaultExpensePrice ?? 0, { shouldValidate: true });
//                                             setValue(`lineItems.${index}.tax`, selectedItem?.zohoTaxId ?? tax_id.five, { shouldValidate: true });
//                                         }}
//                                         disabled={!isManualItem}
//                                     >
//                                         <SelectTrigger
//                                             ref={field.ref}
//                                             className={cn("h-8 text-sm", error && "border-destructive")}
//                                         >
//                                             <SelectValue placeholder="Select Item..." />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {expenseItemsData?.map((item) => (
//                                                 <SelectItem key={item.expenseItemId} value={item.expenseItemId}>
//                                                     {item.expenseName}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                     {error && <p className="text-xs text-destructive mt-1">{error.message}</p>}
//                                 </div>
//                             )}
//                         />
//                     </TableCell>

//                     {/* Quantity (Editable Input) */}
//                     {/* Adjust padding */}
//                     <TableCell className="pt-1 pb-1 w-[90px]">
//                         <Controller
//                             name={`lineItems.${index}.quantity`}
//                             control={control}
//                             render={({ field: { onChange, onBlur, value, ref } }) => (
//                                 <Input
//                                     ref={ref}
//                                     type="number"
//                                     min="0"
//                                     className="h-8 text-sm text-center"
//                                     value={value ?? ''}
//                                     onBlur={onBlur}
//                                     onChange={(e) => {
//                                         const num = e.target.value === '' ? null : parseInt(e.target.value, 10);
//                                         onChange(isNaN(num!) ? null : num);
//                                     }}
//                                 />
//                             )}
//                         />
//                     </TableCell>

//                     {/* Rate (Editable Input) */}
//                     {/* Adjust padding */}
//                     <TableCell className="pt-1 pb-1 w-[110px]">
//                         <Controller
//                             name={`lineItems.${index}.rate`}
//                             control={control}
//                             render={({ field: { onChange, onBlur, value, ref } }) => (
//                                 <div className="relative">
//                                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED</span>
//                                     <Input
//                                         ref={ref}
//                                         type="number"
//                                         min="0"
//                                         step="0.01"
//                                         className="h-8 text-sm text-right pr-2 pl-8"
//                                         value={value ?? ''}
//                                         onBlur={onBlur}
//                                         onChange={(e) => {
//                                             const num = e.target.value === '' ? null : parseFloat(e.target.value);
//                                             onChange(isNaN(num!) ? null : num);
//                                         }}/>
//                                 </div>
//                             )}
//                         />
//                     </TableCell>

//                     {/* Adjust padding */}
//                     <TableCell className="pt-1 pb-1 w-[100px]">
//                         <Controller
//                             name={`lineItems.${index}.tax`}
//                             control={control}
//                             render={({ field }) => (
//                                 <Select
//                                     value={field.value ?? tax_id.five}
//                                     onValueChange={field.onChange}
//                                 >
//                                     <SelectTrigger
//                                         ref={field.ref}
//                                         className="h-8 text-sm border border-input rounded-md w-full flex justify-between items-center px-2"
//                                     >
//                                         <SelectValue placeholder="Tax %" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value={tax_id.five}>5%</SelectItem>
//                                         <SelectItem value={tax_id.zero}>0%</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             )}
//                         />
//                     </TableCell>

//                     {/* Total (Calculated Display) */}
//                     {/* Adjust padding */}
//                     <TableCell className="pt-2 pb-1 w-[120px] text-right font-medium">
//                         {formatCurrency(rowTotal)}
//                     </TableCell>

//                     {/* Delete Button */}
//                     {/* Adjust padding */}
//                     <TableCell className="pt-1 pb-1 w-[50px] text-center">
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
//                             onClick={() => remove(index)}
//                             type="button"
//                             aria-label="Remove line item"
//                         >
//                             <Trash2 className="h-4 w-4" />
//                         </Button>
//                     </TableCell>
//                 </TableRow>

//                 {/* Second Row: Description */}
//                 <TableRow className="border-b group-hover:bg-muted/50 data-[state=selected]:bg-muted">
//                     <TableCell className="pt-0 pb-2" colSpan={7}>
//                         <Controller
//                             name={`lineItems.${index}.description`}
//                             control={control}
//                             render={({ field }) => (
//                                 <div className="grid w-full gap-1.5">
//                                     <Label className="text-xs text-gray-400 translate-y-3" htmlFor="message">Description</Label>
//                                     <Textarea
//                                         {...field}
//                                         rows={1}
//                                         // Add a slight top margin to the textarea itself for spacing
//                                         className="text-xs min-h-[32px] resize-y w-full mt-1 border-none  pl-4"
//                                         placeholder="Add a description..."
//                                         title={field.value ?? 'Description'}
//                                     />
//                                 </div>
//                             )}
//                         />
//                     </TableCell>
//                 </TableRow>
//             </>
//         );
//     }

// src/components/dialogs/ExpenseInvoiceDialog/InvoiceLineItemRow.tsx
'use client'

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { InvoiceFormData } from "@/types/type.invoice";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { tax_id } from "@/types/types.zoho";
import { selectExpenseSchemaType } from "@/types/expense";
import { Fragment } from "react"; // Keep Fragment
import { Label } from "@/components/ui/label";

interface InvoiceLineItemRowProps {
    index: number;
    remove: (index: number) => void;
    orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined;
    expenseItemsData: selectExpenseSchemaType[] | undefined;
}

const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "AED 0.00";
    return `AED ${amount.toFixed(2)}`;
};

const formatDate = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    try {
        return format(new Date(date), 'yyyy-MM-dd');
    } catch { return 'Invalid Date'; }
};

export function InvoiceLineItemRow({ index, remove, orderDetailsMap, expenseItemsData }: InvoiceLineItemRowProps) {
    const { control, getValues, setValue } = useFormContext<InvoiceFormData>();

    const [ quantity, rate, orderId, orderExpenseId ] = useWatch({
        control,
        name: [
            `lineItems.${index}.quantity`,
            `lineItems.${index}.rate`,
            `lineItems.${index}.orderId`,
            `lineItems.${index}.orderExpenseId`
        ]
    });

    const rowTotal = (quantity ?? 0) * (rate ?? 0);
    const isManualItem = !orderExpenseId;

    // --- Dynamic Description Logic (no changes needed here) ---
    const getDynamicDescription = (): string => {
        const currentName = getValues(`lineItems.${index}.expenseItemName`);
        const isSackItem = currentName === "Sack Small" || currentName === "Sack Large";
        if (isSackItem) {
            const orderDetails = orderId ? orderDetailsMap?.get(orderId) : undefined;
            if (orderDetails) {
                const formattedDate = formatDate(orderDetails.createdAt);
                const mark = orderDetails.orderMark ?? 'N/A';
                const qty = quantity ?? 0;
                return `Date: ${formattedDate ?? 'N/A'} | Mark: ${mark} | Total Sacks: ${qty}`;
            }
            return 'Loading order details...';
        }
        const currentDescription = getValues(`lineItems.${index}.description`);
        return currentDescription || '-';
    };

    // Return the Fragment containing the two rows.
    // These will now be rendered inside the dedicated tbody created by the parent.
    return (
        <Fragment>
            {/* First Row: Main Fields */}
            {/* Remove border-b-0 from the first row */}
            <TableRow className="align-top border-b-0 group-hover:bg-muted/50 data-[state=selected]:bg-muted">
                <TableCell className="font-medium text-center text-muted-foreground pt-2 pb-1 w-[50px]">{index + 1}</TableCell>

                {/* Item Name (Select Dropdown) */}
                <TableCell className="pt-1 pb-1 min-w-[200px]">
                    <Controller
                        name={`lineItems.${index}.expenseItemId`}
                        control={control}
                        rules={isManualItem ? { required: "Please select an item" } : undefined}
                        render={({ field, fieldState: { error } }) => (
                            <div>
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        const selectedItem = expenseItemsData?.find(item => item.expenseItemId === value);
                                        setValue(`lineItems.${index}.expenseItemName`, selectedItem?.expenseName ?? '', { shouldValidate: true });
                                        setValue(`lineItems.${index}.rate`, selectedItem?.defaultExpensePrice ?? 0, { shouldValidate: true });
                                        setValue(`lineItems.${index}.tax`, selectedItem?.zohoTaxId ?? tax_id.five, { shouldValidate: true });
                                        // Update description only if it's a sack item after changing the item type
                                        // const newName = selectedItem?.expenseName;
                                        // if (newName === "Sack Small" || newName === "Sack Large") {
                                        //     setValue(`lineItems.${index}.description`, getDynamicDescription(), { shouldValidate: false }); // Update dynamic description
                                        // } else if (getValues(`lineItems.${index}.description`)?.startsWith('Date:')) {
                                        //     // Clear description if it was previously a sack description
                                        //     setValue(`lineItems.${index}.description`, '', { shouldValidate: false });
                                        // }
                                    }}
                                    disabled={!isManualItem}
                                >
                                    <SelectTrigger
                                        ref={field.ref}
                                        className={cn("h-8 text-sm", error && "border-destructive")}
                                    >
                                        <SelectValue placeholder="Select Item..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {expenseItemsData?.map((item) => (
                                            <SelectItem key={item.expenseItemId} value={item.expenseItemId}>
                                                {item.expenseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {error && <p className="text-xs text-destructive mt-1">{error.message}</p>}
                            </div>
                        )}
                    />
                </TableCell>

                {/* Quantity (Editable Input) */}
                <TableCell className="pt-1 pb-1 w-[90px]">
                    <Controller
                        name={`lineItems.${index}.quantity`}
                        control={control}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                            <Input
                                ref={ref}
                                type="number"
                                min="0"
                                className="h-8 text-sm text-center"
                                value={value ?? ''}
                                onBlur={onBlur}
                                onChange={(e) => {
                                    const num = e.target.value === '' ? null : parseInt(e.target.value, 10);
                                    onChange(isNaN(num!) ? null : num);
                                    // Update description if it's a sack item when quantity changes
                                    // if (getValues(`lineItems.${index}.expenseItemName`) === "Sack Small" || getValues(`lineItems.${index}.expenseItemName`) === "Sack Large") {
                                    //     setValue(`lineItems.${index}.description`, getDynamicDescription(), { shouldValidate: false });
                                    // }
                                }}
                            />
                        )}
                    />
                </TableCell>

                {/* Rate (Editable Input) */}
                <TableCell className="pt-1 pb-1 w-[110px]">
                    <Controller
                        name={`lineItems.${index}.rate`}
                        control={control}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED</span>
                                <Input
                                    ref={ref}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-8 text-sm text-right pr-2 pl-8"
                                    value={value ?? ''}
                                    onBlur={onBlur}
                                    onChange={(e) => {
                                        const num = e.target.value === '' ? null : parseFloat(e.target.value);
                                        onChange(isNaN(num!) ? null : num);
                                    }} />
                            </div>
                        )}
                    />
                </TableCell>

                {/* Tax */}
                <TableCell className="pt-1 pb-1 w-[100px]">
                    <Controller
                        name={`lineItems.${index}.tax`}
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value ?? tax_id.five}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger
                                    ref={field.ref}
                                    className="h-8 text-sm border border-input rounded-md w-full flex justify-between items-center px-2"
                                >
                                    <SelectValue placeholder="Tax %" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={tax_id.five}>5%</SelectItem>
                                    <SelectItem value={tax_id.zero}>0%</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </TableCell>

                {/* Total (Calculated Display) */}
                <TableCell className="pt-2 pb-1 w-[120px] text-right font-medium">
                    {formatCurrency(rowTotal)}
                </TableCell>

                {/* Delete Button */}
                <TableCell className="pt-1 pb-1 w-[50px] text-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        type="button"
                        aria-label="Remove line item"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>

            {/* Second Row: Description */}
            {/* Keep border-b on the second row (it will be the last row in its tbody) */}
            <TableRow className="border-b group-hover:bg-muted/50 data-[state=selected]:bg-muted">
                <TableCell className="pt-0 pb-2" colSpan={7}>
                    <Controller
                        name={`lineItems.${index}.description`}
                        control={control}
                        render={({ field }) => (
                            <div className="grid w-full gap-1.5 pl-10"> {/* Add padding-left to align with item name */}
                                <Label className="text-xs text-gray-400" htmlFor={`description-${index}`}>Description</Label>
                                <Textarea
                                    {...field}
                                    id={`description-${index}`}
                                    rows={1}
                                    className="text-xs min-h-[32px] resize-y w-full mt-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-2" // Simplified styling
                                    placeholder="Add a description..."
                                    title={field.value ?? 'Description'}
                                    // Disable textarea if it's a dynamically generated description for sacks
                                    // disabled={(getValues(`lineItems.${index}.expenseItemName`) === "Sack Small" || getValues(`lineItems.${index}.expenseItemName`) === "Sack Large")}
                                />
                            </div>
                        )}
                    />
                </TableCell>
            </TableRow>
        </Fragment>
    );
}