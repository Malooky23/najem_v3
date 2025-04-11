"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { createOrderSchema, type CreateOrderInput, updateOrderSchema, type UpdateOrderInput } from "@/types/orders";
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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers, useOrderUpdateMutation } from "@/hooks/data-fetcher";

import { startTransition, useTransition, useCallback } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Plus, PackageOpen } from "lucide-react";
import { ItemRow } from "./ItemRow";
import { useIsMobileTEST } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { orderStatusSchema, movementTypeSchema, packingTypeSchema, deliveryMethodSchema } from "@/server/db/schema";
import { z } from "zod";
import { useItemsQuery } from "@/hooks/data/useItems";
import { Input } from "@/components/ui/input";
import { useErrorDialog } from "@/hooks/useErrorDialog";
import { useSession } from "next-auth/react";


interface OrderFormProps {
    onClose: () => void;
    initialData?: (CreateOrderInput & { orderId?: string }) | null; // Allow null for initialData
    isEditMode?: boolean;
}

export  const OrderForm = ({ onClose, initialData, isEditMode = false }: OrderFormProps) => {
    const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
    const { data: itemsList, isLoading: isItemsLoading, isError: isItemsError } = useItemsQuery();
    const queryClient = useQueryClient();
    const isMobile = useIsMobileTEST()
    const { showErrorDialog, ErrorDialogComponent } = useErrorDialog();
    const [ isSubmitting, startSubmitting ] = useTransition();


    const customersWithItems = customerList?.filter(customer =>
        itemsList?.some(item => item.customerId === customer.customerId)
    ) ?? [];


    const validationSchema = isEditMode && initialData?.orderId ? updateOrderSchema : createOrderSchema;
    type FormSchemaType = z.infer<typeof validationSchema>;

    const { data: session } = useSession()

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(validationSchema),
        defaultValues: initialData || { // Use initialData directly
            orderType: "WAREHOUSE_ORDER",
            packingType: "NONE",
            deliveryMethod: "NONE",
            status: "PENDING",
            movement: "IN",
            items: [],
            customerId: "",
            notes: "",
            orderMark: "",
            createdBy: session?.user.id
        },
        mode: "onChange"
    });


    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });


    const onSubmit = async (values: FormSchemaType) => {
        if (!values.customerId) {
            form.setError("customerId", {
                type: "manual",
                message: "Please select a customer.",
            });
            return;
        }

        startSubmitting(async () => {
            let result;
            try {
                if (isEditMode && initialData?.orderId) {
                    result = await updateOrder({ ...values, orderId: initialData.orderId } as UpdateOrderInput);
                } else {
                    result = await createOrder(values as CreateOrderInput);
                }


                if (result?.success) {
                    await queryClient.invalidateQueries({ queryKey: [ 'orders' ] });
                    await queryClient.invalidateQueries({ queryKey: [ 'stockMovements' ] });
                    if (isEditMode && initialData?.orderId) {
                        await queryClient.invalidateQueries({ queryKey: [ 'order', initialData.orderId ] });
                    }
                    toast.success(`Order ${isEditMode ? 'updated' : 'created'} successfully`);
                    onClose();
                } else {
                    showErrorDialog(
                        "error",
                        typeof result?.error === 'string' ? result.error : (result?.error?.message || "Failed to perform action")
                    );
                    toast.error(`Failed to ${isEditMode ? 'update' : 'create'} order: ${result?.error || "Unknown error"}`);
                }
            } catch (error) {
                console.error("Form submission error:", error);
                showErrorDialog("error", (error instanceof Error ? error.message : "An unexpected error occurred."));
                toast.error(`Failed to ${isEditMode ? 'update' : 'create'} order. An unexpected error occurred.`);
            }
        });
    };


    const handleCancel = useCallback(() => {
        form.reset(); // Reset to default or initialData if needed
        onClose();
    }, [ form, onClose ]);


    if (isCustomersError) {
        return (
            <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
                Error loading customers
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


    return (
        <div className="flex flex-col h-full ">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col h-full w-full "
                >
                    <div className="flex flex-col px-2 sm:px-6  flex-grow overflow-auto ">
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,2fr] gap-6  ">
                            {/* Left Column - General Order Info */}
                            <Card className={cn("shadow-sm border-gray-200 flex flex-col ")}>
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
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Movement Type */}
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
                                                            onClick={() => form.setValue("movement", "IN", { shouldValidate: true })}
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
                                                            onClick={() => form.setValue("movement", "OUT", { shouldValidate: true })}
                                                        >
                                                            OUT
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
                                                        <SelectTrigger className={cn("w-full",
                                                            field.value === "DRAFT" && "bg-gray-100",
                                                            field.value === "PENDING" && "bg-blue-100 text-blue-800",
                                                            field.value === "PROCESSING" && "bg-yellow-100 text-yellow-800",
                                                            field.value === "READY" && "bg-green-100 text-green-800",
                                                            field.value === "COMPLETED" && "bg-gray-100 text-gray-800",
                                                            field.value === "CANCELLED" && "bg-red-100 text-red-800 font-semibold",
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
                                                        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                                    </SelectContent>
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

                            {/* Right Column - Items Section */}
                            <Card className={cn("shadow-sm border-gray-200 flex flex-col",
                                isMobile ? "" : "h-[calc(100vh-20rem)] overflow-hidden"
                            )}>
                                <div className="pt-5 px-5 py-2 border-b bg ">
                                    <div className="flex justify-between items-center ">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <div className="h-5 w-1.5 bg-green-500 rounded-full mr-2"></div>
                                            Order Items
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
                    {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
                        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                            {Object.entries(form.formState.errors).map(([ key, error ]) => (
                                <div key={key}>
                                    <strong>{key}:</strong> {error?.message}
                                </div>
                            ))}
                        </div>
                    )}


                    {/* Form footer */}
                    <div className="border-t px-4 sm:px-6  py-4 bg-white sticky bottom-0 shadow-inner z-10">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                {fields.length} item(s) in order
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || fields.length === 0 || fields.some(field => !form.watch(`items.${fields.indexOf(field)}.itemId`))}
                                    className="px-6 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSubmitting ? (
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
                    <ErrorDialogComponent />
                </form>
            </Form>
        </div>
    );
};

export default OrderForm;
