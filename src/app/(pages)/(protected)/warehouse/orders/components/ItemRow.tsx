// import { Plus, Minus } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// interface ItemRowProps {
//   index: number
//   itemId: string
//   quantity: number
//   items: { itemId: string; itemName: string }[]
//   onItemChange: (value: string) => void
//   onQuantityChange: (value: number) => void
//   onRemove: () => void
// }

// export function ItemRow({ index, itemId, quantity, items, onItemChange, onQuantityChange, onRemove }: ItemRowProps) {
//   return (
//     <tr className="border-b">
//       <td className="py-2 px-4 text-center">{index + 1}</td>
//       <td className="py-2 px-4">
//         <Select value={itemId} onValueChange={onItemChange}>
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="Select an item" />
//           </SelectTrigger>
//           <SelectContent>
//             {items.map((item) => (
//               <SelectItem key={item.itemId} value={item.itemId}>
//                 {item.itemName}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </td>
//       <td className="py-2 px-4">
//         <div className="flex items-center space-x-2">
//           <Button
//             type="button"
//             variant="outline"
//             size="icon"
//             onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
//           >
//             <Minus className="h-4 w-4" />
//           </Button>
//           <Input
//             type="number"
//             value={quantity}
//             onChange={(e) => onQuantityChange(Number.parseInt(e.target.value) || 1)}
//             className="w-20 text-center"
//             min="1"
//           />
//           <Button type="button" variant="outline" size="icon" onClick={() => onQuantityChange(quantity + 1)}>
//             <Plus className="h-4 w-4" />
//           </Button>
//         </div>
//       </td>
//       <td className="py-2 px-4">
//         <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
//           Remove
//         </Button>
//       </td>
//     </tr>
//   )
// }

import React from "react";
import { Plus, Minus, Delete, DeleteIcon, Trash, Trash2 } from "lucide-react";
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
}

interface ItemRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    index: number;
    itemId: string;
    quantity: number;
    items: Item[];
    onItemChange: (value: string) => void;
    onQuantityChange: (value: string) => void;
    onRemove: () => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
    index,
    itemId,
    quantity,
    items,
    onItemChange,
    onQuantityChange,
    onRemove,
    ...props
}) => {
    const form = useFormContext();

    const filteredItems = items?.filter(item => {
        const selectedCustomerId = form.watch('customerId');
        return !selectedCustomerId || item.customerId === selectedCustomerId;
    });

    const itemOptions = filteredItems.map(item => ({
        label: item.itemName,
        value: item.itemId
    }));

    return (
        <tr className="border-b flex flex-col md:table-row gap-4 p-4 md:p-0 bg-background">
            <td className="py-2 px-4 text-center hidden md:table-cell">{index + 1}</td>
            <td className="py-2 px-0 md:px-4 w-full block md:table-cell">
                <div className="flex items-center gap-2">
                    <span className="md:hidden font-medium min-w-[24px]">{index + 1}.</span>
                    <div className="flex-1">
                        <ComboboxForm
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
                        <input 
                            type="hidden" 
                            name={`items.${index}.itemId`} 
                            value={form.watch(`items.${index}.itemId`)} 
                        />
                    </div>
                </div>
            </td>
            <td className="py-2 px-0 md:px-4 block md:table-cell">
                <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <span className="md:hidden font-medium whitespace-nowrap">Quantity:</span>
                                    <div className="flex items-center gap-2 flex-1 md:flex-none justify-end md:justify-start">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                field.onChange(Math.max(1, Number(field.value) - 1 || 1));
                                            }}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            placeholder="Quantity"
                                            className="w-16 md:w-12 text-center"
                                            min="1"
                                            {...field}
                                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                field.onChange(Number(field.value) + 1 || 1);
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </td>
            <td className="py-2 px-0 md:px-1 block md:table-cell">
                <Button type="button" variant="destructive" size="sm" onClick={onRemove} className="w-full md:w-auto">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    );
};