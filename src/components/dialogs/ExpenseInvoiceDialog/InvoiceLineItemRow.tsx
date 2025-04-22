// src/components/dialogs/ExpenseInvoiceDialog/InvoiceLineItemRow.tsx
'use client'

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for description
import { ChevronDown, SquareChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { InvoiceFormData } from "@/types/type.invoice";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { tax_id } from "@/types/types.zoho";

interface InvoiceLineItemRowProps {
    index: number;
    remove: (index: number) => void;
    orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined;
    // No need to pass field object, Controller handles it via name
}

// Helper to format currency (can be moved to utils)
const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "AED 0.00";
    return `AED ${amount.toFixed(2)}`;
};

// Helper to format date (can be moved to utils)
const formatDate = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    try {
        return format(new Date(date), 'yyyy-MM-dd');
    } catch { return 'Invalid Date'; }
};

export function InvoiceLineItemRow({ index, remove, orderDetailsMap }: InvoiceLineItemRowProps) {
    const { control, getValues } = useFormContext<InvoiceFormData>(); // Get form context

    // Watch quantity and rate for this specific row to calculate total
    const [quantity, rate, expenseItemName, orderId, notes] = useWatch({
        control,
        name: [
            `lineItems.${index}.quantity`,
            `lineItems.${index}.rate`,
            `lineItems.${index}.expenseItemName`,
            `lineItems.${index}.orderId`,
            `lineItems.${ index }.description`        
        ]
    });

    const rowTotal = (quantity ?? 0) * (rate ?? 0);

    // --- Dynamic Description Logic ---
    const getDynamicDescription = (): string => {
        const isSackItem = expenseItemName === "Sack Small" || expenseItemName === "Sack Large";
        if (isSackItem) {
            const orderDetails = orderId ? orderDetailsMap?.get(orderId) : undefined;
            if (orderDetails) {
                const formattedDate = formatDate(orderDetails.createdAt);
                const mark = orderDetails.orderMark ?? 'N/A';
                const qty = quantity ?? 0; // Use watched quantity
                return `Date: ${formattedDate ?? 'N/A'} | Mark: ${mark} | Total Sacks: ${qty}`;
            }
            return 'Loading order details...'; // Fallback if details not ready
        }
        // Use the value from the form field if not a sack item, fallback to original notes?
        // For simplicity, let's just return the form field value or '-'
        const currentDescription = getValues(`lineItems.${index}.description`);
        return currentDescription || '-';
    };
    // Note: We might want the description field itself to *default* to this dynamic value
    // but also be editable. This requires setting the default value in the parent useEffect/reset.

    return (
        <TableRow>
            {/* Line Number */}
            <TableCell className="font-medium text-center text-muted-foreground">{index + 1}</TableCell>

            {/* Expense Item Name (Non-editable display) */}
            <TableCell>{expenseItemName ?? 'N/A'}</TableCell>

            {/* Description (Editable Textarea) */}
            <TableCell className="max-w-[250px]">
                <Controller
                    name={`lineItems.${index}.description`}
                    control={control}
                    // defaultValue={getDynamicDescription()} // Set initial default here? Risky with reset. Better to set in parent.
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            // value={field.value ?? getDynamicDescription()}
                            rows={2} // Keep it small initially
                            className="text-xs min-h-[32px] resize-y" // Allow vertical resize
                            placeholder="Description"
                            title={field.value ?? 'title'} // Show full value on hover
                        />
                    )}
                />
            </TableCell>

            {/* Quantity (Editable Input) */}
            <TableCell className="w-[90px]">
                <Controller
                    name={`lineItems.${index}.quantity`}
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <Input
                            ref={ref}
                            type="number"
                            min="0" // Or 1 if 0 means delete
                            className="h-8 text-sm text-center"
                            value={value ?? ''}
                            onBlur={onBlur}
                            onChange={(e) => {
                                const num = e.target.value === '' ? null : parseInt(e.target.value, 10);
                                onChange(isNaN(num!) ? null : num); // Store as number or null
                            }}
                        />
                    )}
                />
            </TableCell>

            {/* Rate (Editable Input) */}
            <TableCell className="w-[110px]">
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
                                className="h-8 text-sm text-right pr-2 pl-8" // Adjust padding
                                value={value ?? ''}
                                onBlur={onBlur}
                                onChange={(e) => {
                                    const num = e.target.value === '' ? null : parseFloat(e.target.value);
                                    onChange(isNaN(num!) ? null : num); // Store as number or null
                                }}
                            />
                        </div>
                    )}
                />
            </TableCell>

            {/* Tax (Editable Input - Placeholder) */}
            {/* <TableCell className="w-[90px]">
                <Controller
                    name={`lineItems.${index}.tax`}
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                         <div className="relative">
                             <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                             <Input
                                ref={ref}
                                type="number"
                                min="0"
                                className="h-8 text-sm text-right pr-6" // Adjust padding
                                placeholder="Tax %"
                                value={value ?? ''}
                                onBlur={onBlur}
                                onChange={(e) => {
                                    const num = e.target.value === '' ? null : parseFloat(e.target.value);
                                    onChange(isNaN(num!) ? null : num);
                                }}
                            />
                            <Select>
                                <SelectTrigger>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={"5293485000000114027"}>5%</SelectItem>
                                    <SelectItem value="5293485000000114033">0%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />
            </TableCell> */}
            <TableCell className="w-[100px]">
                <Controller
                    name={`lineItems.${index}.tax`}
                    control={control}
                    render={({ field }) => (
                        <Select
                            // Use the Zoho Tax ID string directly from the form state
                            // Default to zero tax ID if value is somehow undefined/null
                            value={field.value ?? tax_id.five}
                            // Pass the selected Zoho Tax ID string directly to onChange
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger
                                ref={field.ref} // Attach ref
                                className="h-8 text-sm border border-input rounded-md w-full flex justify-between items-center px-4 "
                            >
                                
                                <SelectValue placeholder="Tax %" /> 
                                <ChevronDown className="h-4 w-4 " />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Use Zoho Tax IDs as the values */}
                                <SelectItem value={tax_id.five}>5%</SelectItem>
                                <SelectItem value={tax_id.zero}>0%</SelectItem>
                            </SelectContent>
                        </Select>

                        
                    )}
                />
            </TableCell>


            {/* Total (Calculated Display) */}
            <TableCell className="w-[120px] text-right font-medium">
                {formatCurrency(rowTotal)}
            </TableCell>

            {/* Delete Button */}
            <TableCell className="w-[50px] text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => remove(index)}
                    type="button" // Important: Prevent form submission
                    aria-label="Remove line item"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
