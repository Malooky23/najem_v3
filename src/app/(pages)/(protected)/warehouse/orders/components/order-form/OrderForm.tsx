"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { createOrderSchema, DeliveryMethod, MovementType, OrderStatus, PackingType, type CreateOrderInput } from "@/types/orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CustomerSelector from "@/components/ui/customer-dropdown";
import { createOrder } from "@/server/actions/orders";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers, useItems, useOrderUpdateMutation } from "@/hooks/data-fetcher";
import { startTransition, useActionState, useCallback } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Plus, PackageOpen } from "lucide-react";
import { ItemRow } from "./ItemRow";
import { useIsMobileTEST, useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";

async function submitOrderForm(formData: FormData) {
    try {
        const formObject: Record<string, any> = {};

        // Ensure all form fields are captured
        const requiredFields = ['customerId', 'movement', 'packingType', 'deliveryMethod', 'status', 'orderType', 'notes'];


        formData.forEach((value, key) => {
            if (key === 'items') {
                try {
                    console.log("cap Items::::::+++++_____________________")
                    console.log("cap Items::::::", formObject[key])

                    formObject[key] = JSON.parse(value as string);
                } catch (e) {
                    console.error('Error parsing items:', e);
                    formObject[key] = [];
                }
            } else if (value !== undefined) {
                formObject[key] = value;
            }
        });

        console.log('=== Captured Form Data ===', formObject);

        // Validate required fields
        for (const field of requiredFields) {
            if (!formObject[field] && field !== 'notes') {
                throw new Error(`${field} is required`);
            }
        }

        console.log()
        const result = await createOrder(formData);


        if (result.success) {
            return { success: true, message: "Order created successfully" };
        }

        return { error: result.error || "Failed to create order" };
    } catch (error) {
        console.error('=== Submission Error ===', error);
        return {
            error: error instanceof Error ? error.message : "An unexpected error occurred."
        };
    }
}

// Update the props interface to accept optional initialData
interface OrderFormProps {
    onClose: () => void;
    initialData?: CreateOrderInput & { orderId?: string };
    isEditMode?: boolean;
}

export default function OrderForm({ onClose, initialData, isEditMode = false }: OrderFormProps) {
    const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
    const { data: itemsList, isLoading: isItemsLoading, isError: isItemsError } = useItems();
    const queryClient = useQueryClient();
    const isMobile = useIsMobileTEST()

    const customersWithItems = customerList?.filter(customer =>
        itemsList?.some(item => item.customerId === customer.customerId)
    ) ?? [];

    const { mutate: updateOrder, isPending: isUpdating } = useOrderUpdateMutation();

    // Update the server action to use the mutation for edit mode
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        if (isEditMode && initialData?.orderId) {
            // For edit mode, construct the update object from form data
            const orderId = initialData.orderId;
            const status = formData.get('status') as OrderStatus;
            const movement = formData.get('movement') as MovementType;
            const packingType = formData.get('packingType') as PackingType;
            const deliveryMethod = formData.get('deliveryMethod') as DeliveryMethod;
            const notes = formData.get('notes') as string;
            const customerId = formData.get('customerId') as string;

            // Parse items from form data
            const items: { itemId: string; quantity: number, itemLocationId: string }[] = [];

            formData.forEach((value, key) => {
                if (key.startsWith('items.')) {
                    const [_, index, field] = key.split('.');
                    const idx = parseInt(index);
                    if (!items[idx]) {
                        items[idx] = { itemId: '', quantity: 0, itemLocationId: '' };
                    }
                    if (field === 'itemId') {
                        items[idx].itemId = value as string;
                    } else if (field === 'quantity') {
                        items[idx].quantity = parseInt(value as string) || 0;
                    } else if (field === 'itemLocationId') {
                        items[idx].itemLocationId = value as string;
                    }
                }
            });

            // Filter out incomplete items
            const validItems = items.filter(item => item.itemId && item.quantity > 0);

            // Call the update mutation
            updateOrder({
                orderId,
                status,
                movement,
                packingType,
                deliveryMethod,
                notes,
                customerId,
                items: validItems,
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
                    onClose();
                    toast.success("Order updated successfully");
                },
                onError: (error) => {
                    toast.error(`Failed to update order: ${error.message}`);
                    return { error: error.message };
                }
            });

            return null; // The mutation handles the success/error states
        } else {
            // For create mode, use the existing logic
            console.log('Submitting form...', formData);
            const result = await submitOrderForm(formData);
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                onClose();
                toast.success("Order created successfully");
            }
            return result;
        }
    }, null);

    const form = useForm<CreateOrderInput>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: initialData || {
            orderType: "CUSTOMER_ORDER",
            packingType: "NONE",
            deliveryMethod: "NONE",
            status: "PENDING",
            movement: "IN",
            items: [] // Empty array initially
        },
        mode: "onChange"
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Create a function to handle cancellation
    const handleCancel = useCallback(() => {
        // Reset the form to its default values
        form.reset({
            orderType: "CUSTOMER_ORDER",
            packingType: "NONE",
            deliveryMethod: "NONE",
            status: "PENDING",
            movement: "IN",
            items: [],
            customerId: "",
            notes: ""
        });

        // Close the dialog
        onClose();
    }, [form, onClose]);

    if (isCustomersError) {
        return (
            <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
                Error loading customers
            </div>
        )
    }

    if (isCustomersLoading) {
        return (
            <div className="p-4 rounded-md border border-gray-200 bg-gray-50 text-gray-700 h-full">
                <LoadingSpinner />
            </div>
        )
    }

    // console.log(form.watch())

    return (
        <div className="flex flex-col h-full">
            <Form {...form}>
                <form
                    action={async (data) => {
                        console.log('shit')
                        console.log(data.forEach((value, key) => {
                            console.log(`${key}: ${value}`);
                        }))
                        if (!form.getValues("customerId")) { // Manual check for customerId
                            form.setError("customerId", {
                                type: "manual",
                                message: "Please select a customer.",
                            });
                            return; // Early return to prevent submission
                        }
                        startTransition(() => {
                            formAction(data) // Call server action if customerId is selected
                        })
                    }}
                    className="flex flex-col h-full w-full"
                >
                    <div className="flex flex-col px-2 sm:px-6  flex-grow overflow-auto">
                        {/* Main layout container */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,2fr] gap-6">
                            {/* Left Column - General Order Info */}
                            {/* <Card className="flex flex-grow flex-col p-5 shadow-sm border-gray-200 h-full lg:sticky lg:top-0 lg:max-h-[calc(100vh-12rem)] overflow-hidden"> */}
                            <Card className={cn("shadow-sm border-gray-200 flex flex-col ",
                                isMobile ? "h-full" : "h-[calc(100vh-20rem)] overflow-hidden"
                            )}>
                                <div className="pt-5 px-5 pb-2 border-b  ">

                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <div className="h-5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                                        Order Information
                                    </h3>
                                </div>
                                <div className="space-y-5 p-2">
                                    {/* Customer Selection */}
                                    <FormField
                                        control={form.control}
                                        name="customerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Customer</FormLabel>
                                                <FormControl>
                                                    <CustomerSelector
                                                        customersInput={customersWithItems}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        isRequired={true}
                                                        isModal={true}
                                                    // className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Movement Type with better visual styling */}
                                    <FormField
                                        control={form.control}
                                        name="movement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Movement Type</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "px-4 py-2 flex-1 cursor-pointer rounded-md transition-all text-center",
                                                                field.value === "IN"
                                                                    ? "bg-green-500 hover:bg-green-600 text-white border-0"
                                                                    : "bg-green-50 hover:bg-green-100",
                                                            )}
                                                            onClick={() => form.setValue("movement", "IN", {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                                shouldTouch: true
                                                            })}
                                                        >
                                                            IN
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "px-4 py-2 flex-1 cursor-pointer rounded-md transition-all text-center",
                                                                field.value === "OUT"
                                                                    ? "bg-red-500 hover:bg-red-600 text-white border-0"
                                                                    : "bg-red-50 hover:bg-red-100",
                                                            )}
                                                            onClick={() => form.setValue("movement", "OUT", {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                                shouldTouch: true
                                                            })}
                                                        >
                                                            OUT
                                                        </Badge>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />

                                                {/* Restored hidden input for movement */}
                                                <input
                                                    type="hidden"
                                                    name="movement"
                                                    value={field.value}
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Status with improved visuals */}
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Status</FormLabel>
                                                <Select onValueChange={field.onChange} {...field}>
                                                    <FormControl>
                                                        <SelectTrigger className={cn("w-full",
                                                            field.value === "DRAFT" && "bg-gray-100",
                                                            field.value === "PENDING" && "bg-blue-100 text-blue-800",
                                                            field.value === "PROCESSING" && "bg-yellow-100 text-yellow-800",
                                                            field.value === "READY" && "bg-green-100 text-green-800",
                                                            field.value === "COMPLETED" && "bg-gray-100 text-gray-800",
                                                        )} >
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                                                        <SelectItem value="PENDING">PENDING</SelectItem>
                                                        <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                                        <SelectItem value="READY">READY</SelectItem>
                                                        <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />

                                                {/* Restored hidden input for status */}
                                                <input
                                                    type="hidden"
                                                    name="status"
                                                    value={field.value}
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Two-column layout for smaller fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <FormField
                                            control={form.control}
                                            name="packingType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-medium text-gray-700">Packing Type</FormLabel>
                                                    <Select onValueChange={field.onChange} {...field} >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select packing type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="NONE">None</SelectItem>
                                                            <SelectItem value="SACK">Sack</SelectItem>
                                                            <SelectItem value="PALLET">Pallet</SelectItem>
                                                            <SelectItem value="CARTON">Carton</SelectItem>
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />

                                                    {/* Restored hidden input for packingType */}
                                                    <input
                                                        type="hidden"
                                                        name="packingType"
                                                        value={field.value}
                                                    />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="deliveryMethod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-medium text-gray-700">Delivery Method</FormLabel>
                                                    <Select onValueChange={field.onChange} {...field}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select delivery method" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="NONE">None</SelectItem>
                                                            <SelectItem value="PICKUP">Pickup</SelectItem>
                                                            <SelectItem value="DELIVERY">Delivery</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />

                                                    {/* Restored hidden input for deliveryMethod */}
                                                    <input
                                                        type="hidden"
                                                        name="deliveryMethod"
                                                        value={field.value}
                                                    />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Hidden field */}
                                    <input type="hidden" name="orderType" value="CUSTOMER_ORDER" />

                                    {/* Notes section */}
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Add any additional notes here"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        className="min-h-[100px] resize-none"
                                                    />
                                                </FormControl>
                                                <FormMessage />

                                                {/* Restored hidden input for notes */}
                                                <input
                                                    type="hidden"
                                                    name="notes"
                                                    value={field.value ?? ''}
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Right Column - Items Section */}
                            <Card className={cn("shadow-sm border-gray-200 flex flex-col",
                                isMobile ? "h-full" : "h-[calc(100vh-20rem)] overflow-hidden"
                            )}>
                                <div className="pt-5 px-5 py-2 border-b bg ">
                                    <div className="flex justify-between items-center ">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <div className="h-5 w-1.5 bg-green-500 rounded-full mr-2"></div>
                                            Order Items 123
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center  border-green-500 text-green-600 hover:bg-green-50"
                                            onClick={() => append({ itemId: "", quantity: 0, itemLocationId: "4e176e92-e833-44f5-aea9-0537f980fb4b" })}
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Add Item</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col">
                                    {/* Fixed header for desktop */}
                                    <div className="hidden md:block bg-gray-50 border-b sticky top-0 z-10">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">#</th>
                                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Quantity</th>
                                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">Actions</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>

                                    <div className="flex-1 overflow-auto">
                                        {fields.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500 bg-gray-50 h-full flex flex-col items-center justify-center">
                                                <PackageOpen className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="text-gray-500 mb-1">No items added</p>
                                                <p className="text-sm text-gray-400">Click "Add Item" to begin</p>
                                            </div>
                                        ) : (
                                            <table className="w-full border-collapse">
                                                <tbody>
                                                    {fields.map((field, index) => (
                                                        <ItemRow
                                                            key={field.id}
                                                            index={index}
                                                            itemId={form.watch(`items.${index}.itemId`)}
                                                            quantity={form.watch(`items.${index}.quantity`)}
                                                            itemLocationId={form.watch(`items.${index}.itemLocationId`)}
                                                            items={itemsList || []}
                                                            onItemChange={(value: string) => form.setValue(`items.${index}.itemId`, value)}
                                                            onQuantityChange={(value: string) => form.setValue(`items.${index}.quantity`, parseInt(value))}
                                                            onRemove={() => remove(index)}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                {/* "Add another item" button at the bottom */}
                                <div className="p-4 border-t bg-gray-50">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => append({ itemId: "", quantity: 1, itemLocationId: "4e176e92-e833-44f5-aea9-0537f980fb4b" })}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Another Item
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Form error message */}
                    {state?.error && (
                        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                            {state.error}
                        </div>
                    )}

                    {/* Form footer */}
                    <div className="border-t px-4 sm:px-6 py-4 bg-white sticky bottom-0 shadow-inner z-10">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                {fields.length} item(s) in order
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending || fields.length === 0 || fields.some(field => !form.watch(`items.${fields.indexOf(field)}.itemId`))}
                                    className="px-6 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isPending ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            {isEditMode ? 'Updating Order...' : 'Creating Order...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Update Order' : 'Create Order'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}