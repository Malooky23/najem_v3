"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { createOrderSchema, type CreateOrderInput } from "@/types/orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CustomerSelector from "@/components/ui/customer-dropdown";
import { createOrder } from "@/server/actions/orders";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers, useItems } from "@/hooks/data-fetcher";
import { startTransition, useActionState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ItemRow } from "./ItemRow";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SelectionButton } from "@/components/ui/selectionButton";

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

        // Validate items array
        // if (!formObject.items || !Array.isArray(formObject.items) || formObject.items.length === 0) {
        //   throw new Error('At least one item is required');
        // }
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

export default function OrderForm({ onClose }: { onClose: () => void }) {
    const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
    const { data: itemsList, isLoading: isItemsLoading, isError: isItemsError } = useItems();
    const queryClient = useQueryClient();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const customersWithItems = customerList?.filter(customer =>
        itemsList?.some(item => item.customerId === customer.customerId)
    ) ?? [];

    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {

        formData.forEach((value, key) => {
            console.log(`00000000000: ${key}: ${value}`);
        });

        console.log('Submitting form...', formData);
        const result = await submitOrderForm(formData);
        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            onClose();
            toast.success("Order created successfully");
        }
        return result;
    }, null);



    const form = useForm<CreateOrderInput>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {
            orderType: "CUSTOMER_ORDER",
            packingType: "NONE",
            deliveryMethod: "NONE",
            status: "PENDING",
            items: []
        },
        mode: "onChange"
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })


    if (isCustomersError) {
        return (
            <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
                Error loading customers
            </div>
        )
    }

    if (isCustomersLoading) {
        return (
            <div className="p-4 rounded-md border border-gray-200 bg-gray-50 text-gray-700">
                Loading customers...
            </div>
        )
    }

    // console.log(form.watch())

    return (


        <Form {...form}>
            <form
                //   action={formAction} 
                action={async (data) => { // Make formAction async
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
                className="flex flex-col   overflow-y-auto ">

                <div className="h-[vmax] space-y-6 px-4 sm:px-6 py-2 overflow-scroll">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-4 md:gap-6">
                        {/* Left Column - Form Fields */}
                        <div className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:gap-6">
                                
                            <FormField
                                    control={form.control}
                                    name="movement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Movement Type</FormLabel>
                                            <div className="flex justify-center gap-4 ">
                                                <SelectionButton
                                                    value="IN"
                                                    selected={field.value === "IN"}
                                                    onClick={() => field.onChange("IN")}
                                                    color="green"
                                                    
                                                >
                                                    IN
                                                </SelectionButton>
                                                <SelectionButton
                                                    value="OUT"
                                                    selected={field.value === "OUT"}
                                                    onClick={() => field.onChange("OUT")}
                                                    color="red"
                                                >
                                                    OUT
                                                </SelectionButton>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer</FormLabel>
                                            <FormControl>
                                                <CustomerSelector
                                                    customersInput={customersWithItems}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    isRequired={true}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* <FormField
                                    control={form.control}
                                    name="movement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Movement Type</FormLabel>
                                            <Select onValueChange={field.onChange} {...field}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select movement type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="IN">IN</SelectItem>
                                                    <SelectItem value="OUT">OUT</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="movement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Movement Type</FormLabel>
                                            <div className="flex justify-center gap-4 ">
                                                <SelectionButton
                                                    value="IN"
                                                    selected={field.value === "IN"}
                                                    onClick={() => field.onChange("IN")}
                                                    color="green"

                                                >
                                                    IN
                                                </SelectionButton>
                                                <SelectionButton
                                                    value="OUT"
                                                    selected={field.value === "OUT"}
                                                    onClick={() => field.onChange("OUT")}
                                                    color="red"
                                                >
                                                    OUT
                                                </SelectionButton>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}

                                <FormField
                                    control={form.control}
                                    name="packingType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Packing Type</FormLabel>
                                            <Select onValueChange={field.onChange} {...field} >
                                                <FormControl>
                                                    <SelectTrigger>
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
                                        </FormItem>
                                    )}
                                />

                                <input type="hidden" name="orderType" value="CUSTOMER_ORDER" />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} {...field}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                                                    <SelectItem value="PENDING">PENDING</SelectItem>
                                                    <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="deliveryMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Delivery Method</FormLabel>
                                            <Select onValueChange={field.onChange} {...field}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any additional notes here"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Right Column - Items Section */}
                        <div className="space-y-4 lg:max-h-[calc(100vh-20rem)] overflow-auto ">
                            {/* <FormLabel className="hidden md:block sticky top-1 bg-white z-10">Items</FormLabel> */}
                            <div className="border rounded-lg p-2 sm:p-0  ">
                                <table className="w-full border-collapse ">
                                    <thead className="hidden md:table-header-group">
                                        <tr className="bg-gray-100">
                                            <th className="py-2 px-4 text-left w-12">#</th>
                                            <th className="py-2 px-4 text-left">Item</th>
                                            <th className="py-2 px-4 text-center w-24">Quantity</th>
                                            <th className="py-2 px-4 text-left w-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((field, index) => (
                                            <ItemRow
                                                key={field.id}
                                                index={index}
                                                itemId={form.watch(`items.${index}.itemId`)}
                                                quantity={form.watch(`items.${index}.quantity`)}
                                                items={itemsList!}
                                                onItemChange={(value: string) => form.setValue(`items.${index}.itemId`, value)}
                                                onQuantityChange={(value: string) => form.setValue(`items.${index}.quantity`, parseInt(value))}
                                                onRemove={() => remove(index)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-[calc(100%-2rem)] m-4"
                                    onClick={() => append({ itemId: "", quantity: 1 })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {state?.error && (
                    <div className="text-red-500 text-sm">{state.error}</div>
                )}


                {/* <div className="border-t px-6 py-4 sticky bottom-0 bg-white"> */}
                <div className="border-t px-4 sm:px-6 py-4 sticky bottom-0 bg-slate-100">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-4 w-4"
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
                                    Creating...
                                </>
                            ) : (
                                'Create Order'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}