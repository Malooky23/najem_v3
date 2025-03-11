import React, { useState } from "react";
import { Plus, Minus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComboboxForm } from "@/components/ui/combobox";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

interface Item {
    itemId: string;
    itemName: string;
    customerId: string;
    quantity?: number;
    itemLocationId?: string;
}

interface ItemRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    index: number;
    itemId: string;
    quantity: number;
    itemLocationId?: string;
    items: Item[];
    onItemChange: (value: string) => void;
    onQuantityChange: (value: string) => void;
    onRemove: () => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
    index,
    itemId,
    quantity,
    itemLocationId,
    items,
    onItemChange,
    onQuantityChange,
    onRemove,
    ...props
}) => {
    const form = useFormContext();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        // Wait for animation to complete before removing
        setTimeout(() => {
            onRemove();
        }, 300); // match this with the CSS transition duration
    };

    const filteredItems = items?.filter(item => {
        const selectedCustomerId = form.watch('customerId');
        return !selectedCustomerId || item.customerId === selectedCustomerId;
    });

    const itemOptions = filteredItems.map(item => ({
        label: item.itemName,
        value: item.itemId
    }));

    const rowClasses = `border-b flex flex-col md:table-row gap-4 p-4 md:p-0 bg-background min-w-0 relative transition-all duration-300 ${isDeleting ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`;

    return (
        <tr className={rowClasses}>
            {/* Desktop index column */}
            <td className="py-2 px-4 text-center hidden md:table-cell">{index + 1}</td>
            
            {/* Mobile card layout wrapper */}
            <td colSpan={3} className="md:hidden p-0 relative">
                <div className={`flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 ${isDeleting ? 'opacity-0 transform scale-95' : 'opacity-100'}`}>
                    {/* Mobile header with item number and delete button */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg border-b">
                        <div className="flex items-center">
                            <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
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
                    <div className="p-3 border-b">
                        <div className="text-sm font-medium text-gray-600 mb-1.5">Item</div>
                        <ComboboxForm
                            isModal={true}
                            name={`items.${index}.itemId`}
                            options={itemOptions}
                            placeholder="Select an item"
                            className="w-full"
                            onChange={(value) => {
                                const currentCustomerId = form.watch('customerId');
                                if (!currentCustomerId || currentCustomerId === "") {
                                    const selectedItem = items?.find(item => item.itemId === value);
                                    if (selectedItem?.customerId) {
                                        form.setValue('customerId', selectedItem.customerId);
                                    }
                                }
                            }}
                        />
                        
                        {/* Hidden inputs */}
                        <input 
                            type="hidden" 
                            name={`items.${index}.itemId`} 
                            value={form.watch(`items.${index}.itemId`)} 
                        />
                        <input 
                            type="hidden" 
                            name={`items.${index}.itemLocationId`} 
                            value={'4e176e92-e833-44f5-aea9-0537f980fb4b'} 
                        />
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="p-3">
                        <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="text-sm font-medium text-gray-600 mb-1.5">Quantity</div>
                                    <FormControl>
                                        <div className="flex items-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-l-md border-r-0"
                                                onClick={() => {
                                                    field.onChange(Math.max(1, Number(field.value) - 1 || 1));
                                                }}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                placeholder="Qty"
                                                className="h-9 rounded-none text-center border-x-0 max-w-[80px]"
                                                min="1"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-r-md border-l-0"
                                                onClick={() => {
                                                    field.onChange(Number(field.value) + 1 || 1);
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="mt-1" />
                                    
                                    {/* Restored hidden input for quantity */}
                                    <input
                                        type="hidden"
                                        name={`items.${index}.quantity`}
                                        value={field.value}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </td>
            
            {/* Desktop layout - Item selection cell */}
            <td className="py-2 px-4 hidden md:table-cell">
                <div className="min-w-0 overflow-hidden max-w-full">
                    <ComboboxForm
                        isModal={true}
                        name={`items.${index}.itemId`}
                        options={itemOptions}
                        placeholder="Select an item"
                        className="w-full min-w-[120px] max-w-full"
                        onChange={(value) => {
                            const currentCustomerId = form.watch('customerId');
                            if (!currentCustomerId || currentCustomerId === "") {
                                const selectedItem = items?.find(item => item.itemId === value);
                                if (selectedItem?.customerId) {
                                    form.setValue('customerId', selectedItem.customerId);
                                }
                            }
                        }}
                    />
                    {/* Hidden inputs */}
                    <input 
                        type="hidden" 
                        name={`items.${index}.itemId`} 
                        value={form.watch(`items.${index}.itemId`)} 
                    />
                    <input 
                        type="hidden" 
                        name={`items.${index}.itemLocationId`} 
                        value={'4e176e92-e833-44f5-aea9-0537f980fb4b'} 
                    />
                </div>
            </td>
            
            {/* Desktop layout - Quantity cell */}
            <td className="py-2 px-4 hidden md:table-cell">
                <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="flex items-center gap-2 justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            field.onChange(Math.max(1, Number(field.value) - 1 || 1));
                                        }}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                        placeholder="Qty"
                                        className="w-14 text-center"
                                        min="0"
                                        {...field}
                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            field.onChange(Number(field.value) + 1 || 1);
                                        }}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                            
                            {/* Restored hidden input for quantity */}
                            <input
                                type="hidden"
                                name={`items.${index}.quantity`}
                                value={field.value}
                            />
                        </FormItem>
                    )}
                />
            </td>
            
            {/* Desktop layout - Delete button column */}
            <td className="py-2 px-1 hidden md:table-cell">
                <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    );
};