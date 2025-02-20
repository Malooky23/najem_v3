'use client'

import { Button } from "@/components/ui/button";
import CustomerSelector from "@/components/ui/customer-dropdown";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EnrichedCustomer } from "@/types/customer";
import { createItemsSchema, CreateItemsSchemaType, itemTypes } from "@/types/items"
import { zodResolver } from "@hookform/resolvers/zod"
import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSession } from "next-auth/react";
import { createItemAction, CreateItemResponse } from "@/server/actions/createItem";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";



interface ItemFormProps {
    customers: EnrichedCustomer[]
    isOpen: React.Dispatch<React.SetStateAction<boolean>>

}

export function CreateItemForm({ customers, isOpen }: ItemFormProps) {

    const queryClient = useQueryClient()
    const noIdCreateItemSchema = createItemsSchema.omit({ createdBy: true })

    const form = useForm<z.infer<typeof noIdCreateItemSchema>>({
        resolver: zodResolver(noIdCreateItemSchema),
        // defaultValues: {
        //     itemName: "",
        //     itemType: "OTHER",
        //     customerId: "",
        //     createdBy: session?.user.id
        // },
        defaultValues: {
            itemName: "",
            itemType: "OTHER",
            // itemBrand: "",
            // itemModel: "",
            // itemBarcode: "",
            // itemCountryOfOrigin: "",
            // dimensions: {
            //     height: 0,
            //     length: 0,
            //     width: 0
            // },
            dimensions: null,
            weightGrams: null,
            customerId: "",
            notes: "",

        },
        mode: "onChange"

    })

    // const [actionResult, action] = useActionState<CreateItemResponse, FormData>({action: createItemAction,} );
    // const [actionResult, action, isPending] = useActionState<CreateItemResponse, FormData>(createItemAction, { // ADDED initialState here
    //     success: false,
    //     error: undefined,
    // });
    // const [actionResult, action] = useActionState<CreateItemResponse, FormData>({action: createItemAction,} );
    const [state, formAction, isPending] = useActionState(createItemAction, null)
    const [selectedCustomer, setselectedCustomer] = useState("")



    // const pending = actionResult === undefined; // pending state is derived from actionResult being undefined initially
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        let actionResult = state
        console.log("useEffect triggered, actionResult:", actionResult); // Log actionResult at the beginning

        if (!actionResult) { // Do nothing if actionResult is still undefined (pending)
            return;
        }

        if (actionResult.success && actionResult.item) {

            toast({
                title: "Item Created!",
                description: `${actionResult.item.itemName} created successfully.`,
            });
            form.reset();
            isOpen(false);
            // router.push(`/items/${actionResult.item.id}`); // Example: Redirect to item detail page on success if needed
            console.log("Item created successfully:", actionResult.item);

        } else if (!actionResult.success) {
            if (typeof actionResult.error === "string") {
                toast({
                    title: "Error Creating Item",
                    description: actionResult.error,
                    variant: "destructive",
                });
                console.error("Server Action Error:", actionResult.error);
            } else {
                // Field validation errors from Zod
                // form.setError("itemName", { message: actionResult.error?.itemName?.join(', ') });
                // form.setError("itemType", { message: actionResult.error?.itemType?.join(', ') });
                // form.setError("customerId", { message: actionResult.error?.customerId?.join(', ') });
                // form.setError("itemBrand", { message: actionResult.error?.itemBrand?.join(', ') });
                // form.setError("itemModel", { message: actionResult.error?.itemModel?.join(', ') });
                // form.setError("itemBarcode", { message: actionResult.error?.itemBarcode?.join(', ') });
                // form.setError("itemCountryOfOrigin", { message: actionResult.error?.itemCountryOfOrigin?.join(', ') });
                // form.setError("weightGrams", { message: actionResult.error?.weightGrams?.join(', ') });
                // form.setError("dimensions.width", { message: actionResult.error?.dimensions?.join(', ') });
                // form.setError("dimensions.height", { message: actionResult.error?.dimensions?.join(', ') });
                // form.setError("dimensions.length", { message: actionResult.error?.dimensions?.join(', ') });
                // form.setError("notes", { message: actionResult.error?.notes?.join(', ') });
                // set errors for other fields as needed based on actionResult.error structure
                // if (actionResult.error) {
                //     // Iterate over the error object keys (field names)
                //     Object.keys(actionResult.error)
                //     .filter(fieldName => validFieldNames.includes(fieldName)) // Filter valid field names
                //     .forEach(fieldName => {
                //         // Check if there are errors for this field (still necessary)
                //         if (actionResult.error && actionResult.error as CreateItemResponse['error'] && (actionResult.error as CreateItemResponse['error'])[fieldName]) {
                //             form.setError(fieldName as keyof CreateItemsSchemaType, {
                //                 type: "manual",
                //                 message: (actionResult.error as CreateItemResponse['error'])[fieldName]?.join(', ') || "Validation error",
                //             });
                //         }
                //     });

                toast({
                    title: "Validation Error",
                    description: "Please check the form fields for errors.",
                    variant: "destructive",
                });
                console.error("Validation Errors:", actionResult.error);
            }
        }
        // Move query invalidation here, outside the inner if, but still within the useEffect and after checking for !actionResult
        if (actionResult.success) {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        }
    }, [state, form, queryClient, isOpen]); // Add router to dependency array if used





    // return (
    //     <Form {...form}>
    //         <form
    //             // onSubmit={form.handleSubmit((data) => action(data))} // Call action with FormData on submit
    //             // onSubmit={form.handleSubmit((data) => action(new FormData(formRef.current!)))} // Call action with FormData on submit
    //             // onSubmit={form.handleSubmit(() => action)}
    //             ref={formRef}
    //             // onSubmit={form.handleSubmit(async (data) => {

    //             //     console.log(data)
    //             //     // formAction(new FormData(formRef.current!))
    //             //     formAction(data)
    //             // })}
    //             action={(data) => formAction(data)}
    return (
        <Form {...form}>
            <form
                ref={formRef}
                // action={(data) => {
                //     console.log(form.getValues('customerId'))
                //     formAction(data)
                // }}
                action={async (data) => { // Make formAction async
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
                className="space-y-4">

                <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <CustomerSelector
                                    customersInput={customers}
                                    value={field.value}
                                    // {...field}
                                    onChange={field.onChange}
                                    // isRequired={true}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="itemType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Type</FormLabel>
                            <Select onValueChange={field.onChange}
                                // value={field.value || "OTHER"}
                                required={true}

                                {...field}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an item type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {/* <SelectItem key="SACK" value="SACK"> SACK</SelectItem>
                                    <SelectItem value="PALLET">PALLET</SelectItem>
                                    <SelectItem value="CARTON">CARTON</SelectItem>
                                    <SelectItem value="OTHER">OTHER</SelectItem>
                                    <SelectItem value="BOX">BOX</SelectItem>
                                    <SelectItem value="EQUIPMENT">EQUIPMENT</SelectItem>
                                    <SelectItem value="CAR">CAR</SelectItem> */}
                                    {itemTypes.options.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Item Name" {...field} required={true}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="itemBrand"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Brand</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Item Brand"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="itemModel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Model</FormLabel>
                            <FormControl>
                                <Input placeholder="Item Model" {...field} value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="itemBarcode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Barcode</FormLabel>
                            <FormControl>
                                <Input placeholder="Item Barcode" {...field} value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="itemCountryOfOrigin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Country of Origin</FormLabel>
                            <FormControl>
                                <Input placeholder="Item Country of Origin" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="weightGrams"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight (grams)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Weight in grams"
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Math.floor(Number(e.target.value)) : null)}
                                    // value={field.value ?? ''}
                                    value={field.value?.toString() ?? ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dimensions (cm)</FormLabel>
                            <FormDescription>
                                Enter dimensions in centimeters.
                            </FormDescription>
                            <div className="grid grid-cols-3 gap-2">
                                <FormField
                                    control={form.control}
                                    name="dimensions.width"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-right">Width</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Width"
                                                    type="number"
                                                    step="1"
                                                    {...field}
                                                    value={field.value?.toString() ?? ''}

                                                    onChange={(e) => field.onChange(e.target.value ? Math.floor(Number(e.target.value)) : null)}
                                                    />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dimensions.height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-right">Height</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Height"
                                                    type="number"
                                                    step="1"
                                                    {...field}
                                                    value={field.value?.toString() ?? ''}

                                                    onChange={(e) => field.onChange(e.target.value ? Math.floor(Number(e.target.value)) : null)}
                                                    />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dimensions.length"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-right">Length</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Length"
                                                    type="number"
                                                    step="1"
                                                    {...field}
                                                    //We need to use strings to display in the form not to get errors
                                                    value={field.value?.toString() ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value ? Math.floor(Number(e.target.value)) : null)}
                                                    />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                                <Textarea placeholder="Notes" {...field} value={field.value ?? undefined}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Item"}
                </Button>
            </form>
        </Form >
    );
}



