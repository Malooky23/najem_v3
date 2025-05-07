// src/components/dialogs/ExpenseInvoiceDialog/InvoiceDialog.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useExpenseItems } from "@/hooks/data/useExpenses"; // Import useExpenseItems
import { selectExpenseSchemaType } from "@/types/expense"; // Import type
import { useSearchOrderExpenses } from "@/hooks/data/useExpenses";
import { useSearchOrders } from "@/hooks/data/useOrders";
import { useState, useMemo, useEffect } from "react";
import CustomerDropdown from "@/components/ui/customer-dropdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Users, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OrderSchemaType } from "@/types/orders";
import { EnrichedOrderExpenseSchemaType } from "@/types/expense";
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
import { useCustomers } from "@/hooks/data/useCustomers";
import { generateInitialDescription } from "./InvoiceHelper";
import { useCreateZohoInvoice } from "@/hooks/data/useZoho";
import { toast } from "sonner";


interface CreateInvoiceDialogProps {
    selectedOrderIds: RowSelectionState;
}
interface CustomerSelectorProps {
    options: { id: string; name: string }[];
    onSelect: (customerId: string) => void;
    selectedValue: string | null;
}

const CustomerSelector = ({ options, onSelect, selectedValue }: CustomerSelectorProps) => {
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
    // --- State ---
    const [ isOpen, setIsOpen ] = useState(false);
    const [ selectedCustomerForNewInvoice, setSelectedCustomerForNewInvoice ] = useState<string | null>(null);
    const [ multipleCustomersDetected, setMultipleCustomersDetected ] = useState(false);
    const [ customerOptions, setCustomerOptions ] = useState<{ id: string; name: string }[]>([]);
    const [ chosenCustomerId, setChosenCustomerId ] = useState<string | null>(null);
    const {data: fetchedCustomers, isLoading: isCustomersLoading, isError: isCustomersError} = useCustomers()
    const CreateZohoInvoice = useCreateZohoInvoice()

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

    const { data: expenseItemsData, isLoading: isLoadingExpenseItems, isError: isErrorExpenseItems, error: errorExpenseItemsData } = useExpenseItems();


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

    // --- Fetch Orders ---
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
        },
        mode: "onSubmit"
    });
    const { handleSubmit, control, reset, formState: { isSubmitting, errors }, setError, setValue } = methods; // Add setValue

    const { fields, append, remove } = useFieldArray({ // Get append here
        control,
        name: "lineItems"
    });

    // --- Effect to Reset Form ---
    useEffect(() => {
        if (finalExpensesForInvoice && orderDetailsMap !== undefined) {
            const mappedData: LineItemFormData[] = finalExpensesForInvoice.map(exp => {
                // Find the corresponding expense item detail for tax info etc.
                const expenseItemDetail = expenseItemsData?.find(ei => ei.expenseItemId === exp.expenseItemId);
                return {
                    orderExpenseId: exp.orderExpenseId,
                    orderId: exp.orderId,
                    orderNumber: exp.orderNumber,
                    expenseItemId: exp.expenseItemId, // Keep the ID
                    expenseItemName: exp.expenseItemName, // Keep the name
                    description: generateInitialDescription(exp, orderDetailsMap),
                    quantity: exp.expenseItemQuantity ?? 1,
                    rate: exp.expenseItemPrice ?? 0,
                    // Use tax from expense item data if available, else default
                    tax: expenseItemDetail?.zohoTaxId ?? tax_id.five,
                };
            });
            reset({ lineItems: mappedData });
        } else {
            reset({ lineItems: [] });
        }
        // Add expenseItemsData as dependency
    }, [ finalExpensesForInvoice, orderDetailsMap, reset, expenseItemsData ]);

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
            // setSelectedCustomerForNewInvoice(null);
            // setMultipleCustomersDetected(false);
            // setCustomerOptions([]);
            // setChosenCustomerId(null);
            // reset({ lineItems: [] }); // Reset RHF
        }
    };

    // --- Form Submit Handler (UPDATED for zohoItemId) ---
    const onSubmit: SubmitHandler<InvoiceFormData> = (formData) => {
        console.log("--- onSubmit CALLED (Raw Form Data) ---");
        console.log(JSON.stringify(formData.lineItems, null, 2));

        if (!zohoCustomerId) {
            setError("root", { type: "manual", message: "Customer ID is missing." });
            return;
        }
        if (!expenseItemsData) {
            setError("root", { type: "manual", message: "Expense item details not loaded. Cannot create invoice." });
            return;
        }

        // --- MERGING LOGIC START ---
        const groupedItems = new Map<string, LineItemFormData>();

        formData.lineItems.forEach((item, index) => {
            const isSack = item.expenseItemName === "Sack - Small" || item.expenseItemName === "Sack - Large";
            let groupingKey: string;

            // Define grouping key: For sacks from the same order with the same rate, use a combined key. Otherwise, use a unique key.
            if (isSack && item.orderId && item.rate !== undefined && item.rate !== null) {
                groupingKey = `sack-${item.orderId}-${item.rate.toFixed(2)}`; // Use rate in key
            } else {
                // Use a unique key for non-sack items or sacks without orderId/rate
                // Using orderExpenseId for existing, or index for new/manual items as a fallback unique identifier during this process
                groupingKey = item.orderExpenseId ? `orig-${item.orderExpenseId}` : `new-${index}`;
            }

            const existingGroup = groupedItems.get(groupingKey);

            if (existingGroup && isSack && item.orderId && item.rate !== undefined && item.rate !== null) {
                // If it's a sack and a group already exists, sum the quantity
                existingGroup.quantity = (existingGroup.quantity ?? 0) + (item.quantity ?? 0);
                // Optional: Decide how to handle descriptions (e.g., keep the first one, concatenate, or generate new)
                // For simplicity, we'll keep the description of the first item added to the group.
            } else if (!existingGroup) {
                // If no group exists, add this item (create a copy to avoid modifying original form data directly if needed)
                groupedItems.set(groupingKey, { ...item });
            }
            // If a group exists but it's not a sack being merged, we simply ignore the current item
            // as the first one encountered (non-sack or unique sack) is already in the map.
        });

        const mergedLineItems = Array.from(groupedItems.values());
        console.log("--- Merged Line Items ---");
        console.log(JSON.stringify(mergedLineItems, null, 2));
        // --- MERGING LOGIC END ---


        // --- Map MERGED items to Zoho format ---
        const zohoLineItems = mergedLineItems.map((formItem, index) => { // Use mergedLineItems here
            let zohoItemId: string | undefined | null = undefined;
            let zohoItemName: string | undefined = undefined;

            if (formItem.expenseItemId) {
                const selectedExpenseItem = expenseItemsData.find(ei => ei.expenseItemId === formItem.expenseItemId);
                if (selectedExpenseItem) {
                    zohoItemId = selectedExpenseItem.zohoItemId;
                    if (!zohoItemId) {
                        console.warn(`Zoho Item ID missing for selected expense item: ${selectedExpenseItem.expenseName} (ID: ${formItem.expenseItemId}). Using name instead.`);
                        zohoItemName = selectedExpenseItem.expenseName;
                    }
                } else {
                    console.warn(`Selected expense item ID ${formItem.expenseItemId} not found in loaded expense items data.`);
                    zohoItemName = formItem.expenseItemName || `Unknown Item ${index + 1}`;
                }
            } else {
                console.warn(`Item at index ${index} has no expenseItemId selected.`);
                zohoItemName = formItem.expenseItemName || `Manual Item ${index + 1}`;
            }

            const zohoItem: any = {
                description: formItem.description || '',
                quantity: formItem.quantity, // Use the potentially summed quantity
                rate: formItem.rate,
                tax_id: formItem.tax,
            };

            if (zohoItemId) {
                zohoItem.item_id = zohoItemId;
            } else if (zohoItemName) {
                zohoItem.name = zohoItemName;
            } else {
                console.error(`Could not determine item_id or name for item at index ${index}`);
                zohoItem.name = `Error Item ${index + 1}`;
            }

            if (zohoItem.tax_id === undefined) delete zohoItem.tax_id;

            return zohoItem as z.infer<typeof CreateZohoInvoiceDataSchema.shape.line_items.element>;
        });

        const zohoInvoiceData: OriginalInvoiceData = {
            customer_id: zohoCustomerId,
            line_items: zohoLineItems,
            // --- Add other optional fields as needed ---
            // date: format(new Date(), 'yyyy-MM-dd'), // Set current date
            // reference_number: `Order(s): ${uniqueOrderNumbersForDisplay.join(', ')}`, // Example reference
            // notes: "Invoice generated from order expenses.", // Example notes
            // terms: "Payment due upon receipt.", // Example terms
            // currency_id: "YOUR_CURRENCY_ID", // Specify if needed, e.g., AED
            // place_of_supply: "YOUR_PLACE_OF_SUPPLY", // Specify if needed, e.g., AE
        };

        // 4. Validate the transformed data against Zoho schema
        const validationResult = CreateZohoInvoiceDataSchema.safeParse(zohoInvoiceData);

        if (!validationResult.success) {
            console.error("--- Transformed Data Validation FAILED ---");
            console.error(validationResult.error.format());
            setError("root", { type: "manual", message: "Failed to prepare data in the required format. Check console." });
            return;
        }

        console.log("--- Transformed Data for Zoho (Validated) ---");
        console.log(validationResult.data);

        // --- Replace console.log with your actual API mutation call using validationResult.data ---
        CreateZohoInvoice.mutate(validationResult.data);

        if (CreateZohoInvoice.isSuccess){
            setSelectedCustomerForNewInvoice(null);
            setMultipleCustomersDetected(false);
            setCustomerOptions([]);
            setChosenCustomerId(null);
            reset({ lineItems: [] });
            // setIsOpen(false)
            handleOpenChange
        }


        // Simulate API call duration
        // return new Promise(resolve => setTimeout(() => {
        //     console.log("--- Submission Complete (Simulated) ---");
        //     resolve(undefined);
        // }, 1500));
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

    const zohoCustomerId = useMemo(() => {
        if (!fetchedCustomers || !invoiceCustomerId) {
            return null; // Or some other default value if no customer is found or loading
        }
        const foundCustomer = fetchedCustomers.find(
            (customer) => customer.customerId === invoiceCustomerId
        );

        return foundCustomer?.zohoCustomerId ?? null; // Return the customerId if found, otherwise null
    }, [ fetchedCustomers, invoiceCustomerId ]);

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
    // Update loading state check
    const isOverallLoading = isLoadingExpenses || (isOrderQueryEnabled && isLoadingOrders) || isLoadingExpenseItems || isCustomersLoading;
    const isProcessing = isOverallLoading || isSubmitting;

    const showLoadingState = isOverallLoading && fields.length === 0;
    const showErrorState = (isErrorExpenses || (isOrderQueryEnabled && isErrorOrders)) && !isOverallLoading || isCustomersError; 
    const showCustomerSelectionPrompt = !isOverallLoading && !showErrorState && hasInitialSelection && multipleCustomersDetected && !chosenCustomerId;
    const showNewInvoiceCustomerDropdown = !hasInitialSelection && !selectedCustomerForNewInvoice;
    const showInvoiceLayout = !showLoadingState && !showErrorState && !showCustomerSelectionPrompt && (hasInitialSelection || selectedCustomerForNewInvoice);

    const combinedErrorMessage = [
        errorExpenses?.message,
        isOrderQueryEnabled && errorOrders?.message,
        errorExpenseItemsData?.message // Add expense items error
    ].filter(Boolean).join('; ') || "An unknown error occurred.";

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant={hasInitialSelection ? "default" : "outline"}>
                    Create Invoice
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[90%] h-[90vh] flex flex-col p-0 border-0">
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
                                        customersInput={fetchedCustomers}
                                        onSelect={handleCustomerSelectForNewInvoice}
                                        value={selectedCustomerForNewInvoice}
                                        className="w-full max-w-sm"
                                    />
                                </div>
                            )}


                            {showInvoiceLayout && (
                                <div className="grid grid-cols-1 md:grid-cols-10 gap-6 h-full">
                                    <div className="md:col-span-3 flex flex-col gap-4">
                                        {/* ... Customer Info Card (unchanged) ... */}
                                        <InvoiceCustomerInfoCard
                                            customerName={finalCustomerName}
                                            customerId={invoiceCustomerId}
                                            orderNumbers={uniqueOrderNumbersForDisplay}
                                        />
                                    </div>

                                    <div className="md:col-span-7 h-full">
                                        {/* Pass expenseItemsData to table */}
                                        <InvoiceLineItemsTable
                                            isLoading={isOverallLoading}
                                            orderDetailsMap={orderDetailsMap}
                                            fields={fields}
                                            remove={remove}
                                            append={append}
                                            isProcessing={isProcessing}
                                            expenseItemsData={expenseItemsData}
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
                                type="submit"
                                // Disable if no items, processing, or layout not shown
                                disabled={fields.length === 0 || isProcessing || !showInvoiceLayout}
                                className="min-w-[120px] animate-in slide-in-from-top"
                            >
                                {(isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Creating..." : (isOverallLoading ? "Loading..." : (fields.length === 0 ? "No Items" : "Create Invoice"))}
                            </Button>
                        </DialogFooter>
                    </FormProvider>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { CreateInvoiceDialog as default };
