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
import { createOrderExpenseSchema, createOrderExpenseSchemaType, selectExpenseSchemaType } from "@/types/expense";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useSession } from "next-auth/react";
import { useCreateOrderExpense } from "@/hooks/data/useOrders"; // Assuming this hook calls the backend upsert logic
import { LoadingSpinner } from "../ui/loading-spinner";

// Correctly derive the inferred type for a single item from the creation schema array
// This includes the optional orderExpenseId
type CreateOrderExpenseItem = z.infer<typeof createOrderExpenseSchema.element>;

// Define an augmented type for state management with numeric clientId
type OrderExpenseWithClient = CreateOrderExpenseItem & { clientId: number };


// --- CSS Transition Duration ---
const EXIT_ANIMATION_DURATION = 300;

interface OrderExpenseDialogProps {
    children: ReactNode;
}


// --- Component ---
export function OrderExpenseDialog({
    children,
}: OrderExpenseDialogProps) {

    const orderData = useSelectedOrderData();
    if (!orderData) {
        console.error("OrderExpenseDialog: No Order Selected in store");
        return <Dialog><DialogTrigger asChild>{children}</DialogTrigger></Dialog>;
    }

    // Memoize initial expenses derived from orderData
    const initialExpensesFromStore = React.useMemo(() => {
        return orderData.expenses?.map(exp => ({
            orderExpenseId: exp.orderExpenseId,
            orderId: exp.orderId,
            expenseItemId: exp.expenseItemId,
            expenseItemQuantity: exp.expenseItemQuantity,
            notes: exp.notes,
            createdBy: exp.createdBy,
        })) ?? [];
    }, [orderData.expenses, orderData.orderId]);

    // Assuming useCreateOrderExpense hook now points to a service that handles upsert/delete
    const { mutateAsync, isPending } = useCreateOrderExpense();

    // --- State ---
    const [isOpen, setIsOpen] = useState(false);
    const [nextClientId, setNextClientId] = useState(1);
    const [expenses, setExpenses] = useState<OrderExpenseWithClient[]>([]);
    const [expenseNotes, setExpenseNotes] = useState(""); // Use overall order notes for this field
    const [exitingExpenseIds, setExitingExpenseIds] = useState<Set<number>>(new Set());


    // --- Refs ---
    const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

    // --- Hooks ---
    const isMobile = useIsMobileTEST();
    const { data: session } = useSession();

    // Fetch available expense items
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
    useEffect(() => {
        if (isOpen && orderData) {
            // Use the memoized initial expenses
            const mappedInitialExpenses = initialExpensesFromStore.map((exp, index) => ({
                 ...exp,
                 orderId: orderData.orderId, // Ensure orderId is current
                 clientId: index + 1 // Assign client ID
            }));

            setExpenses(mappedInitialExpenses);
            setNextClientId(mappedInitialExpenses.length + 1); // Set next ID correctly
            setExpenseNotes(orderData.notes ?? "");
            setExitingExpenseIds(new Set());
        }
    }, [isOpen, orderData, initialExpensesFromStore]); // Add dependency


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
            orderId: orderData.orderId,
            expenseItemId: defaultExpenseItem.expenseItemId,
            expenseItemQuantity: 1,
            notes: undefined, // Initialize notes as undefined
            createdBy: session.user.id,
            // orderExpenseId is omitted
        };

        setExpenses(prevExpenses => [...prevExpenses, newExpense]);
        setNextClientId(prevId => prevId + 1);
    };


    // Use keys from the correctly inferred CreateOrderExpenseItem type
    const updateExpense = (clientId: number, field: keyof CreateOrderExpenseItem, value: any) => {
        // Prevent updating fields that shouldn't be changed directly in the grid
        if (field === 'orderId' || field === 'createdBy' || field === 'orderExpenseId') {
            return;
        }

        setExpenses(prevExpenses =>
            prevExpenses.map((expense) => {
                if (expense.clientId !== clientId) return expense;

                let processedValue = value;
                if (field === "expenseItemQuantity") {
                    const numValue = Number.parseInt(String(value), 10);
                    processedValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
                } else if (field === "notes") {
                    // Store null internally if empty, otherwise store the string
                    processedValue = value === "" ? null : value;
                }

                return { ...expense, [field]: processedValue };
            })
        );
    };


    const removeExpense = (clientId: number) => {
        if (exitingExpenseIds.has(clientId) || !timeoutsRef.current) return;

        setExitingExpenseIds(prev => new Set(prev).add(clientId));

        const timeoutId = setTimeout(() => {
            // Important: Filter based on clientId, not orderExpenseId
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

    // Handles submission assuming backend performs upsert and delete
    const handleUpdate = async () => {
        if (!session?.user.id) {
            console.error("User not authenticated.");
            // TODO: Show error toast
            return;
        }

        const activeExpenses = expenses.filter(exp => !exitingExpenseIds.has(exp.clientId));

        // Prepare the full list of desired expenses for the backend upsert/sync
        const expensesToSubmit: createOrderExpenseSchemaType = activeExpenses.map((exp) => ({
            orderExpenseId: exp.orderExpenseId, // Include existing ID for updates/identification
            orderId: exp.orderId,
            expenseItemId: exp.expenseItemId,
            expenseItemQuantity: exp.expenseItemQuantity,
            // Use current user ID for creator on *all* items sent? Or keep original?
            // Keeping original for now, backend might decide. Schema requires it.
            createdBy: exp.createdBy,
            notes: exp.notes === null ? undefined : exp.notes, // Handle null -> undefined
        }));

        console.log("Submitting Expenses for Upsert/Sync:", JSON.stringify(expensesToSubmit, null, 2));
        // TODO: Consider submitting the overall 'expenseNotes' as well if it maps to order.notes

        try {
            // Validate the payload before sending
            const validatedValues = createOrderExpenseSchema.safeParse(expensesToSubmit);
            if (!validatedValues.success) {
                 console.error("Validation failed:", validatedValues.error.format());
                 // TODO: Show validation error toast
                 return;
            }
            console.log("Validation successful. Sending to backend...");

            // Call the mutation hook (assuming it points to the updated backend logic)
            await mutateAsync(validatedValues.data);

            // TODO: Enhance success/error handling based on mutation result
            // Consider closing dialog in onSuccess callback of useMutationFactory for better UX
            console.log("Mutation call finished.");
            setIsOpen(false); // Close dialog optimistically

        } catch (error) {
            console.error("Submission failed:", error);
            // TODO: Show error toast to the user
        }
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
    const isLoading = isExpenseItemsLoading;

    // Render loading state within the dialog if it's open
    const renderLoadingOrError = () => {
        if (isLoading) {
            return (
                 <div className="flex-grow flex items-center justify-center">
                     <LoadingSpinner /> <span className="ml-2">Loading Expense Items...</span>
                 </div>
            );
        }
        if (isExpenseItemsError) {
             return (
                 <div className="flex-grow flex items-center justify-center text-destructive">
                     Error loading expense items.
                 </div>
            );
        }
        return null;
    };


    // Main Dialog Render
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

                {/* Conditional rendering for loading/error states */}
                {isLoading || isExpenseItemsError ? (
                    renderLoadingOrError()
                ) : (
                    <div className={cn("grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden", isPending && "opacity-50 pointer-events-none")}>

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
                                                                    disabled={isExiting || isPending}
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
                                                 disabled={isPending}
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
                )}

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
                        disabled={isPending || isLoading || isExpenseItemsError} // Disable if loading items, error, or saving
                    >
                        {isPending ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isPending ? "Saving..." : "Update Expenses"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}