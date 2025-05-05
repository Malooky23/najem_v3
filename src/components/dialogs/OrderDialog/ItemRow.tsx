import React, { useState } from "react";
import { Plus, Minus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComboboxForm } from "@/components/ui/combobox";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

// --- Interfaces ---
interface Item {
    itemId: string;
    itemName: string;
    customerId: string;
    quantity?: number;
    itemLocationId?: string;
}

interface ItemOption {
    label: string;
    value: string;
}

interface CommonViewProps {
    index: number;
    form: UseFormReturn<any>; // Use appropriate form type if available
    itemOptions: ItemOption[];
    handleDelete: () => void;
    isDeleting: boolean;
    items: Item[]; // Keep items for customerId logic in onChange
}

interface ItemRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    index: number;
    // Removed individual field props as they are handled by react-hook-form
    items: Item[];
    onRemove: () => void;
}

// --- Mobile View Component ---
const MobileItemRowView: React.FC<CommonViewProps> = ({
    index,
    form,
    itemOptions,
    handleDelete,
    isDeleting,
    items
}) => {
    const itemIdFieldName = `items.${index}.itemId`;
    const quantityFieldName = `items.${index}.quantity`;
    const itemLocationIdFieldName = `items.${index}.itemLocationId`;

    const handleItemChange = (value: string) => {
        const currentCustomerId = form.watch('customerId');
        if (!currentCustomerId || currentCustomerId === "") {
            const selectedItem = items?.find(item => item.itemId === value);
            if (selectedItem?.customerId) {
                form.setValue('customerId', selectedItem.customerId, { shouldValidate: true, shouldDirty: true });
            }
        }
        // Note: ComboboxForm should handle setting the value for itemIdFieldName via its name prop
    };

    return (
        // <td colSpan={3} className="md:hidden border-0 py-2 p-0 w-[100vw]">
        <td colSpan={3} className="md:hidden border-0 py-2 p-1">
            {/* <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-100"> */}
            <div className=" flex flex-col bg-white rounded-lg shadow-sm border border-gray-300 w-full">

                {/* Mobile header */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg border-b">
                    <div className="flex items-center">
                        {/* <GripVertical className="h-4 w-4 text-gray-400 mr-2" /> */}
                        <span className="font-medium text-sm text-gray-700">Item {index + 1}</span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Item selection */}
                <div className="p-3 border-b ">
                    {/* <div className="text-sm font-medium text-gray-600 mb-1.5">Item</div> */}
                    <ComboboxForm
                        isModal={true}
                        name={itemIdFieldName}
                        options={itemOptions}
                        placeholder="Select an item"
                        // className="w-[90vw]"
                        className="w-full"

                        onChange={handleItemChange}
                    />
                    {/* Hidden location ID - value set directly */}
                    <input
                        type="hidden"
                        {...form.register(itemLocationIdFieldName)}
                        value={'4e176e92-e833-44f5-aea9-0537f980fb4b'} // Or dynamically set if needed
                    />
                </div>

                {/* Quantity controls */}
                <div className="p-3">
                    <FormField
                        control={form.control}
                        name={quantityFieldName}
                        render={({ field }) => (
                            <FormItem>
                                {/* <div className="text-sm font-medium text-gray-600 mb-1.5">Quantity</div> */}
                                <FormControl>
                                    <div className="flex items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-l-md border-r-0"
                                            onClick={() => field.onChange(Math.max(1, Number(field.value || 0) - 1))}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            placeholder="Qty"
                                            className="h-9 rounded-none text-center border-x-0 max-w-[80px]"
                                            type="number" // Use type number for better semantics/mobile keyboards
                                            min="1"
                                            {...field}
                                            // Ensure value is always a number for calculations
                                            value={Number(field.value || 0)}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value, 10);
                                                field.onChange(isNaN(val) || val < 1 ? 1 : val);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-r-md border-l-0"
                                            onClick={() => field.onChange(Number(field.value || 0) + 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage className="mt-1" />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </td>
    );
};

// --- Desktop View Component ---
const DesktopItemRowView: React.FC<CommonViewProps> = ({
    index,
    form,
    itemOptions,
    handleDelete,
    isDeleting,
    items
}) => {
    const itemIdFieldName = `items.${index}.itemId`;
    const quantityFieldName = `items.${index}.quantity`;
    const itemLocationIdFieldName = `items.${index}.itemLocationId`;

    const handleItemChange = (value: string) => {
        const currentCustomerId = form.watch('customerId');
        if (!currentCustomerId || currentCustomerId === "") {
            const selectedItem = items?.find(item => item.itemId === value);
            if (selectedItem?.customerId) {
                form.setValue('customerId', selectedItem.customerId, { shouldValidate: true, shouldDirty: true });
            }
        }
        // Note: ComboboxForm should handle setting the value for itemIdFieldName via its name prop
    };

    return (
        <>
            {/* Desktop index */}
            <td className="pl-2 text-slate-500 text-xs text-left hidden md:table-cell md:w-fit">{index + 1}</td>

            {/* Desktop Item selection */}
            <td className="py-1 px-2 hidden md:table-cell min-w-0">
                <div className="overflow-hidden">
                    <ComboboxForm
                        isModal={true}
                        name={itemIdFieldName}
                        options={itemOptions}
                        placeholder="Select an item"
                        className="w-full min-w-[120px] max-w-full"
                        onChange={handleItemChange} // Pass derived handler
                    />
                    {/* Hidden location ID */}
                    <input
                        type="hidden"
                        {...form.register(itemLocationIdFieldName)}
                        value={'4e176e92-e833-44f5-aea9-0537f980fb4b'} // Or dynamically set if needed
                    />
                </div>
            </td>

            {/* Desktop Quantity */}
            <td className="py-2 px-4 hidden md:table-cell text-center">
                <FormField
                    control={form.control}
                    name={quantityFieldName}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="flex items-center gap-2 justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => field.onChange(Math.max(1, Number(field.value || 0) - 1))}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                        placeholder="Qty"
                                        // className=""
                                        className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 

                                        type="number" // Use type number
                                        min="0"
                                        {...field}
                                        // Ensure value is always a number for calculations
                                        value={Number(field.value || 0)}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            field.onChange(isNaN(val) || val < 1 ? 0 : val);
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => field.onChange(Number(field.value || 0) + 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage className="mt-1" />
                        </FormItem>
                    )}
                />
            </td>

            {/* Desktop Delete */}
            <td className="py-2 px-0.5 hidden md:table-cell text-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 px-2" // Consistent height
                >
                    <Trash2 className="text-red-500 h-4 w-4" />
                </Button>
            </td>
        </>
    );
};


// --- Main ItemRow Component ---
export const ItemRow: React.FC<ItemRowProps> = ({
    index,
    items,
    onRemove,
    className, // Pass className down if needed for the <tr>
    ...props // Pass other potential tr attributes
}) => {
    const form = useFormContext(); // Get form context here
    const [ isDeleting, setIsDeleting ] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        // Wait for animation before calling parent remove function
        setTimeout(() => {
            onRemove();
            // No need to setIsDeleting(false) as the component will unmount
        }, 300); // Match CSS transition duration
    };

    // Filter items based on selected customer (if any)
    const filteredItems = items?.filter(item => {
        const selectedCustomerId = form.watch('customerId');
        // Show all items if no customer is selected, otherwise filter
        return !selectedCustomerId || item.customerId === selectedCustomerId;
    });

    // Map items to options format for the combobox
    const itemOptions: ItemOption[] = filteredItems.map(item => ({
        label: item.itemName,
        value: item.itemId
    }));

    // Define row classes including animation
    const rowClasses = cn(
        "border-b", // Base border
        "bg-background", // Background
        "relative transition-all duration-300 ease-in-out", // Animation base (increased duration slightly)
        isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100', // Deleting animation
        // Responsive layout changes handled by child components now (md:hidden / hidden md:table-cell)
        // Keep flex for mobile base layout if needed, but children handle display
        "flex flex-col md:table-row",
        className // Allow overriding or adding classes from parent
    );

    // Props shared between mobile and desktop views
    const commonViewProps: CommonViewProps = {
        index,
        form,
        itemOptions,
        handleDelete,
        isDeleting,
        items, // Pass original items array for customerId logic
    };

    return (
        <tr className={rowClasses} {...props}>
            {/* Render Mobile View (hidden on md+) */}
            <MobileItemRowView {...commonViewProps} />

            {/* Render Desktop View (hidden < md) */}
            <DesktopItemRowView {...commonViewProps} />
        </tr>
    );
};