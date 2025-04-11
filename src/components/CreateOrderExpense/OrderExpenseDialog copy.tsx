"use client"

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobileTEST } from "@/hooks/use-media-query";
import { OrderItemsTable } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderItemsTable";
import { useSelectedOrderData } from "@/stores/orders-store";
import { Textarea } from "@/components/ui/textarea";
import { OrderInfoCard } from "./OrderInfoCard";
// Import the necessary schema and types
import { createOrderExpenseSchema, createOrderExpenseSchemaType, selectExpenseSchemaType, orderExpenseSchema } from "@/types/expense"; // Import orderExpenseSchema for single item type
import { useQuery } from "@tanstack/react-query";
import { z } from "zod"; // Keep z import for inference

import { useSession } from "next-auth/react";
import { useCreateOrderExpense } from "@/hooks/data/useOrders";
import { LoadingSpinner } from "../ui/loading-spinner";

// Use the imported schema for a single item, making orderExpenseId optional for creation scenario
// This represents the data structure *before* DB insertion/update

// Define an augmented type for state management with numeric clientId
// Include optional orderExpenseId for existing items
type CreateOrderExpenseItem = z.infer<typeof createOrderExpenseSchema.element>;

type OrderExpenseWithClient = CreateOrderExpenseItem & { clientId: number };


// --- CSS Transition Duration ---
const EXIT_ANIMATION_DURATION = 300;

interface OrderExpenseDialogProps {
    children: ReactNode;
    // No longer passing initialExpenses/Notes via props, using store (useSelectedOrderData)
}


// --- Component ---
export function OrderExpenseDialog({
    children,
}: OrderExpenseDialogProps) {

    const orderData = useSelectedOrderData();
    // Ensure orderData is loaded before rendering the dialog content logic
    // A loading state or conditional rendering might be needed if orderData loads async within this component's scope
    if (!orderData) {
        // Or return a loading indicator, or rely on parent component's loading state
        console.error("OrderExpenseDialog: No Order Selected in store");
        // Render the trigger but maybe disable it or show loading inside DialogContent later
        return <Dialog><DialogTrigger asChild>{children}</DialogTrigger></Dialog>;
    }

    // Extract initial expenses from the store data
    // Map them to include the optional orderExpenseId
    const initialExpenses: createOrderExpenseSchemaType = orderData.expenses?.map(exp => ({
        orderExpenseId: exp.orderExpenseId, // Keep existing ID
        orderId: exp.orderId,
        expenseItemId: exp.expenseItemId,
        expenseItemQuantity: exp.expenseItemQuantity,
        notes: exp.notes,
        createdBy: exp.createdBy, // Keep original creator if needed, or update later
    })) ?? [];

    const { mutateAsync, isPending, isSuccess, isError } = useCreateOrderExpense(); // Still using create for now

    // --- State ---
    const [isOpen, setIsOpen] = useState(false);
    const [nextClientId, setNextClientId] = useState(() => {
        // Initialize counter based on initial expenses length + 1
        return initialExpenses.length + 1;
    });
    // Initialize state with potentially existing expenses, adding clientId
    const [expenses, setExpenses] = useState<OrderExpenseWithClient[]>(() =>
        initialExpenses.map((exp, index) => ({
            ...exp,
            // Ensure orderId is correctly set from the main orderData
            orderId: orderData.orderId,
            clientId: index + 1 // Use index for initial client IDs
        }))
    );
    const [expenseNotes, setExpenseNotes] = useState(orderData.notes ?? ""); // Use order notes for the general notes field
    const [exitingExpenseIds, setExitingExpenseIds] = useState<Set<number>>(new Set());


    // --- Refs ---
    const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

    // --- Hooks ---
    const isMobile = useIsMobileTEST();
    const { data: session } = useSession();

    // Fetch available expense items (unchanged)
    const { data: expenseItemsData, isLoading: isExpenseItemsLoading, isError: isExpenseItemsError } = useQuery<selectExpenseSchemaType[]>({
        queryKey: ["expenseItems"],
        queryFn: async (): Promise<selectExpenseSchemaType[]> => {
            const demo: selectExpenseSchemaType[] = [
                { expenseItemId: "1aa82b76-fbf0-42ea-b17a-395e87cbf2fb", expenseName: "Sack Small", expensePrice: 5, expenseCategory: "PACKING", notes: "Small sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
                { expenseItemId: "35608ed0-5472-4fc5-ae7d-049d9d46453b", expenseName: "Sack Large", expensePrice: 5, expenseCategory: "PACKING", notes: "Large sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
                { expenseItemId: "c8a9f0b1-e2d3-4c5b-8a9f-0b1e2d3c4b5a", expenseName: "Loading", expensePrice: 10, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
                { expenseItemId: "969f409b-c721-43a1-b0a3-40950b8434fe", expenseName: "Offloading", expensePrice: 15, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
            ];
            await new Promise(resolve => setTimeout(resolve, 500));
            return demo;
        },
    });


    // --- Effects ---
    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach(timeoutId => clearTimeout(timeoutId));
            timeouts.clear();
        };
    }, []);

    // Reset state when dialog opens/closes or orderData changes
    // This ensures we load fresh initial data each time
    useEffect(() => {
        if (isOpen && orderData) {
            const initialExpensesMapped: createOrderExpenseSchemaType = orderData.expenses?.map(exp => ({
                orderExpenseId: exp.orderExpenseId,
                orderId: exp.orderId,
                expenseItemId: exp.expenseItemId,
                expenseItemQuantity: exp.expenseItemQuantity,
                notes: exp.notes,
                createdBy: exp.createdBy,
            })) ?? [];

            setExpenses(initialExpensesMapped.map((exp, index) => ({
                 ...exp,
                 orderId: orderData.orderId, // Ensure orderId is current
                 clientId: index + 1
            })));
            setNextClientId(initialExpensesMapped.length + 1);
            setExpenseNotes(orderData.notes ?? "");
            setExitingExpenseIds(new Set()); // Clear exiting IDs
        }
    }, [isOpen, orderData]); // Rerun when dialog opens or orderData changes


    // --- Event Handlers ---
    const addExpense = () => {
        if (!expenseItemsData || expenseItemsData.length === 0 || !session?.user.id) {
            console.warn("Cannot add expense: No expense items loaded or user not logged in.");
            return;
        }

        const defaultExpenseItem = expenseItemsData[0];
        // New expenses don't have orderExpenseId
        const newExpense: OrderExpenseWithClient = {
            clientId: nextClientId,
            orderId: orderData.orderId, // Use current orderId
            expenseItemId: defaultExpenseItem.expenseItemId,
            expenseItemQuantity: 1,
            notes: undefined,
            createdBy: session.user.id, // Set creator to current user
            // orderExpenseId is omitted
        };

        setExpenses(prevExpenses => [...prevExpenses, newExpense]);
        setNextClientId(prevId => prevId + 1);
    };


    // Use keys from the CreateOrUpdateOrderExpenseItem type
    const updateExpense = (clientId: number, field: keyof CreateOrderExpenseItem, value: any) => {
        setExpenses(prevExpenses =>
            prevExpenses.map((expense) => {
                if (expense.clientId !== clientId) return expense;

                let processedValue = value;
                if (field === "expenseItemQuantity") {
                    const numValue = Number.parseInt(String(value), 10);
                    processedValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
                } else if (field === "notes") {
                    processedValue = value === "" ? null : value; // Allow null internally
                }
                // Prevent updating orderId or createdBy via this handler
                if (field === 'orderId' || field === 'createdBy' || field === 'orderExpenseId') {
                    return expense; // Don't allow modification of these fields here
                }

                return { ...expense, [field]: processedValue };
            })
        );
    };


    const removeExpense = (clientId: number) => {
        if (exitingExpenseIds.has(clientId) || !timeoutsRef.current) return;

        setExitingExpenseIds(prev => new Set(prev).add(clientId));

        const timeoutId = setTimeout(() => {
            setExpenses(prev => prev.filter(exp => exp.clientId !== clientId));
            setExitingExpenseIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(clientId);
                return newSet;
            });
            timeoutsRef.current.delete(clientId);
        }, EXIT_ANIMATION_DURATION);

        timeoutsRef.current.set(clientId, timeoutId);
    };

    // !! IMPORTANT !! This function needs to be adapted based on the chosen submission strategy (Option 1, 2, or 3)
    const handleUpdate = async () => { // Make async for mutateAsync
        if (!session?.user.id) {
            console.error("User not authenticated.");
            // TODO: Show error toast
            return;
        }

        const activeExpenses = expenses.filter(exp => !exitingExpenseIds.has(exp.clientId));

        // --- Logic depends on chosen strategy ---

        // == STRATEGY 1: Current Backend (Insert Only - Creates Duplicates) ==
        const expensesToSubmit: createOrderExpenseSchemaType = activeExpenses.map((exp) => ({
            // Include orderExpenseId if it exists, otherwise it's undefined (matching schema)
            orderExpenseId: exp.orderExpenseId,
            orderId: exp.orderId,
            expenseItemId: exp.expenseItemId,
            expenseItemQuantity: exp.expenseItemQuantity,
            createdBy: exp.createdBy, // Keep original creator or update? For now, keep. Schema requires it.
            notes: exp.notes === null ? undefined : exp.notes,
        }));

        console.log("Submitting Expenses (Strategy 1 - Insert Only):", JSON.stringify(expensesToSubmit, null, 2));

        try {
            // Validate the payload against the schema expected by the backend
            const validatedValues = createOrderExpenseSchema.safeParse(expensesToSubmit);
            if (!validatedValues.success) {
                 console.error("Validation failed:", validatedValues.error.format());
                 // TODO: Show validation error toast
                 return; // Stop submission
            }
            console.log("Validation successful.");

            await mutateAsync(validatedValues.data); // Call the mutation

            // Note: isSuccess might not be immediately true after await, handle success/error in mutation's callbacks or check result
            // Consider closing dialog in onSuccess callback of useMutationFactory
            setIsOpen(false); // Close dialog optimistically or on success

        } catch (error) {
            console.error("Submission failed:", error);
            // TODO: Show error toast
        }

        // == STRATEGY 2: Prepare for Future Backend (Log Separated Lists) ==
        /*
        const itemsToInsert: CreateOrUpdateOrderExpenseItem[] = [];
        const itemsToUpdate: CreateOrUpdateOrderExpenseItem[] = [];
        activeExpenses.forEach(exp => {
            const submitItem = {
                orderExpenseId: exp.orderExpenseId,
                orderId: exp.orderId,
                expenseItemId: exp.expenseItemId,
                expenseItemQuantity: exp.expenseItemQuantity,
                createdBy: exp.createdBy, // Or session.user.id if updates should change creator
                notes: exp.notes === null ? undefined : exp.notes,
            };
            if (exp.orderExpenseId) {
                // Check if it actually changed compared to initialExpenses? (More complex state tracking needed)
                // For now, assume any existing item might be an update
                itemsToUpdate.push(submitItem);
            } else {
                itemsToInsert.push(submitItem);
            }
        });

        // Identify deleted items
        const initialIds = new Set(initialExpenses.map(e => e.orderExpenseId).filter(id => !!id));
        const currentIds = new Set(activeExpenses.map(e => e.orderExpenseId).filter(id => !!id));
        const idsToDelete = [...initialIds].filter(id => !currentIds.has(id));

        console.log("Items to Insert:", itemsToInsert);
        console.log("Items to Update:", itemsToUpdate);
        console.log("Item IDs to Delete:", idsToDelete);
        console.log("Overall Notes:", expenseNotes);
        // Do not call mutateAsync here
        */

        // == STRATEGY 3: Requires Backend Changes ==
        // console.log("Strategy 3 selected: Backend changes required for sync/upsert.");
        // console.log("Current desired state:", activeExpenses.map(({clientId, ...rest}) => rest)); // Log desired state
        // console.log("Overall Notes:", expenseNotes);
        // Do not call mutateAsync here
    };


    const totalExpenseCost = expenses
        .filter(exp => !exitingExpenseIds.has(exp.clientId))
        .reduce((sum, orderExpense) => {
            const expenseItem = expenseItemsData?.find(item => item.expenseItemId === orderExpense.expenseItemId);
            const price = expenseItem?.expensePrice ?? 0;
            const quantity = orderExpense.expenseItemQuantity ?? 0;
            return sum + price * quantity;
        }, 0);


    // Handle loading state for expense items query
    const isLoading = isExpenseItemsLoading; // Only check expense items loading here

    if (isLoading) {
        // Show loading within the dialog content area if it's already open
        // or handle loading before the dialog is even triggered if necessary
         return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
                     <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                         <DialogTitle className="text-2xl">Order Expense #{orderData?.orderId ?? '...'}</DialogTitle>
                     </DialogHeader>
                     <div className="flex-grow flex items-center justify-center">
                         <LoadingSpinner /> <span className="ml-2">Loading Expense Items...</span>
                     </div>
                     <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50">
                         {/* Footer might be disabled or simplified during loading */}
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    if (isExpenseItemsError) {
         return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
                     <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                         <DialogTitle className="text-2xl">Order Expense #{orderData?.orderId ?? '...'}</DialogTitle>
                     </DialogHeader>
                     <div className="flex-grow flex items-center justify-center text-destructive">
                         Error loading expense items.
                     </div>
                      <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50">
                         {/* Footer might be disabled or simplified during error */}
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }


    // Main Dialog Render (assuming orderData is loaded)
    return (
        <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                    <DialogTitle className="text-2xl">Order Expense #{orderData.orderId}</DialogTitle>
                </DialogHeader>
                {isPending && ( // Show saving overlay
                    <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center rounded-md">
                        <Card>
                            <CardHeader><CardTitle>Saving...</CardTitle></CardHeader>
                            <CardContent><LoadingSpinner /></CardContent>
                        </Card>
                    </div>
                )}
                <div className={cn("grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden", isPending && "opacity-50 pointer-events-none")}> {/* Disable interaction during save */}

                    <div className="flex flex-col md:col-span-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                         <OrderInfoCard
                            customerId={orderData.customerId}
                            customerName={orderData.customerName}
                            orderType={(orderData as any).orderType || "N/A"}
                            movement={orderData.movement}
                            packingType={orderData.packingType}
                            deliveryMethod={orderData.deliveryMethod}
                            orderMark={orderData.orderMark || undefined}
                        />
                        <h3 className="text-md font-semibold text-gray-700 mt-2 border-b pb-1">Order Items</h3>
                        <OrderItemsTable items={orderData.items} isLoading={false} />
                    </div>

                    <Card className="md:col-span-7 flex flex-col overflow-hidden shadow-md border">
                         <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-blue-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
                             <CardTitle className="text-lg font-semibold">Order Expenses</CardTitle>
                             <Button onClick={addExpense} variant="outline" size="sm" className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50" disabled={!expenseItemsData || isPending}>
                                 <Plus className="h-4 w-4" /> Add Expense
                             </Button>
                         </CardHeader>

                        <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
                            {expenses.length === 0 && exitingExpenseIds.size === 0 ? (
                                 <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                                     <p>No expenses added yet.</p>
                                     <p className="text-sm">Click "Add Expense" to begin.</p>
                                 </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-4 py-2 sticky top-0 bg-gray-100 z-10 border-b flex-shrink-0">
                                         <div className="col-span-1">#</div>
                                         <div className="col-span-4">CATEGORY</div>
                                         <div className="col-span-2 text-center">QTY</div>
                                         <div className="col-span-2 text-center">PRICE</div>
                                         <div className="col-span-2 text-center">TOTAL</div>
                                         <div className="col-span-1 text-center">ACT</div>
                                    </div>

                                    <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar">
                                        {expenses.map((expense, index) => {
                                            const isExiting = exitingExpenseIds.has(expense.clientId);
                                            const visualIndex = expenses.slice(0, index).filter(e => !exitingExpenseIds.has(e.clientId)).length + 1;
                                            const currentExpenseItem = expenseItemsData?.find(item => item.expenseItemId === expense.expenseItemId);
                                            const currentExpensePrice = currentExpenseItem?.expensePrice ?? 0;
                                            const quantity = expense.expenseItemQuantity ?? 1;

                                            return (
                                                <div
                                                    key={expense.clientId}
                                                    className={cn(
                                                        "grid grid-cols-12 gap-x-2 gap-y-1 items-center py-1",
                                                        "expense-row",
                                                        isExiting && "expense-row-exiting"
                                                    )}
                                                    aria-hidden={isExiting}
                                                >
                                                    <div className="col-span-1 text-sm text-muted-foreground pl-1 font-medium">
                                                        {!isExiting ? visualIndex : ''}
                                                    </div>

                                                    <div className="col-span-4">
                                                        <Select
                                                            value={expense.expenseItemId}
                                                            onValueChange={(value) => updateExpense(expense.clientId, "expenseItemId", value)}
                                                            disabled={isExiting || !expenseItemsData || isPending}
                                                        >
                                                            <SelectTrigger className="h-8 text-sm">
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {expenseItemsData?.map((item) => (
                                                                    <SelectItem key={item.expenseItemId} value={item.expenseItemId}>
                                                                        {item.expenseName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="col-span-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="h-8 text-sm text-center"
                                                            value={quantity}
                                                            onChange={(e) => updateExpense(expense.clientId, "expenseItemQuantity", e.target.value)}
                                                            disabled={isExiting || isPending}
                                                        />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="pl-4 pr-1 h-8 text-sm text-center"
                                                                value={currentExpensePrice.toFixed(2)}
                                                                readOnly
                                                                disabled={isExiting || isPending} // Disable price input too
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-span-2">
                                                        <div className={cn(
                                                            "bg-muted/80 px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center font-medium",
                                                            isExiting && "opacity-50"
                                                        )}>
                                                            ${(currentExpensePrice * quantity).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div className="col-span-1 flex justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 disabled:opacity-30"
                                                            onClick={() => removeExpense(expense.clientId)}
                                                            disabled={isExiting || isPending}
                                                            aria-label="Remove expense"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="px-4 pt-3 pb-1 mt-auto flex-shrink-0 border-t bg-gray-50/50">
                                         <label htmlFor="expense-notes" className="block text-sm font-medium text-muted-foreground mb-1">Order Notes (Shared)</label>
                                         <Textarea
                                             id="expense-notes"
                                             placeholder="Add general notes for the order..."
                                             rows={2}
                                             className="text-sm"
                                             value={expenseNotes ?? ""}
                                             onChange={(e) => setExpenseNotes(e.target.value)}
                                             disabled={isPending} // Disable notes during save
                                         />
                                         {/* TODO: Add individual expense notes if needed */}
                                    </div>
                                </>
                            )}
                        </CardContent>

                        {expenses.some(exp => !exitingExpenseIds.has(exp.clientId)) && (
                            <CardFooter className="flex flex-col items-stretch border-t pt-3 pb-3 flex-shrink-0 bg-gray-50/50 px-4">
                                <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                                    <span>Number of expenses:</span>
                                    <span>{expenses.filter(exp => !exitingExpenseIds.has(exp.clientId)).length}</span>
                                </div>
                                <div className="flex justify-between items-center font-medium">
                                    <span>Total Expense Cost:</span>
                                    <span className="text-lg">${totalExpenseCost.toFixed(2)}</span>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isPending}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isPending} // Disable button during submission
                    >
                        {isPending ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isPending ? "Saving..." : "Update Expenses"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}