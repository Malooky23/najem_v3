'use client'

import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useSearchOrderExpenses } from "@/hooks/data/useExpenses";
import { useSearchOrders } from "@/hooks/data/useOrders"; // Correct import
import { useState, useMemo, useEffect } from "react";
import CustomerDropdown from "@/components/ui/customer-dropdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Users, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OrderSchemaType } from "@/types/orders";
import { EnrichedOrderExpenseSchemaType } from "@/types/expense"; // Keep this
import {
    CreateZohoInvoiceDataSchema,
    OriginalInvoiceData,
    tax_id,
    ZOHO_ITEM_ID
} from "@/types/types.zoho"
import { InvoiceCustomerInfoCard } from "./InvoiceCustomerInfoCard";
import { InvoiceLineItemsTable } from "./InvoiceLineItemsTable";

// --- React Hook Form Imports ---
import { useForm, useFieldArray, Controller, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { InvoiceFormData, invoiceFormSchema, LineItemFormData } from "@/types/type.invoice";
// ---



// --- Helper to generate description (can be moved to utils) ---
const generateInitialDescription = (
    item: EnrichedOrderExpenseSchemaType,
    orderDetailsMap: Map<string, { createdAt: Date | string | null; orderMark: string | null }> | undefined
): string | undefined => {
    const isSackItem = item.expenseItemName === "Sack Small" || item.expenseItemName === "Sack Large";
    if (isSackItem) {
        const orderDetails = item.orderId ? orderDetailsMap?.get(item.orderId) : undefined;
        if (orderDetails) {
            const formattedDate = formatDate(orderDetails.createdAt); // Use formatDate helper
            const mark = orderDetails.orderMark ?? 'N/A';
            const quantity = item.expenseItemQuantity ?? 0;
            return `Date: ${formattedDate ?? 'N/A'} | Mark: ${mark} | Total Sacks: ${quantity}`;
        }
        return 'Loading order details...'; // Fallback
    }
    return item.notes ?? undefined; // Use original notes as default otherwise
};

// Helper to format date (copy from InvoiceLineItemsTable or move to utils)
const formatDate = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    try {
        // Ensure date-fns is imported if used here
        // import { format } from 'date-fns';
        return format(new Date(date), 'yyyy-MM-dd');
    } catch { return 'Invalid Date'; }
};


interface CreateInvoiceDialogProps {
    selectedOrderIds: RowSelectionState;
}
interface CustomerSelectorProps {
    options: { id: string; name: string }[];
    onSelect: (customerId: string) => void;
    selectedValue: string | null;
}

interface CustomerSelectorProps { /* ... unchanged ... */ }
const CustomerSelector = ({ options, onSelect, selectedValue }: CustomerSelectorProps) => { /* ... unchanged ... */
    return (
        <div className="space-y-3 p-4 border rounded bg-amber-50 border-amber-200 max-w-md mx-auto"> {/* Centered selector */}
            <div className="flex items-center gap-2 text-amber-800">
                <Users className="h-5 w-5" />
                <p className="font-medium">Multiple Customers Detected</p>
            </div>
            <p className="text-sm text-amber-700">
                The selected expenses belong to different customers. Please choose which customer this invoice should be associated with. Only expenses for the selected customer will be included.
            </p>
            <div className="grid gap-2">
                <Label htmlFor="customer-select" className="text-amber-800">Select Invoice Customer</Label>
                <Select onValueChange={onSelect} value={selectedValue ?? undefined}>
                    <SelectTrigger id="customer-select" className="w-full">
                        <SelectValue placeholder="-- Select a customer --" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(opt => (
                            <SelectItem key={opt.id} value={opt.id}>
                                {opt.name} (ID: {opt.id})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};


export const CreateInvoiceDialog = ({ selectedOrderIds }: CreateInvoiceDialogProps) => {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ selectedCustomerForNewInvoice, setSelectedCustomerForNewInvoice ] = useState<string | null>(null);
    const [ multipleCustomersDetected, setMultipleCustomersDetected ] = useState(false);
    const [ customerOptions, setCustomerOptions ] = useState<{ id: string; name: string }[]>([]);
    const [ chosenCustomerId, setChosenCustomerId ] = useState<string | null>(null);

    const initialExpenseIds = useMemo(() => {
        const keys = Object.keys(selectedOrderIds);
        return keys.length > 0 ? keys : null;
    }, [ selectedOrderIds ]);

    const hasInitialSelection = !!initialExpenseIds;

    // --- Fetch Expenses ---
    const expenseQueryParams = useMemo(() => ({
        orderExpenseIds: initialExpenseIds ?? undefined,
        customerId: !hasInitialSelection ? selectedCustomerForNewInvoice ?? undefined : undefined,
    }), [ initialExpenseIds, selectedCustomerForNewInvoice, hasInitialSelection ]);

    const isExpenseQueryEnabled = useMemo(() => {
        return isOpen && (!!initialExpenseIds || (!initialExpenseIds && !!selectedCustomerForNewInvoice));
    }, [ isOpen, initialExpenseIds, selectedCustomerForNewInvoice ]);

    const { data: orderExpenses, isLoading: isLoadingExpenses, isError: isErrorExpenses, error: errorExpenses, isFetching: isFetchingExpenses } = useSearchOrderExpenses(
        expenseQueryParams,
        { enabled: isExpenseQueryEnabled }
    );

    useEffect(() => {
        // ... (effect implementation unchanged)
        setMultipleCustomersDetected(false);
        setCustomerOptions([]);

        if (hasInitialSelection && !isLoadingExpenses && !isFetchingExpenses && orderExpenses && orderExpenses.length > 0) {
            const customerMap = new Map<string, string>();
            orderExpenses.forEach(expense => {
                if (expense.customerId && expense.customerName) {
                    customerMap.set(expense.customerId, expense.customerName);
                }
            });
            const uniqueCustomers = Array.from(customerMap.entries()).map(([ id, name ]) => ({ id, name }));
            if (uniqueCustomers.length > 1) {
                setMultipleCustomersDetected(true);
                setCustomerOptions(uniqueCustomers);
                if (chosenCustomerId && !uniqueCustomers.some(c => c.id === chosenCustomerId)) {
                    setChosenCustomerId(null);
                }
            } else {
                if (chosenCustomerId) setChosenCustomerId(null);
            }
        } else if (!hasInitialSelection) {
            if (chosenCustomerId) setChosenCustomerId(null);
        }
    }, [ orderExpenses, hasInitialSelection, isLoadingExpenses, isFetchingExpenses, chosenCustomerId ]);

    const finalExpensesForInvoice = useMemo(() => {
        // Use expense loading/error states here
        if (isLoadingExpenses || isFetchingExpenses || isErrorExpenses || !orderExpenses) return undefined;
        if (!hasInitialSelection) return orderExpenses;
        if (multipleCustomersDetected) {
            if (!chosenCustomerId) return undefined;
            return orderExpenses.filter(expense => expense.customerId === chosenCustomerId);
        } else {
            return orderExpenses;
        }
    }, [ orderExpenses, hasInitialSelection, multipleCustomersDetected, chosenCustomerId, isLoadingExpenses, isFetchingExpenses, isErrorExpenses ]);


    const uniqueOrderIdsForFetching = useMemo(() => {
        if (!finalExpensesForInvoice) return [];
        // Use orderId for fetching
        const ids = finalExpensesForInvoice.map(item => item.orderId).filter(id => !!id);
        return Array.from(new Set(ids));
    }, [ finalExpensesForInvoice ]);

    const isOrderQueryEnabled = isOpen && uniqueOrderIdsForFetching.length > 0;

    const { data: fetchedOrdersData, isLoading: isLoadingOrders, isFetching: isFetchingOrders, isError: isErrorOrders, error: errorOrders } = useSearchOrders({ orderIds: uniqueOrderIdsForFetching }, { enabled: isOrderQueryEnabled });

    // --- Create Map for Order Details ---
    const orderDetailsMap = useMemo(() => {
        if (!fetchedOrdersData) return undefined;
        const map = new Map<string, { createdAt: Date | string | null; orderMark: string | null }>();
        // Ensure fetchedOrdersData is an array before trying to iterate
        if (Array.isArray(fetchedOrdersData)) {
            fetchedOrdersData.forEach((order: OrderSchemaType) => {
                // Check if orderId exists before setting
                if (order.orderId) {
                    map.set(order.orderId, {
                        createdAt: order.createdAt ?? null, // Handle potential null/undefined
                        orderMark: order.orderMark ?? null   // Handle potential null/undefined
                    });
                }
            });
        } else {
            console.warn("useSearchOrders did not return an array:", fetchedOrdersData);
        }
        return map;
    }, [ fetchedOrdersData ]);


    // --- React Hook Form Setup ---
    const methods = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            lineItems: []
        }
    });
    const { handleSubmit, control, reset, formState: { isSubmitting, errors } } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lineItems"
    });


    // --- Effect to Reset Form when Initial Data is Ready ---
    useEffect(() => {
        if (finalExpensesForInvoice && orderDetailsMap !== undefined) { // Ensure map is also ready (or handle undefined case)
            const mappedData: LineItemFormData[] = finalExpensesForInvoice.map(exp => ({
                orderExpenseId: exp.orderExpenseId,
                orderId: exp.orderId,
                orderNumber: exp.orderNumber,
                expenseItemId: exp.expenseItemId,
                expenseItemName: exp.expenseItemName,
                // --- Set initial description dynamically ---
                description: generateInitialDescription(exp, orderDetailsMap),
                // --- Use original values ---
                quantity: exp.expenseItemQuantity ?? 1, // Default to 1 if null/undefined
                rate: exp.expenseItemPrice ?? 0,
                tax: tax_id.five, // Default tax to 0
            }));
            reset({ lineItems: mappedData });
        } else {
            reset({ lineItems: [] }); // Reset if data becomes unavailable
        }
    }, [ finalExpensesForInvoice, orderDetailsMap, reset ]); // Depend on data and map

    // --- Event Handlers ---
    const handleCustomerSelectForNewInvoice = (customerId: string | null) => {
        setSelectedCustomerForNewInvoice(customerId);
        setChosenCustomerId(null);
        setMultipleCustomersDetected(false);
    };
    const handleChosenCustomerSelect = (customerId: string) => { setChosenCustomerId(customerId); };
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset local state AND form state on close
            setSelectedCustomerForNewInvoice(null);
            setMultipleCustomersDetected(false);
            setCustomerOptions([]);
            setChosenCustomerId(null);
            reset({ lineItems: [] }); // Reset RHF
        }
    };

    // --- Form Submit Handler ---
    // const onSubmit: SubmitHandler<InvoiceFormData> = (data) => {
    //     console.log("--- Invoice Creation Data ---");
    //     console.log("Associated Customer ID:", invoiceCustomerId); // Use existing derived value
    //     console.log("Line Items:", data.lineItems);
    //     // Replace console.log with your actual API mutation call
    //     // e.g., createInvoiceMutation.mutate({ customerId: invoiceCustomerId, ...data });

    //     // Simulate API call duration
    //     return new Promise(resolve => setTimeout(() => {
    //         console.log("--- Submission Complete ---");
    //         resolve(undefined);
    //         // Optionally close dialog on success
    //         // handleOpenChange(false);
    //     }, 1500));
    // };

    // --- Form Submit Handler ---
    const onSubmit: SubmitHandler<InvoiceFormData> = (formData) => {
        console.log("--- onSubmit CALLED (Raw Form Data) ---");
        console.log(formData);

        // --- Transformation Logic ---

        // 1. Check for required customer ID
        if (!invoiceCustomerId) {
            console.error("Cannot create invoice: Missing Associated Customer ID.");
            // Optionally show an error to the user (e.g., using a toast or alert)
            methods.setError("root", { type: "manual", message: "Customer ID is missing." }); // Set RHF error
            return; // Stop submission
        }

        // 2. Map line items
        const zohoLineItems = formData.lineItems.map(formItem => {

            // Construct the Zoho line item
            const zohoItem: z.infer<typeof CreateZohoInvoiceDataSchema.shape.line_items.element> = {
                // Prioritize item_id if expenseItemId exists, otherwise use name
                // item_id: formItem.expenseItemId || undefined, // Map expenseItemId to item_id
                item_id: ZOHO_ITEM_ID[ formItem.expenseItemName as keyof typeof ZOHO_ITEM_ID ],
                // name: !formItem.expenseItemId ? formItem.expenseItemName || 'Unknown Item' : undefined, // Use name if item_id is missing
                description: formItem.description || '', // Use form description or default to empty string
                quantity: formItem.quantity,
                rate: formItem.rate,
                tax_id: formItem.tax,
            };

            // Clean up undefined properties that might cause issues with Zoho API
            if (zohoItem.item_id === undefined) delete zohoItem.item_id;
            if (zohoItem.name === undefined) delete zohoItem.name;
            if (zohoItem.tax_id === undefined) delete zohoItem.tax_id;


            return zohoItem;
        });

        // 3. Construct the final Zoho invoice data object
        const zohoInvoiceData: OriginalInvoiceData = {
            customer_id: invoiceCustomerId,
            line_items: zohoLineItems,
            // --- Add other optional fields as needed ---
            date: format(new Date(), 'yyyy-MM-dd'), // Set current date
            // reference_number: `Order(s): ${uniqueOrderNumbersForDisplay.join(', ')}`, // Example reference
            // notes: "Invoice generated from order expenses.", // Example notes
            // terms: "Payment due upon receipt.", // Example terms
            // currency_id: "YOUR_CURRENCY_ID", // Specify if needed, e.g., AED
            // place_of_supply: "YOUR_PLACE_OF_SUPPLY", // Specify if needed, e.g., AE
        };

        // 4. (Optional but Recommended) Validate the transformed data against Zoho schema
        const validationResult = CreateZohoInvoiceDataSchema.safeParse(zohoInvoiceData);

        if (!validationResult.success) {
            console.error("--- Transformed Data Validation FAILED ---");
            console.error(validationResult.error.format());
            // Show error to user indicating a problem preparing data for Zoho
            methods.setError("root", { type: "manual", message: "Failed to prepare data in the required format. Check console for details." });
            return; // Stop submission
        }

        // 5. Log the VALIDATED transformed data
        console.log("--- Transformed Data for Zoho (Validated) ---");
        console.log(validationResult.data); // Log the data that passed validation

        // --- Replace console.log with your actual API mutation call using validationResult.data ---
        // e.g., createZohoInvoiceMutation.mutate(validationResult.data);

        // Simulate API call duration
        return new Promise(resolve => setTimeout(() => {
            console.log("--- Submission Complete (Simulated) ---");
            resolve(undefined);
            // Optionally close dialog on success
            // handleOpenChange(false);
        }, 1500));
    };


    const onError = (validationErrors: any) => { // Add onError handler
        console.error("RHF Validation Errors:", validationErrors);
        // Optionally show a toast or message to the user about validation errors
    };



    // --- Derived data for components ---
    const invoiceCustomerId = useMemo(() => {
        if (!hasInitialSelection) return selectedCustomerForNewInvoice;
        if (multipleCustomersDetected) return chosenCustomerId;
        return finalExpensesForInvoice?.[ 0 ]?.customerId ?? null;
    }, [ hasInitialSelection, selectedCustomerForNewInvoice, multipleCustomersDetected, chosenCustomerId, finalExpensesForInvoice ]);

    const finalCustomerName = useMemo(() => {
        if (!invoiceCustomerId) return null;
        if (multipleCustomersDetected && chosenCustomerId) {
            return customerOptions.find(c => c.id === chosenCustomerId)?.name ?? null;
        }
        return finalExpensesForInvoice?.[ 0 ]?.customerName ?? null;
    }, [ invoiceCustomerId, multipleCustomersDetected, chosenCustomerId, customerOptions, finalExpensesForInvoice ]);

    // Use orderNumber for display in the card, as per your edit
    const uniqueOrderNumbersForDisplay = useMemo(() => {
        if (!finalExpensesForInvoice) return [];
        const numbers = finalExpensesForInvoice.map(item => item.orderNumber?.toString() ?? '-');
        return Array.from(new Set(numbers));
    }, [ finalExpensesForInvoice ]);


    // --- Render Logic ---
    // Combine loading states
    const isOverallLoading = isLoadingExpenses || (isOrderQueryEnabled && isLoadingOrders);
    // Use RHF's isSubmitting for submission state
    const isProcessing = isOverallLoading || isSubmitting;

    // Determine content state
    const showLoadingState = isOverallLoading && fields.length === 0; // Show loading if RHF fields aren't populated yet
    const showErrorState = (isErrorExpenses || (isOrderQueryEnabled && isErrorOrders)) && !isOverallLoading;
    const showCustomerSelectionPrompt = !isOverallLoading && !showErrorState && hasInitialSelection && multipleCustomersDetected && !chosenCustomerId;
    const showNewInvoiceCustomerDropdown = !hasInitialSelection && !selectedCustomerForNewInvoice;
    // Show layout if not in other states AND (initial selection done OR new invoice customer selected)
    const showInvoiceLayout = !showLoadingState && !showErrorState && !showCustomerSelectionPrompt && (hasInitialSelection || selectedCustomerForNewInvoice);

    const combinedErrorMessage = [ /* ... unchanged ... */ ].filter(Boolean).join('; ') || "An unknown error occurred.";


    return (
        // Wrap with FormProvider
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant={hasInitialSelection ? "default" : "outline"}>
                    Create Invoice
                </Button>
            </DialogTrigger>

            {/* Use onSubmit with handleSubmit */}
            <DialogContent
                // asChild
                // onSubmit={handleSubmit(onSubmit)}
                className="max-w-[90%] h-[90vh] flex flex-col p-0 border-0"
            >
                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col h-full">

                    <FormProvider {...methods}>

                        <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                            <DialogTitle className="text-2xl">
                                {hasInitialSelection ? "Create Invoice from Selection" : "Create Invoice for Customer"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-grow p-6 overflow-y-auto">
                            {showLoadingState && (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="text-muted-foreground">Loading data...</span>
                                </div>
                            )}

                            {showErrorState && (
                                <div className="flex items-center justify-center h-full">
                                    <Alert variant="destructive" className="max-w-lg">
                                        <AlertTitle>Error Loading Data</AlertTitle>
                                        <AlertDescription>{combinedErrorMessage}</AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            {showCustomerSelectionPrompt && (
                                <div className="flex items-center justify-center h-full">
                                    <CustomerSelector
                                        options={customerOptions}
                                        onSelect={handleChosenCustomerSelect}
                                        selectedValue={chosenCustomerId}
                                    />
                                </div>
                            )}

                            {showNewInvoiceCustomerDropdown && (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <p className="text-muted-foreground">Select a customer to generate an invoice for their outstanding expenses.</p>
                                    <CustomerDropdown
                                        isModal={true}
                                        onSelect={handleCustomerSelectForNewInvoice}
                                        value={selectedCustomerForNewInvoice}
                                        className="w-full max-w-sm"
                                    />
                                </div>
                            )}


                            {showInvoiceLayout && (
                                <div className="grid grid-cols-1 md:grid-cols-10 gap-6 h-full">
                                    <div className="md:col-span-3 flex flex-col gap-4">
                                        {/* ... Customer confirmation Alert ... */}
                                        <InvoiceCustomerInfoCard
                                            customerName={finalCustomerName}
                                            customerId={invoiceCustomerId}
                                            orderNumbers={uniqueOrderNumbersForDisplay}
                                        />
                                    </div>

                                    <div className="md:col-span-7 h-full">
                                        {/* Pass RHF props to table */}
                                        <InvoiceLineItemsTable
                                            isLoading={isOverallLoading} // Pass loading state for initial display
                                            orderDetailsMap={orderDetailsMap}
                                            fields={fields}
                                            remove={remove}
                                        />
                                        {/* Display RHF validation errors for the array */}
                                        {errors.lineItems?.message && (
                                            <p className="text-sm font-medium text-destructive mt-2">{errors.lineItems.message}</p>
                                        )}
                                        {errors.lineItems?.root?.message && (
                                            <p className="text-sm font-medium text-destructive mt-2">{errors.lineItems.root.message}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isProcessing}>Cancel</Button>
                            <Button
                                type="submit" // Make this the submit button
                                // Disable based on form state and data readiness
                                disabled={fields.length === 0 || isProcessing || !showInvoiceLayout}
                                className="min-w-[120px]"
                            >
                                {(isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Creating..." : (isOverallLoading ? "Loading..." : (fields.length === 0 ? "No Items" : "Create Invoice"))}
                            </Button>
                        </DialogFooter>

                    </FormProvider>
                </form>

            </DialogContent>
        </Dialog >
    );
};

export { CreateInvoiceDialog as default };
