"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { createOrderSchema, type CreateOrderInput, updateOrderSchema, type UpdateOrderInput, EnrichedOrders, EnrichedOrderSchemaType, EnrichedOrderSchema, CreateOrderSchema } from "@/types/orders";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CustomerSelector from "@/components/ui/customer-dropdown";
import { createOrder, updateOrder } from "@/server/actions/orders"; // Import updateOrder action
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectContentFullWidth,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Removed useOrderUpdateMutation as it wasn't used
import { useCustomers } from "@/hooks/data-fetcher";
// Removed startTransition, useTransition as we'll use formState.isSubmitting
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Plus, PackageOpen, ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react";
import { ItemRow } from "./ItemRow";
import { useIsMobileTEST } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed unused schema imports if they aren't needed elsewhere
// import { orderStatusSchema, movementTypeSchema, packingTypeSchema, deliveryMethodSchema } from "@/server/db/schema";
import { z } from "zod";
import { useItemsQuery } from "@/hooks/data/useItems";
import { Input } from "@/components/ui/input";
import { useErrorDialog } from "@/hooks/useErrorDialog";
import { useSession } from "next-auth/react";
import { useOrdersStore } from "@/stores/orders-store";

import { orderStatusSchema } from "@/server/db/schema";
import { SaveButton } from "@/components/ui/SaveButton";
import { useFormState } from "react-dom";
// Import your FormErrorSummary component (ensure path is correct)

interface OrderFormProps {
    onClose: () => void;
    initialData?: (CreateOrderInput & { orderId?: string }) | null;
    isEditMode?: boolean;
}
type OrderStatus = z.infer<typeof orderStatusSchema>

const statusColors: Record<OrderStatus, string> = {
    DRAFT: "bg-gray-500 hover:translate-x-1 transition-all  text-white focus:text-white cursor-pointer focus:bg-gray-600 ",
    PENDING: "bg-yellow-500 hover:translate-x-1 transition-all  text-white focus:text-white cursor-pointer focus:bg-yellow-600",
    PROCESSING: "bg-blue-500 hover:translate-x-1 transition-all text-white focus:text-white cursor-pointer focus:bg-blue-600",
    READY: "bg-purple-500 hover:translate-x-1 transition-all  text-white focus:text-white cursor-pointer focus:bg-purple-600",
    COMPLETED: "bg-green-500 hover:translate-x-1 transition-all  text-white focus:text-white cursor-pointer focus:bg-green-600",
    CANCELLED: "bg-red-500 hover:translate-x-1 transition-all  text-white focus:text-white cursor-pointer focus:bg-red-600",
};

const SelectTriggerStatusColors: Record<OrderStatus, string> = {
    DRAFT: "bg-gray-600 ",
    PENDING: "bg-yellow-400",
    PROCESSING: "bg-blue-600 ",
    READY: "bg-purple-600 ",
    COMPLETED: "bg-green-600 ",
    CANCELLED: "bg-red-600 ",
};



export const OrderForm = ({ onClose, initialData, isEditMode = false }: OrderFormProps) => {
    const { data: customerList, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
    const { data: itemsList, isLoading: isItemsLoading, isError: isItemsError } = useItemsQuery();
    const queryClient = useQueryClient();
    const isMobile = useIsMobileTEST();
    const { showErrorDialog, ErrorDialogComponent } = useErrorDialog();
    const orderStore = useOrdersStore()
    // Removed useTransition - formState.isSubmitting will handle this

    const customersWithItems = customerList?.filter(customer =>
        itemsList?.some(item => item.customerId === customer.customerId)
    ) ?? [];

    const validationSchema = isEditMode && initialData?.orderId ? updateOrderSchema : CreateOrderSchema;
    type FormSchemaType = z.infer<typeof validationSchema>;

    const { data: session } = useSession();

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(validationSchema),
        defaultValues: initialData || {
            orderType: "WAREHOUSE_ORDER",
            packingType: "NONE",
            deliveryMethod: "NONE",
            status: "PENDING",
            movement: "IN",
            items: [],
            customerId: "",
            notes: "",
            orderMark: "",
            createdBy: session?.user.id ?? undefined // Handle case where user ID might be undefined
        },
        mode: "onSubmit" // Or "onBlur" or "onSubmit" depending on preference
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });


    
    const printField = (): Promise<boolean> => {
        console.log("Form Fields:", fields)
        return Promise.resolve(true);
    }

    const watchedItems = useWatch({ control: form.control, name: "items" });
    const selectedItemIds = useMemo(() => {
        if (watchedItems) {
            return watchedItems.map(item => item.itemId).filter(Boolean) as string[];
        }
    }, [ watchedItems ]);

    async function processSubmit(values: FormSchemaType) {
        // No need for manual validation here - Zod handles it
        let result;
        console.log(fields)
        try {
            if (isEditMode && initialData?.orderId) {
                // Ensure you pass the correct shape expected by updateOrder
                result = await updateOrder({ ...values, orderId: initialData.orderId } as UpdateOrderInput);
            } else {
                // Ensure you pass the correct shape expected by createOrder
                result = await createOrder(values as CreateOrderInput);
            }

            if (result?.success) {
                // Consider combining invalidations if appropriate
                await queryClient.invalidateQueries({ queryKey: [ 'orders' ] });
                await queryClient.invalidateQueries({ queryKey: [ 'stockMovements' ] });
                if (isEditMode && initialData?.orderId) {
                    await queryClient.invalidateQueries({ queryKey: [ 'order', initialData.orderId ] });
                }

                const validateResponse = EnrichedOrderSchema.safeParse(result.data)
                console.log("validateResponse: ", JSON.stringify(validateResponse, null, 2))
                if (validateResponse.success) {
                    orderStore.selectOrder(validateResponse.data.orderId, validateResponse.data)
                }
                toast.success(`Order ${isEditMode ? 'updated' : 'created'} successfully`);
                onClose(); // Close form on success
            } else {
                // Handle server-side errors (general or specific if returned)
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : (result?.error as any)?.message || `Failed to ${isEditMode ? 'update' : 'create'} order.`;

                showErrorDialog("error", errorMessage);
                toast.error(errorMessage);
                // Optionally set form-level errors if the server returns field-specific issues
                // if (result?.errors) {
                //   Object.entries(result.errors).forEach(([field, message]) => {
                //     form.setError(field as keyof FormSchemaType, { type: 'server', message });
                //   });
                // }
            }
        } catch (error) {
            console.error("Form submission error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            showErrorDialog("error", errorMessage);
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} order. ${errorMessage}`);
        }
        // No need to manually set submitting state - RHF handles it
    };

    const handleCancel = useCallback(() => {
        // form.reset(); // Resetting might clear initialData in edit mode, consider implications
        onClose();
    }, [ onClose ]);

    // --- Loading / Error states for initial data ---
    if (isCustomersError || isItemsError) { // Combine error checks
        return (
            <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
                Error loading necessary data (customers or items). Please try again later.
            </div>
        );
    }
    if (isCustomersLoading || isItemsLoading) {
        return (
            <div className="p-4 rounded-md border border-gray-200 bg-gray-50 text-gray-700 h-full flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }
    // --- End Loading / Error states ---
    const [ hasErrors, setHasErrors ] = useState(false);
    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            setHasErrors(true);
            const timer = setTimeout(() => {
                setHasErrors(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [ form.formState.errors]);

    return (
        <div className="flex flex-col h-full ">
            {form.formState.isSubmitting && (
                <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Creating Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LoadingSpinner />
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Pass form methods down */}
            <Form {...form}>
                {/* Use form.handleSubmit to trigger validation before processSubmit */}
                <form
                    onSubmit={form.handleSubmit(processSubmit)} // <-- Key change
                    className="flex flex-col h-full w-full "
                >
                    <div className="flex flex-col px-2 sm:px-6 flex-grow overflow-auto ">
                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,2fr] gap-6">

                            {/* Left Column Card */}
                            <Card className={cn("shadow-sm border-gray-200 flex flex-col ")}>
                                <div className="pt-5 px-5 pb-2 border-b">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <div className="h-5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                                        Order Information
                                    </h3>
                                </div>
                                <div className="space-y-5 p-5"> {/* Adjusted padding */}
                                    {/* Customer Selection */}
                                    <FormField
                                        control={form.control}
                                        name="customerId"
                                        render={({ field, formState }) => (
                                            <div className={cn(formState.errors.customerId && "outline-dashed outline-red-500 p-1 rounded-md animate-shake")}>
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Customer {formState.errors.customerId?.message}</FormLabel>
                                                <FormControl>
                                                    <CustomerSelector
                                                        customersInput={customersWithItems}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        isRequired={true} // Schema handles validation message
                                                        isModal={true}
                                                        // className={formState.errors.customerId ? "border-red-500 border-dashed" : ""}

                                                    />
                                                </FormControl>
                                                {/* <FormMessage /> */}
                                            </FormItem>
                                            </div>
                                        )}
                                    />

                                    {/* Movement Type */}
                                    <FormField
                                        control={form.control}
                                        name="movement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700 ">Movement Type</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-3 ">
                                                        {/* Badges for IN/OUT */}
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "px-4 py-1 flex-1 cursor-pointer rounded-md transition-all justify-center text-md text-center",
                                                                field.value === "IN"
                                                                    ? "bg-green-500 hover:bg-green-600 text-white "
                                                                    : "bg-green-200 hover:bg-green-500 text-green-800",
                                                                "hover:scale-[105%] hover:text-white ",
                                                                ""

                                                            )} onClick={() => form.setValue("movement", "IN", { shouldValidate: true })}
                                                        >
                                                            <ArrowDownLeftIcon />IN
                                                            </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "px-4 py-1 flex-1 cursor-pointer rounded-md transition-all justify-center text-md text-center",
                                                                field.value === "OUT"
                                                                    ? "bg-red-600 hover:bg-red-600 text-white "
                                                                    : "bg-red-100 hover:bg-red-600 text-red-800",
                                                                "hover:scale-[105%] hover:text-white"
                                                            )} onClick={() => form.setValue("movement", "OUT", { shouldValidate: true })}
                                                        >
                                                            <ArrowUpRightIcon />OUT
                                                        </Badge>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Status */}
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className={cn("w-full text-white hover:scale-[101%] transition-all",
                                                            SelectTriggerStatusColors[ field.value as OrderStatus ],
                                                            // field.value === "DRAFT" && "bg-gray-100",
                                                            // field.value === "PENDING" && "bg-blue-100 text-blue-800",
                                                            // field.value === "PROCESSING" && "bg-yellow-100 text-yellow-800",
                                                            // field.value === "READY" && "bg-green-100 text-green-800",
                                                            // field.value === "COMPLETED" && "bg-gray-100 text-gray-800",
                                                            // field.value === "CANCELLED" && "bg-red-100 text-red-800 font-semibold",
                                                        )} >
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContentFullWidth className="">
                                                        <SelectItem className={cn(statusColors[ 'DRAFT' ], "w-full rounded-none")} value="DRAFT">DRAFT</SelectItem>
                                                        <SelectItem className={cn(statusColors[ 'PENDING' ], "w-full rounded-none")} value="PENDING">PENDING</SelectItem>
                                                        <SelectItem className={cn(statusColors[ 'PROCESSING' ], "w-full rounded-none")} value="PROCESSING">PROCESSING</SelectItem>
                                                        <SelectItem className={cn(statusColors[ 'READY' ], "w-full rounded-none")} value="READY">READY</SelectItem>
                                                        <SelectItem className={cn(statusColors[ 'COMPLETED' ], "w-full rounded-none")} value="COMPLETED">COMPLETED</SelectItem>
                                                        <SelectItem className={cn(statusColors[ 'CANCELLED' ], "w-full rounded-none")} value="CANCELLED">CANCELLED</SelectItem>
                                                    </SelectContentFullWidth>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Order Mark */}
                                    <FormField
                                        control={form.control}
                                        name="orderMark"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Mark</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Order Mark"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Packing Type & Delivery Method */}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <FormField
                                            control={form.control}
                                            name="packingType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-medium text-gray-700">Packing Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} >
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
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="deliveryMethod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-medium text-gray-700">Delivery Method</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-gray-700">Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Add any additional notes here..."
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        className={cn("max-h-[100px] ", isMobile ? "resize-none" : "")}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Right Column Card - Items */}
                            <Card className={cn("shadow-sm border-gray-200 flex flex-col", isMobile ? "" : "h-[calc(100vh-20rem)] overflow-hidden")}>
                                <div className="pt-5 px-5 py-2 border-b">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <div className="h-5 w-1.5 bg-green-500 rounded-full mr-2"></div>
                                            Order Items
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center border-green-500 text-green-600 hover:bg-green-50"
                                            // Ensure you provide default/valid values required by your item schema
                                            onClick={() => append({ itemId: "", quantity: 1, itemLocationId: "4e176e92-e833-44f5-aea9-0537f980fb4b" /* Add other required defaults */ })}
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Add Item</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    {/* Desktop Header */}
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

                                    {/* Items List */}
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
                                                    {/* {fields.map((field, index) => (
                                                        <>
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
                                                        </>

                                                    ))}
                                                </tbody>
                                            </table> */}
                                                    {fields.map((field, index) => {
                                                        const currentItemId = form.watch(`items.${index}.itemId`);
                                                        const filteredItems = itemsList?.filter(item => {
                                                            if (selectedItemIds)
                                                            return !selectedItemIds.includes(item.itemId) || item.itemId === currentItemId;
                                                        }) || [];

                                                        return (
                                                            <ItemRow
                                                                key={field.id}
                                                                index={index}
                                                                itemId={currentItemId}
                                                                quantity={form.watch(`items.${index}.quantity`)}
                                                                itemLocationId={form.watch(`items.${index}.itemLocationId`)}
                                                                items={filteredItems}
                                                                onItemChange={(value: string) => form.setValue(`items.${index}.itemId`, value)}
                                                                onQuantityChange={(value: string) => form.setValue(`items.${index}.quantity`, parseInt(value))}
                                                                onRemove={() => remove(index)}
                                                            />
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                                {/* Add Another Item Button */}
                                {/* <div className="p-4 border-t bg-gray-50"> */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                    className="w-full p-4 border-t bg-gray-50"
                                        // Ensure you provide default/valid values required by your item schema
                                        onClick={() => append({ itemId: "", quantity: 1, itemLocationId: "4e176e92-e833-44f5-aea9-0537f980fb4b" /* Add other required defaults */ })}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Item
                                    </Button>
                                {/* </div> */}
                            </Card>

                        </div> {/* End Grid Layout */}
                    </div> {/* End Scrollable Content */}

                    {/* {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
                        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                            {Object.entries(form.formState.errors).map(([ key, error ]) => (
                                <div key={key}>
                                    <strong>{key}:</strong> {error?.message}
                                </div>
                            ))}
                        </div>
                    )} */}

                    {/* Form Footer */}
                    <div className="border-t px-4 sm:px-6 py-4 bg-white sticky bottom-0 shadow-inner z-10">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                {fields.length} item(s) in order
                            </div>
                            <div className="flex gap-3">
                                <Button
                                className="h-8"
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={form.formState.isSubmitting} // <-- Use formState
                                >
                                    Cancel
                                </Button>

                                {/* <Button
                                    type="submit"
                                    // Disable logic: Use formState.isSubmitting. Keep business logic (require items).
                                    // Add !form.formState.isValid if you only want submission when the form is valid according to schema
                                    disabled={
                                        form.formState.isSubmitting ||
                                        fields.length === 0
                                        // You might want to rely on schema validation instead of the .some check here
                                        // !form.formState.isValid // Add this if you want to prevent submission until valid
                                    }
                                    className="px-6 bg-blue-600 hover:bg-blue-700 h-8"
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            {isEditMode ? 'Updating Order...' : 'Creating Order...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Update Order' : 'Create Order'
                                    )}
                                </Button> */}

                                <SaveButton
                                    onClick={form.handleSubmit(processSubmit)}
                                    // disabled={fields.length === 0  }
                                    disabled={fields.length === 0 }
                                    hasError={hasErrors}
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            {isEditMode ? 'Updating Order...' : 'Creating Order...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Update Order' : 'Create Order'
                                    )}
                                </SaveButton>
                                
                            </div>
                        </div>
                    </div>
                    <ErrorDialogComponent />
                </form>
            </Form>
        </div>
    );
};

export default OrderForm;