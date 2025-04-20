"use client"

import React, { ReactNode, useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useIsMobileTEST } from "@/hooks/use-media-query";
import { useSelectedOrderData } from "@/stores/orders-store";
import { OrderInfoCard } from "./OrderInfoCard";
import { createOrderExpenseSchema, createOrderExpenseSchemaType, selectExpenseSchemaType } from "@/types/expense";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useCreateOrderExpense } from "@/hooks/data/useOrders";
import { useErrorDialog } from "@/hooks/useErrorDialog";
import { toast } from "sonner";
import { useExpenseItems } from "@/hooks/data/useExpenses";
import { Spinner } from "@heroui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderItemsTable } from "@/components/order-details/OrderItemsTable";

// --- Types ---
type CreateOrderExpenseItem = z.infer<typeof createOrderExpenseSchema.element>;
type OrderExpenseWithClient = CreateOrderExpenseItem & { clientId: number };

// --- Constants ---
const EXIT_ANIMATION_DURATION = 300;

// --- Helper Components ---
type InitialExpenseData = Omit<OrderExpenseWithClient, 'clientId'>;

function isExpenseModified(
    initial: InitialExpenseData | undefined,
    current: OrderExpenseWithClient
): boolean {
    if (!initial) {
        // If no initial state exists for this ID, it implies modification (shouldn't happen for existing items)
        // Or it means the item is new (which is handled separately by checking orderExpenseId)
        return true; // Treat as modified if initial data is missing for an existing ID (defensive)
    }

    // Normalize notes for comparison (treat null/undefined/" " as equivalent for 'empty')
    const normalizeNotes = (notes: string | null | undefined) => (notes ?? "").trim() || undefined;

    return (
        initial.expenseItemId !== current.expenseItemId ||
        initial.expenseItemQuantity !== current.expenseItemQuantity ||
        normalizeNotes(initial.notes) !== normalizeNotes(current.notes)
        // Do not compare orderId, createdBy, orderExpenseId itself
    );
}



interface ExpenseItemRowProps {
    expense: OrderExpenseWithClient;
    index: number;
    isExiting: boolean;
    expenseItemsData: selectExpenseSchemaType[] | undefined;
    isPending: boolean;
    onUpdate: (clientId: number, field: keyof CreateOrderExpenseItem, value: any) => void;
    onRemove: (clientId: number) => void;
}

const ExpenseItemRow = React.memo(({
    expense,
    index,
    isExiting,
    expenseItemsData,
    isPending,
    onUpdate,
    onRemove
}: ExpenseItemRowProps) => {
    const currentExpenseItem = expenseItemsData?.find(item => item.expenseItemId === expense.expenseItemId);
    const currentExpensePrice = currentExpenseItem?.expensePrice ?? 0;
    const quantity = expense.expenseItemQuantity ?? 0; // Default/handle 0 quantity
    const total = currentExpensePrice * quantity;
    const isMarkedForDeletion = quantity === 0 && !!expense.orderExpenseId; // Visually indicate if marked for delete

    return (
        <div
            key={expense.clientId}
            className={cn(
                "grid grid-cols-12 gap-x-2 gap-y-1 items-center py-1",
                "expense-row",
                isExiting && "expense-row-exiting",
                isMarkedForDeletion && "opacity-60", // Style rows marked for deletion differently
            )}
            aria-hidden={isExiting}
        >
            {/* Row Index */}
            <div className={cn("col-span-1 text-sm text-muted-foreground pl-1 font-medium", isMarkedForDeletion && "line-through")}>
                {!isExiting ? index : ''}
            </div>

            {/* Expense Select */}
            <div className="col-span-4">
                <Select
                    value={expense.expenseItemId}
                    onValueChange={(value) => onUpdate(expense.clientId, "expenseItemId", value)}
                    // Disable if exiting, saving, or marked for deletion (can't change category of item to be deleted)
                    disabled={isExiting || isPending || isMarkedForDeletion}
                >
                    <SelectTrigger className={cn("h-8 text-sm", isMarkedForDeletion && "border-dashed border-destructive/50")}>
                        <SelectValue placeholder="Select Expense" />
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

            {/* Quantity Input */}
            <div className="col-span-2">
                <Input
                    type="number"
                    // min="1" REMOVED: Allow 0 for visual representation after deletion
                    className={cn("h-8 text-sm text-center", isMarkedForDeletion && "border-dashed border-destructive/50")}
                    value={quantity} // Display 0 if quantity is 0
                    onChange={(e) => onUpdate(expense.clientId, "expenseItemQuantity", e.target.value)}
                    // Disable if exiting, saving, or marked for deletion (quantity is controlled by remove button)
                    disabled={isExiting || isPending || isMarkedForDeletion}
                />
            </div>

            {/* Price Display */}
            <div className="col-span-2">
                <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED </span>
                    <Input
                        type="number"
                        className="pl-4 pr-1 h-8 text-sm text-center"
                        value={currentExpensePrice.toFixed(2)}
                        readOnly
                        disabled={isExiting || isPending} // Visually disable (price follows category)
                    />
                </div>
            </div>

            {/* Total Display */}
            <div className="col-span-2">
                <div className={cn(
                    "bg-muted/80 px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center font-medium",
                    (isExiting || isMarkedForDeletion) && "opacity-50" // Fade out total if row is exiting or deleted
                )}>
                    AED {total.toFixed(2)}
                </div>
            </div>

            {/* Remove Button */}
            <div className="col-span-1 flex justify-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 disabled:opacity-30"
                    onClick={() => onRemove(expense.clientId)}
                    // Disable if already exiting, saving, or marked for deletion (can't remove twice)
                    disabled={isExiting || isPending || isMarkedForDeletion}
                    aria-label="Remove expense"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});
ExpenseItemRow.displayName = "ExpenseItemRow";



// --- Main Dialog Component ---
interface OrderExpenseDialogProps {
    children: ReactNode;
}

export function OrderExpenseDialog({ children }: OrderExpenseDialogProps) {
    const orderData = useSelectedOrderData();

    // --- State ---
    const [ isOpen, setIsOpen ] = useState(false);
    const [ isCancelDialogOpen, setIsCancelDialogOpen ] = useState(false)
    const [ expenses, setExpenses ] = useState<OrderExpenseWithClient[]>([]);
    const [ nextClientId, setNextClientId ] = useState(1);
    const [ expenseNotes, setExpenseNotes ] = useState("");
    const [ exitingExpenseIds, setExitingExpenseIds ] = useState<Set<number>>(new Set());
    const initialExpensesRef = useRef<Map<string, InitialExpenseData>>(new Map()); // Use Map for quick lookup by orderExpenseId


    // --- Refs ---
    const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

    // --- Hooks ---
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { ErrorDialogComponent, showErrorDialog } = useErrorDialog();
    const isMobile = useIsMobileTEST();

    // --- Data Fetching ---


    const { data: expenseItemsData, isLoading: isExpenseItemsLoading, isError: isExpenseItemsError } = useExpenseItems()




    // --- Mutation ---
    const { mutateAsync: createOrderExpenseMutate, isPending: isSaving } = useCreateOrderExpense();

    // --- Memoized Derived Data ---
    const initialExpensesFromStore = useMemo(() => {
        return orderData?.expenses?.map((exp, index) => ({
            clientId: index + 1,
            orderExpenseId: exp.orderExpenseId,
            orderId: exp.orderId,
            expenseItemId: exp.expenseItemId,
            expenseItemQuantity: exp.expenseItemQuantity,
            notes: exp.notes ?? undefined,
            createdBy: exp.createdBy,
        })) ?? [];
    }, [ orderData?.expenses, orderData?.orderId ]);

    // Calculate total cost, excluding items exiting AND items marked with 0 quantity
    const totalExpenseCost = useMemo(() => {
        return expenses
            .filter(exp => !exitingExpenseIds.has(exp.clientId) && exp.expenseItemQuantity > 0) // Exclude exiting and 0-qty items
            .reduce((sum, orderExpense) => {
                const expenseItem = expenseItemsData?.find(item => item.expenseItemId === orderExpense.expenseItemId);
                const price = expenseItem?.expensePrice ?? 0;
                const quantity = orderExpense.expenseItemQuantity; // Already filtered > 0
                return sum + price * quantity;
            }, 0);
    }, [ expenses, expenseItemsData, exitingExpenseIds ]);

    // Check if there are any expenses with quantity > 0 that are not exiting
    const hasActiveExpenses = useMemo(() =>
        expenses.some(exp => exp.expenseItemQuantity > 0 && !exitingExpenseIds.has(exp.clientId)),
        [ expenses, exitingExpenseIds ]
    );


    // Derived state flags
    const isLoading = isExpenseItemsLoading;
    const hasLoadError = isExpenseItemsError;
    const canAddExpense = !!expenseItemsData && expenseItemsData.length > 0 && !!session?.user?.id;
    const showLoadingState = isOpen && isLoading;
    const showErrorState = isOpen && hasLoadError && !isLoading;
    const showContent = isOpen && !hasLoadError;
    // const showContent = isOpen && !isLoading && !hasLoadError;


    // --- Effects ---
    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach(timeoutId => clearTimeout(timeoutId));
            timeouts.clear();
        };
    }, []);

    useEffect(() => {
        if (isOpen && orderData) {
            const initialExpenses = initialExpensesFromStore;
            setExpenses(initialExpenses);
            setNextClientId(initialExpenses.length + 1);
            setExpenseNotes(orderData.notes ?? "");
            setExitingExpenseIds(new Set());
            timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
            timeoutsRef.current.clear();

            // Store the initial state in the ref Map for comparison on save
            const initialMap = new Map<string, InitialExpenseData>();
            initialExpenses.forEach(exp => {
                if (exp.orderExpenseId) {
                    // Store only the data part, not the clientId
                    const { clientId, ...data } = exp;
                    initialMap.set(exp.orderExpenseId, data);
                }
            });
            initialExpensesRef.current = initialMap;

        } else if (!isOpen) {
            // Optionally clear ref when closed
            // initialExpensesRef.current.clear();
        }
    }, [ isOpen, orderData, initialExpensesFromStore ]); // Depend on initial data memo

    // --- Event Handlers (Memoized with useCallback) ---

    const addExpense = useCallback(() => {
        if (!canAddExpense || !orderData) return;

        const defaultExpenseItem = expenseItemsData![ 0 ]; // Safe assert based on canAddExpense
        const newExpense: OrderExpenseWithClient = {
            clientId: nextClientId,
            orderId: orderData.orderId,
            expenseItemId: "",
            expenseItemQuantity: 1,
            notes: undefined,
            createdBy: session.user.id ?? "undefined", // Safe assert based on canAddExpense
        };
        setExpenses(prevExpenses => [ ...prevExpenses, newExpense ]);
        setNextClientId(prevId => prevId + 1);
    }, [ canAddExpense, expenseItemsData, session?.user?.id, nextClientId, orderData ]);


    const updateExpense = useCallback((clientId: number, field: keyof CreateOrderExpenseItem, value: any) => {
        if (field === 'orderId' || field === 'createdBy' || field === 'orderExpenseId') return;

        setExpenses(prevExpenses =>
            prevExpenses.map(expense => {
                if (expense.clientId !== clientId) return expense;

                // Prevent updating quantity if it's already 0 (item is marked for deletion)
                if (field === "expenseItemQuantity" && expense.expenseItemQuantity === 0 && !!expense.orderExpenseId) {
                    return expense;
                }

                let processedValue = value;
                if (field === "expenseItemQuantity") {
                    const numValue = Number.parseInt(String(value), 10);
                    // Allow 0, but treat invalid/negative input as 1 (or keep existing?) Let's default to 1.
                    processedValue = isNaN(numValue) || numValue < 0 ? 1 : numValue;
                } else if (field === "notes") {
                    processedValue = value === "" ? undefined : value;
                }

                return { ...expense, [ field ]: processedValue };
            })
        );
    }, []);


    // MODIFIED: Set quantity to 0 instead of removing from state
    const removeExpense = useCallback((clientId: number) => {
        if (exitingExpenseIds.has(clientId) || !timeoutsRef.current) return;

        setExitingExpenseIds(prev => new Set(prev).add(clientId));

        const timeoutId = setTimeout(() => {
            setExpenses(prev =>
                prev.map(exp =>
                    exp.clientId === clientId
                        ? { ...exp, expenseItemQuantity: 0 } // Set quantity to 0
                        : exp
                )
            );
            // Clean up exiting state and timeout ref after animation
            setExitingExpenseIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(clientId);
                return newSet;
            });
            timeoutsRef.current.delete(clientId);
        }, EXIT_ANIMATION_DURATION);

        timeoutsRef.current.set(clientId, timeoutId);
    }, [ exitingExpenseIds ]);


    // MODIFIED: Filter expenses before submission
    const handleUpdate = useCallback(async () => {
        if (!session?.user?.id || !orderData) {
            showErrorDialog("Authentication Error", "User session not found.");
            return;
        }

        // Get the initial state snapshot from the ref
        const initialSnapshotMap = initialExpensesRef.current;

        // Determine changed items
        const changedItems: CreateOrderExpenseItem[] = [];
        const currentExpensesToConsider = expenses.filter(exp => !exitingExpenseIds.has(exp.clientId)); // Exclude items mid-animation

        currentExpensesToConsider.forEach(currentExpense => {
            const { clientId, ...currentItemData } = currentExpense; // Exclude client-only ID

            if (!currentItemData.orderExpenseId) {
                // 1. It's a NEW item (no existing ID)
                if (currentItemData.expenseItemQuantity > 0) { // Only add if it wasn't added then immediately deleted
                    changedItems.push(currentItemData);
                }
            } else {
                // 2. It's an EXISTING item (has an ID)
                const initialItemData = initialSnapshotMap.get(currentItemData.orderExpenseId);

                if (currentItemData.expenseItemQuantity === 0) {
                    // 2a. Marked for DELETION (quantity is 0) - considered changed
                    // Ensure it actually existed initially before marking for deletion
                    if (initialItemData) {
                        changedItems.push(currentItemData);
                    } else {
                        console.warn(`Item with clientId ${clientId} and orderExpenseId ${currentItemData.orderExpenseId} was marked for deletion but not found in initial state.`);
                    }

                } else if (isExpenseModified(initialItemData, currentExpense)) {
                    // 2b. MODIFIED (fields changed compared to initial state)
                    changedItems.push(currentItemData);
                } else {
                    // 2c. UNCHANGED - Do nothing, don't add to changedItems
                }
            }
        });

        // If nothing actually changed, don't submit
        if (changedItems.length === 0) {
            toast.info("No changes detected to save.");
            setIsOpen(false);
            return;
        }

        // Prepare payload *only* with changed items
        const expensesToSubmit: createOrderExpenseSchemaType = changedItems;

        console.log("Submitting changed expenses:", JSON.stringify(expensesToSubmit, null, 2));


        // Zod validation of the delta payload
        try {
            const validationResult = createOrderExpenseSchema.safeParse(expensesToSubmit);
            if (!validationResult.success) {
                console.error("Validation failed:", validationResult.error.format());
                const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
                showErrorDialog("Validation Error", `Please check the expense details:\n${errorMessages}`);
                return;
            }
            const validatedValues = validationResult.data;

            // Execute mutation with the delta payload
            await createOrderExpenseMutate(validatedValues);

            // Success
            toast.success("Expenses updated successfully!");
            queryClient.invalidateQueries({ queryKey: [ 'order', orderData.orderId ] });
            setIsOpen(false);

        } catch (error: any) {
            // Error
            console.error("Submission failed:", error);
            const errorMessage = error?.message || "An unexpected error occurred while saving expenses.";
            showErrorDialog("Save Failed", errorMessage);
        }
    }, [
        expenses, // Current state
        exitingExpenseIds,
        session?.user?.id,
        orderData,
        // initialExpensesRef (ref access doesn't need to be dependency)
        createOrderExpenseMutate,
        queryClient,
        showErrorDialog
    ]);

    if (!orderData) {
        return <Dialog><DialogTrigger asChild>{children}</DialogTrigger></Dialog>;
    }

    // --- Main Render ---
    return (
        <Dialog  open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent onInteractOutside={(e) => 
                {e.preventDefault()
                    setIsCancelDialogOpen(true)
                }
            } 
            className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col border-0">
                {/* Header */}
                <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                    <DialogTitle className="text-2xl">Order Expense #{orderData.orderId}</DialogTitle>
                </DialogHeader>

                {/* Saving Overlay */}
                {isSaving && (
                    // <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center rounded-md shadow-sm">
                    //     <Card>
                    //         <CardHeader><CardTitle>Saving...</CardTitle></CardHeader>
                    //         <CardContent><LoadingSpinner /></CardContent>
                    //     </Card>
                    // </div>
                    <div className="absolute inset-0 bg-black/70 z-50 flex justify-center items-center ">
                        <Spinner color="white"/>
                        
                        {/* <Card className="px-12">
                            <CardHeader><CardTitle>Saving...</CardTitle></CardHeader>
                            <CardContent><LoadingSpinner /></CardContent>
                        </Card> */}
                    </div>
                )}

                {/* Loading State */}
                {/* {showLoadingState && (
                    <div className="flex-grow flex items-center justify-center">
                        <LoadingSpinner /> <span className="ml-2">Loading Expense Items...</span>
                    </div>
                )} */}

                {/* Error State */}
                {showErrorState && (
                    <div className="flex-grow flex items-center justify-center text-destructive">
                        Error loading expense items. Please try again later.
                    </div>
                )}

                {/* Content State */}
                {showContent && (
                    <div className={cn("grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden", isSaving && "opacity-50 pointer-events-none")}>
                        {/* Left Panel: Order Info & Items */}
                        <div className="flex flex-col md:col-span-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                            {/* ... OrderInfoCard and OrderItemsTable ... */}
                            <OrderInfoCard
                                customerId={orderData.customerId}
                                customerName={orderData.customerName}
                                orderType={(orderData as any).orderType || "N/A"}
                                movement={orderData.movement}
                                packingType={orderData.packingType}
                                deliveryMethod={orderData.deliveryMethod}
                                orderMark={orderData.orderMark || undefined}
                            />                            <h3 className="text-md font-semibold text-gray-700 mt-2 border-b pb-1">Order Items</h3>
                            <OrderItemsTable items={orderData.items} isLoading={false} />
                        </div>

                        {/* Right Panel: Expenses Card */}
                        <Card className="md:col-span-7 flex flex-col overflow-hidden shadow-md border">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-blue-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
                                <CardTitle className="text-lg font-semibold">Order Expenses</CardTitle>
                                {isLoading ? <Skeleton className="h-8 w-32 flex justify-center">
                                    {/* <Spinner size="sm" />  */}
                                    </Skeleton> :
                                    <Button
                                        onClick={addExpense}
                                        variant="outline" size="sm"
                                        className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                                        disabled={!canAddExpense || isSaving}
                                    >
                                        <Plus className="h-4 w-4" /> Add Expense
                                    </Button>}
                            </CardHeader>

                            <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
                                {isLoading ? 
                                    <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                                        <Spinner size="sm" /> 
                                        <p>Loading expenses...</p>
                                        {/* <p className="text-sm">Click "Add Expense" to begin.</p> */}

                                    </div>
                                    :
                                    expenses.filter(e => e.expenseItemQuantity > 0 || !!e.orderExpenseId).length === 0 && exitingExpenseIds.size === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                                        <p>No expenses added.</p>
                                        <p className="text-sm">Click "Add Expense" to begin.</p>
                                    </div>
                                    ) : (
                                    <>
                                        {/* Header Row */}
                                        <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-4 py-2 sticky top-0 bg-gray-100 z-10 border-b flex-shrink-0">
                                            {/* ... header columns ... */}
                                            <div className="col-span-1">#</div>
                                            <div className="col-span-4">EXPENSE</div>
                                            <div className="col-span-2 text-center">QTY</div>
                                            <div className="col-span-2 text-center">PRICE</div>
                                            <div className="col-span-2 text-center">TOTAL</div>
                                            <div className="col-span-1 text-center">ACT</div>
                                        </div>

                                        {/* Expense Rows List */}
                                        <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar">
                                            {expenses
                                                // Optionally filter out items that are new AND have qty 0 already?
                                                // .filter(exp => exp.expenseItemQuantity > 0 || !!exp.orderExpenseId)
                                                .map((expense, index) => {
                                                    const isExiting = exitingExpenseIds.has(expense.clientId);
                                                    // Adjust visual index calculation if needed based on filtering strategy
                                                    const visualIndex = expenses
                                                        .slice(0, index)
                                                        .filter(e => !exitingExpenseIds.has(e.clientId) && (e.expenseItemQuantity > 0 || !!e.orderExpenseId)) // Count only visible/relevant items
                                                        .length + 1;

                                                    // Only render the row if it's not a NEW item with 0 quantity (unless exiting)
                                                    if (expense.expenseItemQuantity === 0 && !expense.orderExpenseId && !isExiting) {
                                                        return null;
                                                    }

                                                    return (
                                                        <ExpenseItemRow
                                                            key={expense.clientId}
                                                            expense={expense}
                                                            index={visualIndex}
                                                            isExiting={isExiting}
                                                            expenseItemsData={expenseItemsData}
                                                            isPending={isSaving}
                                                            onUpdate={updateExpense}
                                                            onRemove={removeExpense}
                                                        />
                                                    );
                                                })}
                                        </div>

                                        {/* Shared Notes Area */}
                                        <div className="px-4 pt-3 pb-1 mt-auto flex-shrink-0 border-t bg-gray-50/50">
                                            {/* ... Textarea ... */}
                                            <label htmlFor="expense-notes" className="block text-sm font-medium text-muted-foreground mb-1">Expense Notes</label>
                                            <Textarea
                                                id="expense-notes"
                                                placeholder="Add general notes for the order..."
                                                rows={2}
                                                className="text-sm"
                                                value={expenseNotes ?? ""}
                                                onChange={(e) => setExpenseNotes(e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </>
                                    )
                                }

                                </CardContent>

                            {/* Footer with Totals (only if there are active expenses with qty > 0) */}
                                {hasActiveExpenses && (
                                    <CardFooter className="flex flex-col items-stretch border-t pt-3 pb-3 flex-shrink-0 bg-gray-50/50 px-4">
                                        <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                                            <span>Number of active expenses:</span>
                                            {/* Count only items with quantity > 0 */}
                                            <span>{expenses.filter(exp => !exitingExpenseIds.has(exp.clientId) && exp.expenseItemQuantity > 0).length}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-medium">
                                            <span>Total Active Expense Cost:</span>
                                            <span className="text-lg">AED {totalExpenseCost.toFixed(2)}</span>
                                        </div>
                                    </CardFooter>
                                )}
                        </Card>
                    </div>
                )}

                {/* Dialog Actions */}
                <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSaving}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading || hasLoadError || isSaving}
                    >
                        {isSaving ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSaving ? "Saving..." : "Update Expenses"}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Error Dialog Component */}
            <ErrorDialogComponent />
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Edits?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you want to cancel creating this expense? Any unsaved changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsCancelDialogOpen(false)}>
                            Continue Editing
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-red-400 hover:bg-red-600" onClick={() => {
                            setIsCancelDialogOpen(false);
                            setIsOpen(false); // Close the main dialog as well
                        }}>
                            Cancel Expense
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}