"use client"

import {  memo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createOrderExpenseSchema, createOrderExpenseSchemaType, selectExpenseSchemaType } from "@/types/expense";
import { z } from "zod";


// --- Types ---
type CreateOrderExpenseItem = z.infer<typeof createOrderExpenseSchema.element>;
type OrderExpenseWithClient = CreateOrderExpenseItem & { clientId: number };

// --- Constants ---

// --- Helper Components ---
export type InitialExpenseData = Omit<OrderExpenseWithClient, 'clientId'>;

interface ExpenseItemRowProps {
    expense: OrderExpenseWithClient;
    index: number;
    isExiting: boolean;
    expenseItemsData: selectExpenseSchemaType[] | undefined;
    isPending: boolean;
    onUpdate: (clientId: number, field: keyof CreateOrderExpenseItem, value: any) => void;
    onRemove: (clientId: number) => void;
}

export const ExpenseItemRow = memo(({
    expense,
    index,
    isExiting,
    expenseItemsData,
    isPending,
    onUpdate,
    onRemove
}: ExpenseItemRowProps) => {
    const currentExpenseItem = expenseItemsData?.find(item => item.expenseItemId === expense.expenseItemId);
    const currentPriceInState = currentExpenseItem?.defaultExpensePrice ?? 0;

    const quantity = expense.expenseItemQuantity ?? 0; // Default/handle 0 quantity
    const total = expense.expenseItemPrice * quantity;
    const isMarkedForDeletion = quantity === 0 && !!expense.orderExpenseId; // Visually indicate if marked for delete
    
    return (
        <div
            key={expense.clientId}
            className={cn(
                "grid grid-cols-12 gap-x-2 gap-y-1 items-center py-1",
                "expense-row",
                isExiting && "expense-row-exiting",
                isMarkedForDeletion && "opacity-60", // Style rows marked for deletion differently
            )}
            aria-hidden={isExiting}
        >
            {/* Row Index */}
            <div className={cn("col-span-1 text-sm text-muted-foreground pl-1 font-medium", isMarkedForDeletion && "line-through")}>
                {!isExiting ? index : ''}
            </div>

            {/* Expense Select */}
            <div className="col-span-4">
                <Select
                    value={expense.expenseItemId}
                    onValueChange={(value) => onUpdate(expense.clientId, "expenseItemId", value)}
                    // Disable if exiting, saving, or marked for deletion (can't change category of item to be deleted)
                    disabled={isExiting || isPending || isMarkedForDeletion}
                >
                    <SelectTrigger className={cn("h-8 text-sm", isMarkedForDeletion && "border-dashed border-destructive/50")}>
                        <SelectValue placeholder="Select Expense" />
                    </SelectTrigger>
                    <SelectContent>
                        {expenseItemsData?.map((item) => (
                            <SelectItem key={item.expenseItemId} value={item.expenseItemId}>
                                {item.expenseName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Quantity Input */}
            <div className="col-span-2">
                <Input
                    type="number"
                    // min="1" REMOVED: Allow 0 for visual representation after deletion
                    className={cn("h-8 text-sm text-center", isMarkedForDeletion && "border-dashed border-destructive/50")}
                    value={quantity} // Display 0 if quantity is 0
                    onChange={(e) => onUpdate(expense.clientId, "expenseItemQuantity", e.target.value)}
                    // Disable if exiting, saving, or marked for deletion (quantity is controlled by remove button)
                    disabled={isExiting || isPending || isMarkedForDeletion}
                />
            </div>

            {/* Price Display */}
            {/* <div className="col-span-2">
                <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED </span>
                    <Input
                        type="number"
                        className="pl-4 pr-1 h-8 text-sm text-center"
                        value={currentExpensePrice.toFixed(2)}
                        readOnly
                        disabled={isExiting || isPending} // Visually disable (price follows category)
                    />
                </div>
            </div> */}

            <div className="col-span-2">
                <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED </span>
                    <Input
                        type="number"
                        step="0.01" // Allow decimal input for currency
                        min="0" // Price shouldn't be negative
                        className={cn("pl-8 pr-1 h-8 text-sm text-center", isMarkedForDeletion && "border-dashed border-destructive/50")} // Adjusted padding
                        // Use the price from the state; handle potential empty string during typing
                        value={expense.expenseItemPrice === undefined || expense.expenseItemPrice === null ? '' : expense.expenseItemPrice.toString()}
                        // value={currentPriceInState.toFixed(2)}

                        onChange={(e) => {
                            const rawValue = e.target.value;
                            // Allow empty input temporarily, treat as 0 for state update
                            const numValue = rawValue === '' ? 0 : parseFloat(rawValue);
                            // Update state with the number, ensuring it's not NaN (default to 0 if invalid)
                            onUpdate(expense.clientId, "expenseItemPrice", isNaN(numValue) ? 0 : numValue);
                        }}
                        disabled={isExiting || isPending || isMarkedForDeletion}
                    />
                </div>
            </div>

            {/* Total Display */}
            <div className="col-span-2">
                <div className={cn(
                    "bg-muted/80 px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center font-medium",
                    (isExiting || isMarkedForDeletion) && "opacity-50" // Fade out total if row is exiting or deleted
                )}>
                    AED {total.toFixed(2)}
                </div>
            </div>

            {/* Remove Button */}
            <div className="col-span-1 flex justify-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 disabled:opacity-30"
                    onClick={() => onRemove(expense.clientId)}
                    // Disable if already exiting, saving, or marked for deletion (can't remove twice)
                    disabled={isExiting || isPending || isMarkedForDeletion}
                    aria-label="Remove expense"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});
ExpenseItemRow.displayName = "ExpenseItemRow";
