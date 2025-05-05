import { memo, useEffect } from "react";
import { Control, Controller, FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { NotebookPen, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { selectExpenseSchemaType } from "@/types/expense";
import { OrderExpenseFormValues, OrderExpenseWithRHFId } from "./OrderExpenseDialog"; // Import form values type

// --- Types ---
// Use OrderExpenseWithRHFId which includes the react-hook-form `id`
export interface ExpenseItemRowProps {
    field: OrderExpenseWithRHFId; // The field object from useFieldArray
    fieldIndex: number;
    control: Control<OrderExpenseFormValues>;
    register: UseFormRegister<OrderExpenseFormValues>;
    errors: FieldErrors<OrderExpenseFormValues>;
    isExiting: boolean;
    expenseItemsData: selectExpenseSchemaType[] | undefined;
    isPending: boolean; // Renamed from isSaving for clarity
    onRemoveRequest: (fieldId: string, index: number) => void; // Callback to request removal animation + update
    visualIndex: number; // The displayed row number
    setValue: (name: any, value: any, options?: Partial<{ shouldValidate: boolean; shouldDirty: boolean; shouldTouch: boolean }>) => void; // Need setValue to update price on item change
    onOpenSackDialog: (index: number) => void; // ADDED: Prop to trigger sack dialog
    sackExpenseItemId?: string; // ADDED: The specific ID for sacks

}

export const ExpenseItemRow = memo(({
    field,
    fieldIndex,
    control,
    register,
    errors,
    isExiting,
    expenseItemsData,
    isPending,
    onRemoveRequest,
    visualIndex,
    setValue,
    onOpenSackDialog, // Destructure new prop
    sackExpenseItemId // Destructure new prop

}: ExpenseItemRowProps) => {

    // Watch values for this specific row to calculate total and check deletion status
    const quantity = useWatch({
        control,
        name: `expenses.${fieldIndex}.expenseItemQuantity`,
        defaultValue: field.expenseItemQuantity ?? 0, // Use field's initial value
    });
    const price = useWatch({
        control,
        name: `expenses.${fieldIndex}.expenseItemPrice`,
        defaultValue: field.expenseItemPrice ?? 0,
    });
    const expenseItemId = useWatch({
        control,
        name: `expenses.${fieldIndex}.expenseItemId`,
        defaultValue: field.expenseItemId ?? "",
    });

    // Calculate total based on watched values
    const total = (price ?? 0) * (quantity ?? 0);

    // Determine if marked for deletion (has existing ID and quantity is now 0)
    const isMarkedForDeletion = quantity === 0 && !!field.orderExpenseId;


    const showSackButton = expenseItemId === sackExpenseItemId && sackExpenseItemId;
    const currentSackSizes = useWatch({
        control,
        name: `expenses.${fieldIndex}.sackSizes`,
        defaultValue: field.sackSizes,
    });
    const sackCount = currentSackSizes?.reduce((sum, sack) => sum + sack.amount, 0) ?? 0;



    // Find default price (used when item changes) - no longer needed directly here, handled in Controller onChange
    // const currentExpenseItem = expenseItemsData?.find(item => item.expenseItemId === expenseItemId);
    // const defaultPrice = currentExpenseItem?.defaultExpensePrice ?? 0;

    const fieldErrors = errors.expenses?.[ fieldIndex ];
    const isSackItem = field.expenseItemId === sackExpenseItemId;

    // Determine if the input should be disabled
    // Sack items are never disabled based on your logic.
    // Other items are disabled if exiting, pending, or marked for deletion.
    const isDisabled = isSackItem ? false : isExiting || isPending || (field.expenseItemQuantity === 0 && !!field.orderExpenseId); // Assuming marked for deletion means qty is 0 for existing items

    return (
        <div
            key={field.id} // Use field.id provided by useFieldArray
            className={cn(
                "grid grid-cols-12 gap-x-2 gap-y-1 items-center py-1",
                "expense-row",
                isExiting && "expense-row-exiting",
                isMarkedForDeletion && "opacity-60",
                fieldErrors && "ring-1 ring-destructive/50 rounded", // Indicate row error
            )}
            aria-hidden={isExiting}
        >
            {/* Row Index */}
            <div className={cn("col-span-1 text-sm text-muted-foreground pl-1 font-medium", isMarkedForDeletion && "line-through")}>
                {!isExiting ? visualIndex : ''}
            </div>

            {/* Expense Select (Using Controller) */}
            <div className="col-span-4">
                <Controller
                    control={control}
                    name={`expenses.${fieldIndex}.expenseItemId`}
                    rules={{ required: "Expense item is required" }} // Add validation rules
                    render={({ field: controllerField, fieldState }) => (
                        <Select
                            value={controllerField.value}
                            onValueChange={(value) => {
                                controllerField.onChange(value); // Update RHF state
                                // Update price to default when item changes
                                const selectedItem = expenseItemsData?.find(item => item.expenseItemId === value);
                                const newPrice = selectedItem?.defaultExpensePrice ?? 0;
                                setValue(`expenses.${fieldIndex}.expenseItemPrice`, newPrice, { shouldDirty: true }); // Update price field
                                if (value === sackExpenseItemId && sackExpenseItemId) {
                                    // --- Trigger Sack Dialog ---
                                    onOpenSackDialog(fieldIndex);
                                    // --- Optionally reset quantity to 0 here, letting dialog set it ---
                                    // setValue(`expenses.${fieldIndex}.expenseItemQuantity`, 0, { shouldDirty: true });
                                } else {
                                    // --- Optional: Reset quantity if changing *away* from sack item? ---
                                    // if (controllerField.value === sackExpenseItemId) { // If previous value was sack item
                                    //    setValue(`expenses.${fieldIndex}.expenseItemQuantity`, 1, { shouldDirty: true, shouldValidate: true });
                                    // }
                                }
                            }}
                            disabled={isExiting || isPending || isMarkedForDeletion}
                        >
                            <SelectTrigger className={cn(
                                "h-8 text-sm",
                                isMarkedForDeletion && "border-dashed border-destructive/50",
                                fieldState.error && "border-destructive focus-visible:ring-destructive" // Error styling
                            )}>
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
                    )}
                />
                {/* {fieldErrors?.expenseItemId && <p className="text-xs text-destructive mt-1">{fieldErrors.expenseItemId.message}</p>} */}
            </div>

            

            {/* Quantity Input (Optimized Controller) */}
            <div className="col-span-2">
                <Controller
                    control={control}
                    name={`expenses.${fieldIndex}.expenseItemQuantity`}
                    // rules={quantityRules} // Apply rules here, NOT on an inner register
                    render={({ field: controllerField, fieldState }) => {
                        // Determine specific input props based on item type
                        const quantityInputProps = isSackItem ? {
                            onClick: () => onOpenSackDialog(fieldIndex),
                            // Sack quantity input is generally view-only, controlled by dialog.
                            // If you want to disable it *visually* but allow it to hold the value
                            // set by the dialog, explicitly disable it here.
                            // Based on your original code, it was commented out, implying not always disabled.
                            // Let's base disabled state on the outer calculated `isDisabled`.
                            disabled: isDisabled, // Use the common disabled state
                        } : {
                            // Standard item quantity input props
                            disabled: isDisabled, // Use the common disabled state
                        };

                        // Determine error styling for the quantity input specifically
                        const hasQuantityError = !!fieldState.error;

                        // Determine dashed border styling based on current value + existing item status
                        const isMarkedForDeletionVisual = controllerField.value === 0 && !!field.orderExpenseId;

                        return (
                            <Input
                                type="number"
                                min="0" // Browser constraint, works with valueAsNumber
                                className={cn(
                                    "h-8 text-sm text-center",
                                    isMarkedForDeletionVisual && "border-dashed border-destructive/50", // Styling based on value
                                    hasQuantityError && "border-destructive focus-visible:ring-destructive" // Styling based on error
                                )}
                                // Spread the props from the controller's field object
                                // This handles name, value, onChange, onBlur, and ref
                                {...controllerField}
                                // Spread the item-specific props (onClick, disabled)
                                {...quantityInputProps}
                            />
                        );
                    }}
                />
                {/* Display field error if needed */}
                {fieldErrors?.expenseItemQuantity && <p className="text-xs text-destructive mt-1">{fieldErrors.expenseItemQuantity.message}</p>}
            </div>

            {/* Price Input (Using register) */}
            <div className="col-span-2">
                <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED </span>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className={cn(
                            "pl-8 pr-1 h-8 text-sm text-center",
                            isMarkedForDeletion && "border-dashed border-destructive/50",
                            fieldErrors?.expenseItemPrice && "border-destructive focus-visible:ring-destructive" // Error styling
                        )}
                        disabled={isExiting || isPending || isMarkedForDeletion}
                        {...register(`expenses.${fieldIndex}.expenseItemPrice`, {
                            valueAsNumber: true,
                            min: { value: 0, message: "Price must be >= 0" }
                        })}
                    />
                </div>
                {/* {fieldErrors?.expenseItemPrice && <p className="text-xs text-destructive mt-1">{fieldErrors.expenseItemPrice.message}</p>} */}
            </div>

            {/* Total Display */}
            <div className="col-span-2">
                <div className={cn(
                    "bg-muted/80 px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center font-medium",
                    (isExiting || isMarkedForDeletion) && "opacity-50"
                )}>
                    AED {total.toFixed(2)}
                </div>
            </div>

            {/* Remove Button */}
            <div className="col-span-1 flex justify-center space-x-1">
                {showSackButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="h-8 w-8 disabled:opacity-30 relative"
                        onClick={() => onOpenSackDialog(fieldIndex)}
                        disabled={isExiting || isPending || isMarkedForDeletion}
                        aria-label="Edit sack sizes"
                    >
                        <Package className="h-4 w-4" />
                        {sackCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">
                                {sackCount}
                            </span>
                        )}
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8  disabled:opacity-30"
                    type="button" // Prevent form submission

                    // onClick={() => { /* TODO: Handle Note Editing */ }}
                    // Disable if already exiting, saving, or marked for deletion
                    disabled={isExiting || isPending || isMarkedForDeletion}
                    aria-label="Edit notes"
                >
                    <NotebookPen className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    type="button" // Prevent form submission
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 disabled:opacity-30"
                    onClick={() => onRemoveRequest(field.id!, fieldIndex)} // Use field.id and index
                    disabled={isExiting || isPending || isMarkedForDeletion}
                    aria-label="Remove expense"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div >
    );
});
ExpenseItemRow.displayName = "ExpenseItemRow";

