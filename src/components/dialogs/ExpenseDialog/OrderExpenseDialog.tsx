import React, { ReactNode, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form"; // Import RHF hooks
import { zodResolver } from "@hookform/resolvers/zod"; // Import Zod resolver
import { Button } from "@/components/ui/button";
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
import { ExpenseItemRow } from "./ExpenseItemRow";
import { sackSizeTypeSchema } from "@/server/db/schema";
import { SackSizeDialog } from "./SackSizeDialog";

const SACK_PACKING_EXPENSE_ITEM_ID = process.env.SACK_PACKING_EXPENSE_ITEM_ID || "1d55fcb3-bc10-4b3a-82e9-a329deeafcf0"; // Load from env or define directly
// --- Types ---

// type CreateOrderExpenseItem = z.infer<typeof createOrderExpenseSchema.element>;
// // Type for individual expense item within RHF, includes RHF's `id`

// Schema for a single sack size entry within the form (omitting server fields)
const formSackSizeSchema = z.object({
    sackType: sackSizeTypeSchema,
    amount: z.coerce.number().min(0, "Amount must be non-negative."),
    // No id, orderExpensesId, createdBy, createdAt, updatedAt needed in form
});
export type FormSackSizeType = z.infer<typeof formSackSizeSchema>;

// Extend the expense item schema within the form
const formExpenseItemSchema = z.object({
    id: z.string().optional(), // RHF field array ID
    orderExpenseId: z.string().uuid().optional().nullish(),
    orderId: z.string(),
    expenseItemId: z.string().uuid("Expense item selection is required."),
    expenseItemPrice: z.coerce.number().min(0, "Price must be non-negative."),
    expenseItemQuantity: z.coerce.number().min(0, "Quantity must be non-negative."),
    notes: z.string().optional().nullish(),
    createdBy: z.string().uuid(),
    sackSizes: z.array(formSackSizeSchema).optional().nullable(), // ADDED: Optional array for sack sizes
}).refine(data => !(data.expenseItemQuantity === 0 && !data.orderExpenseId), {
    message: "New expense quantity must be at least 1",
    path: [ "expenseItemQuantity" ],
});

// Update the main form schema
const orderExpenseFormSchema = z.object({
    expenses: z.array(formExpenseItemSchema), // Use the updated item schema
    expenseNotes: z.string().optional().nullish(),
});

// Update OrderExpenseWithRHFId to include sackSizes
export type OrderExpenseWithRHFId = z.infer<typeof formExpenseItemSchema>;
export type OrderExpenseFormValues = z.infer<typeof orderExpenseFormSchema>;

type InitialExpenseData = Omit<OrderExpenseWithRHFId, 'id' | 'sackSizes'> & { orderExpenseId: string };


// --- Constants ---
const EXIT_ANIMATION_DURATION = 300;


// --- Helper Functions ---
// Update isExpenseModified to check sackSizes
function isExpenseModified(
    initial: InitialExpenseData | undefined,
    current: OrderExpenseWithRHFId
): boolean {
    if (!initial) return true;

    const normalizeNotes = (notes: string | null | undefined) => (notes ?? "").trim() || undefined;

    // Normalize sack sizes for comparison (order matters here, ensure consistent order or use a set-based comparison)
    const normalizeSackSizes = (sacks: FormSackSizeType[] | null | undefined): string => {
        if (!sacks || sacks.length === 0) return "[]";
        // Sort by sackType to ensure consistent comparison regardless of order
        const sortedSacks = [ ...sacks ].sort((a, b) => a.sackType.localeCompare(b.sackType));
        return JSON.stringify(sortedSacks);
    };

    const initialSackSizesString = "[]"; // Sack sizes aren't loaded initially from DB
    const currentSackSizesString = normalizeSackSizes(current.sackSizes);

    return (
        initial.expenseItemId !== current.expenseItemId ||
        initial.expenseItemQuantity !== current.expenseItemQuantity ||
        (initial.expenseItemPrice ?? 0) !== (current.expenseItemPrice ?? 0) ||
        normalizeNotes(initial.notes) !== normalizeNotes(current.notes) ||
        initialSackSizesString !== currentSackSizesString // Compare normalized sack sizes
    );
}



// --- Main Dialog Component ---
interface OrderExpenseDialogProps {
    children: ReactNode;
}

export function OrderExpenseDialog({ children }: OrderExpenseDialogProps) {
    const orderData = useSelectedOrderData();

    // --- State ---
    const [ isOpen, setIsOpen ] = useState(false);
    const [ isCancelDialogOpen, setIsCancelDialogOpen ] = useState(false);

    // State to track which item's sacks are edited
    const [ editingSackIndex, setEditingSackIndex ] = useState<number | null>(null);

    // State for managing removal animation - use RHF field.id
    const [ exitingExpenseIds, setExitingExpenseIds ] = useState<Set<string>>(new Set());
    // Ref to store the *original* state fetched from the server for comparison
    const initialExpensesRef = useRef<Map<string, InitialExpenseData>>(new Map()); // Keyed by orderExpenseId

    // --- Refs ---
    const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map()); // Keyed by RHF field.id

    // --- Hooks ---
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { ErrorDialogComponent, showErrorDialog } = useErrorDialog();
    const isMobile = useIsMobileTEST();

    // --- Data Fetching ---
    const { data: expenseItemsData, isLoading: isExpenseItemsLoading, isError: isExpenseItemsError } = useExpenseItems();


    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue, // Get setValue to programmatically update fields
        getValues,
        formState: { errors, isDirty, isSubmitting }, // Use RHF's state
    } = useForm<OrderExpenseFormValues>({
        resolver: zodResolver(orderExpenseFormSchema),
        defaultValues: {
            expenses: [],
            expenseNotes: "",
        }
    });

    const { fields, append, update, remove } = useFieldArray({
        control,
        name: "expenses",
        keyName: "id", // Use 'id' as the key field name (default)
    });

    // --- Mutation ---
    const { mutateAsync: createOrderExpenseMutate, isPending: isMutationPending } = useCreateOrderExpense();
    const isSaving = isSubmitting || isMutationPending; // Combine RHF submitting state with mutation pending state

    // --- Memoized Derived Data ---
    // Map initial data from store to RHF structure ONCE when dialog opens
    const getInitialFormValues = useCallback((): OrderExpenseFormValues => {
        const initialExpenses = orderData?.expenses?.map((exp): OrderExpenseWithRHFId => ({
            // RHF `id` will be added automatically by useFieldArray, don't include here
            orderExpenseId: exp.orderExpenseId,
            orderId: exp.orderId,
            expenseItemId: exp.expenseItemId,
            expenseItemPrice: exp.expenseItemPrice,
            expenseItemQuantity: exp.expenseItemQuantity,
            notes: exp.notes ?? undefined,
            createdBy: exp.createdBy,
        })) ?? [];

        // Populate the initial ref map for diffing
        const initialMap = new Map<string, InitialExpenseData>();
        orderData?.expenses?.forEach(exp => {
            if (exp.orderExpenseId) {
                initialMap.set(exp.orderExpenseId, { // Store data without client/RHF id
                    orderExpenseId: exp.orderExpenseId,
                    orderId: exp.orderId,
                    expenseItemId: exp.expenseItemId,
                    expenseItemPrice: exp.expenseItemPrice,
                    expenseItemQuantity: exp.expenseItemQuantity,
                    notes: exp.notes ?? undefined,
                    createdBy: exp.createdBy,
                });
            }
        });
        initialExpensesRef.current = initialMap;

        return {
            expenses: initialExpenses,
            expenseNotes: orderData?.notes ?? ""
        };
    }, [ orderData ]); // Recalculate only if orderData changes


    // Watch all expenses to calculate total cost
    const watchedExpenses = watch("expenses");

    const totalExpenseCost = useMemo(() => {
        return watchedExpenses
            // Filter out items mid-exit animation AND items marked for deletion (quantity 0 for existing)
            .filter(exp => !exitingExpenseIds.has(exp.id!) && (exp.expenseItemQuantity > 0 || !exp.orderExpenseId))
            .reduce((sum, orderExpense) => {
                const price = orderExpense.expenseItemPrice ?? 0;
                const quantity = orderExpense.expenseItemQuantity ?? 0; // Use 0 if undefined/null
                return sum + (price * quantity);
            }, 0);
    }, [ watchedExpenses, exitingExpenseIds ]);

    // Check if there are any non-exiting expenses with quantity > 0
    const hasActiveExpenses = useMemo(() =>
        watchedExpenses.some(exp => exp.expenseItemQuantity > 0 && !exitingExpenseIds.has(exp.id!)),
        [ watchedExpenses, exitingExpenseIds ]
    );

    // Derived state flags
    const isLoading = isExpenseItemsLoading; // Only loading expense *options* matters initially
    const hasLoadError = isExpenseItemsError;
    const canAddExpense = !!expenseItemsData && expenseItemsData.length > 0 && !!session?.user?.id;
    const showLoadingState = isOpen && isLoading;
    const showErrorState = isOpen && hasLoadError && !isLoading;
    const showContent = isOpen && !hasLoadError;

    // --- Effects ---
    // Cleanup timeouts on unmount
    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach(timeoutId => clearTimeout(timeoutId));
            timeouts.clear();
        };
    }, []);

    // Reset form and manage initial state when dialog opens/closes or orderData changes
    useEffect(() => {
        if (isOpen && orderData) {
            const defaultValues = getInitialFormValues();
            reset(defaultValues); // Reset form with initial data
            setExitingExpenseIds(new Set()); // Clear exiting state
            // Clear any lingering timeouts
            timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
            timeoutsRef.current.clear();
        } else if (!isOpen) {
            // Optionally clear ref when closed if needed, but usually reset is enough
            // initialExpensesRef.current.clear();
        }
    }, [ isOpen, orderData, reset, getInitialFormValues ]);

    // --- Event Handlers (Memoized with useCallback) ---

    const addExpense = useCallback(() => {
        if (!canAddExpense || !orderData || !session?.user?.id) return;

        // Append a new expense object matching the form schema structure
        append({
            // RHF will add `id` automatically
            orderId: orderData.orderId,
            expenseItemId: "", // No item selected initially
            expenseItemPrice: 0, // Default price
            expenseItemQuantity: 1, // Default quantity
            notes: undefined,
            createdBy: session.user.id, // Add creator ID
            sackSizes: null
        });
    }, [ canAddExpense, orderData, session?.user?.id, append ]);

    // Handles triggering the removal animation and updating quantity via RHF
    const handleRemoveItem = useCallback((fieldId: string, index: number) => {
        if (exitingExpenseIds.has(fieldId) || !timeoutsRef.current) return;

        const expenseField = watchedExpenses[ index ]; // Get current field data

        setExitingExpenseIds(prev => new Set(prev).add(fieldId));

        const timeoutId = setTimeout(() => {
            // Check if the item being removed is a *new* item (no orderExpenseId)
            if (!expenseField?.orderExpenseId) {
                // If it's a new item, completely remove it from the form array
                // Find the correct index *at the time of removal* as it might have shifted
                const currentIndex = fields.findIndex(f => f.id === fieldId);
                if (currentIndex !== -1) {
                    remove(currentIndex); // Use RHF's remove for new items
                }
            } else {
                // If it's an *existing* item, update its quantity to 0
                update(index, { ...expenseField, expenseItemQuantity: 0 });
            }

            // Clean up exiting state and timeout ref after animation
            setExitingExpenseIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldId);
                return newSet;
            });
            timeoutsRef.current.delete(fieldId);

        }, EXIT_ANIMATION_DURATION);

        timeoutsRef.current.set(fieldId, timeoutId);
    }, [ exitingExpenseIds, watchedExpenses, update, remove, fields ]); // Include fields in dependency array

    const handleOpenSackDialog = useCallback((index: number) => {
        console.log(`OrderExpenseDialog: handleOpenSackDialog called with index: ${index}`);
        setEditingSackIndex(index);
        // Log state *after* setting (might show previous value due to async nature, but useful)
        console.log(`OrderExpenseDialog: editingSackIndex set to (may be async): ${index}`);
    }, []);

    const handleCloseSackDialog = useCallback(() => {
        console.log("OrderExpenseDialog: handleCloseSackDialog called");
        setEditingSackIndex(null);
        console.log("OrderExpenseDialog: editingSackIndex set to null");
    }, []);

    const handleSaveSackSizes = useCallback((newSackSizes: FormSackSizeType[], totalQuantity: number) => {
        // *** Log at the very beginning ***
        console.log(`OrderExpenseDialog: handleSaveSackSizes called. Current editingSackIndex: ${editingSackIndex}`);
        console.log("OrderExpenseDialog: Received sack sizes:", newSackSizes);
        console.log("OrderExpenseDialog: Received total quantity:", totalQuantity);


        if (editingSackIndex === null) {
            // *** Error occurs here ***
            console.error("OrderExpenseDialog: Attempted to save sack sizes without a valid index.", {
                currentIndex: editingSackIndex, // Log state value when error occurs
                newSackSizes,
                totalQuantity
            });
            // Optionally show an error to the user here
            toast.error("Error saving sack sizes: Invalid state. Please try again.");
            return;
        }

        const indexToUpdate = editingSackIndex;
        console.log(`OrderExpenseDialog: Proceeding to update index: ${indexToUpdate}`);
        const currentExpenseItem = getValues(`expenses.${indexToUpdate}`);

        if (currentExpenseItem) {
            console.log(`OrderExpenseDialog: Updating item at index ${indexToUpdate} with quantity ${totalQuantity} and sizes`, newSackSizes);
            update(indexToUpdate, {
                ...currentExpenseItem,
                expenseItemQuantity: totalQuantity,
                sackSizes: newSackSizes.length > 0 ? newSackSizes : null,
            });
        } else {
            console.error(`OrderExpenseDialog: Could not find expense item at index ${indexToUpdate} to update sack sizes.`);
        }

        // Note: onClose will be called by SackSizeDialog, which triggers handleCloseSackDialog, setting index to null *after* this function completes.

    }, [ editingSackIndex, getValues, update ]); // Dependencies seem correct


    // RHF's onSubmit handler - called after validation passes
    const onSubmit = useCallback(async (formData: OrderExpenseFormValues) => {
        if (!session?.user?.id || !orderData) {
            showErrorDialog("Authentication Error", "User session not found.");
            return;
        }

        const initialSnapshotMap = initialExpensesRef.current;
        const changedItems: (OrderExpenseWithRHFId & { sackSizes?: FormSackSizeType[] | null })[] = [];

        // Iterate through the validated form data's expenses
        formData.expenses.forEach(currentExpense => {
            // Exclude items currently in the exit animation phase from submission logic
            if (exitingExpenseIds.has(currentExpense.id!)) {
                return;
            }

            const { id, ...currentItemData } = currentExpense; // Exclude RHF's internal 'id'

            if (!currentItemData.orderExpenseId) {
                // 1. NEW item (no existing ID) - only add if quantity > 0
                if (currentItemData.expenseItemQuantity > 0) {
                    changedItems.push(currentItemData);
                }
            } else {
                // 2. EXISTING item (has orderExpenseId)
                const initialItemData = initialSnapshotMap.get(currentItemData.orderExpenseId);

                if (currentItemData.expenseItemQuantity === 0) {
                    // 2a. Marked for DELETION (quantity is 0)
                    // Ensure it existed initially before marking for deletion
                    if (initialItemData) {
                        changedItems.push(currentItemData);
                    } // Else: Item was likely added and removed before first save - ignore.
                } else if (isExpenseModified(initialItemData, currentExpense)) {
                    // 2b. MODIFIED
                    changedItems.push(currentItemData);
                }
                // 2c. UNCHANGED - Do nothing
            }
        });

        // If nothing actually changed (considering deletions), don't submit
        if (changedItems.length === 0) {
            toast.info("No changes detected to save.");
            setIsOpen(false);
            return;
        }

        // Prepare the final payload
        // The backend schema createOrderExpenseSchema expects sackSizes, so this matches
        const expensesToSubmit = changedItems.map(item => ({
            // const expensesToSubmitUnvalidated = changedItems.map(item => ({
            ...item,
            // Ensure sackSizes is explicitly null if undefined/empty array for backend
            sackSizes: (item.sackSizes && item.sackSizes.length > 0) ? item.sackSizes.map(s => ({
                ...s, // Spread form sack size data
                // Add required fields for backend schema if they differ significantly
                // (Assuming formSackSizeSchema is close enough to backend's sackSizeTrackerSchema structure for insertion)
                // If backend requires `createdBy` etc., add them here based on session user
                createdBy: session.user.id!, // Add createdBy for backend
            })) : null,
        }));
        // const expensesToSubmit = createOrderExpenseSchema.safeParse(expensesToSubmitUnvalidated)

        console.log("Submitting changed expenses (Delta):", JSON.stringify(expensesToSubmit, null, 2));

        // Optional: Re-validate the *delta* payload (as a safety net)
        try {
            createOrderExpenseSchema.parse(expensesToSubmit); // Use parse to throw on error
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                console.error("Delta Validation failed:", validationError.format());
                const errorMessages = validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
                showErrorDialog("Validation Error", `Internal validation failed for the changes:\n${errorMessages}`);
            } else {
                showErrorDialog("Validation Error", "An unexpected validation error occurred.");
            }
            return; // Stop submission
        }


        // --- Execute Mutation ---
        try {
            await createOrderExpenseMutate(expensesToSubmit);

            toast.success("Expenses updated successfully!");
            queryClient.invalidateQueries({ queryKey: [ 'order', orderData.orderId ] }); // Invalidate specific order
            queryClient.invalidateQueries({ queryKey: [ 'orders' ] }); // Invalidate list potentially
            setIsOpen(false); // Close dialog on success

        } catch (error: any) {
            console.error("Submission failed:", error);
            const errorMessage = error?.message || "An unexpected error occurred while saving expenses.";
            showErrorDialog("Save Failed", errorMessage);
        }

    }, [
        session?.user?.id,
        orderData,
        createOrderExpenseMutate,
        queryClient,
        showErrorDialog,
        exitingExpenseIds, // Include exiting IDs dependency
        // initialExpensesRef (ref access doesn't need to be dependency)
    ]);

    // --- Render ---
    if (!orderData) {
        return <Dialog><DialogTrigger asChild>{children}</DialogTrigger></Dialog>; // Still need a basic trigger if no data
    }
    const currentSackData = editingSackIndex !== null ? fields[ editingSackIndex ]?.sackSizes : null;


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent
                onInteractOutside={(e) => {
                    // Prevent closing if dirty and prompt user
                    if (isDirty && !isSaving) {
                        e.preventDefault();
                        setIsCancelDialogOpen(true);
                    }
                    // Allow closing if not dirty or currently saving (submission handles closure)
                }}
                className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col border-0"
            >
                {/* Header */}
                <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                    <DialogTitle className="text-2xl">Order Expense #{orderData.orderId}</DialogTitle>
                </DialogHeader>

                {/* Saving Overlay */}
                {isSaving && (
                    <div className="absolute inset-0 bg-black/70 z-50 flex justify-center items-center ">
                        <Spinner color="white" />
                    </div>
                )}

                {/* Loading State for Expense Items Data */}
                {showLoadingState && (
                    <div className="flex-grow flex items-center justify-center">
                        <Spinner /> <span className="ml-2">Loading Expense Items...</span>
                    </div>
                )}

                {/* Error State for Expense Items Data */}
                {showErrorState && (
                    <div className="flex-grow flex items-center justify-center text-destructive">
                        Error loading expense items. Cannot add or modify expenses.
                    </div>
                )}

                {/* Form Content */}
                {showContent && (
                    // Use <form> tag and RHF's handleSubmit
                    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col flex-grow overflow-hidden", isSaving && "opacity-50 pointer-events-none")}>
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden">
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
                                />
                                <h3 className="text-md font-semibold text-gray-700 mt-2 border-b pb-1">Order Items</h3>
                                <OrderItemsTable items={orderData.items} isLoading={false} />
                            </div>

                            {/* Right Panel: Expenses Card */}
                            <Card className="md:col-span-7 flex flex-col overflow-hidden shadow-md border">
                                <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-blue-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
                                    <CardTitle className="text-lg font-semibold">Order Expenses</CardTitle>
                                    {isLoading ? <Skeleton className="h-8 w-32" /> :
                                        <Button
                                            type="button" // Prevent form submission
                                            onClick={addExpense}
                                            variant="outline" size="sm"
                                            className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                                            disabled={!canAddExpense || isSaving} // Disable if cannot add or currently saving
                                        >
                                            <Plus className="h-4 w-4" /> Add Expense
                                        </Button>}
                                </CardHeader>

                                <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
                                    {isLoading ? ( // Loading expense *options*
                                        <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                                            <Spinner size="sm" />
                                            <p>Loading expense options...</p>
                                        </div>
                                    ) : fields.filter(f => !exitingExpenseIds.has(f.id!)).length === 0 ? ( // Check RHF fields length, excluding exiting
                                        <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                                            <p>No expenses added.</p>
                                            <p className="text-sm">Click "Add Expense" to begin.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Header Row */}
                                            <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-4 py-2 sticky top-0 bg-gray-100 z-10 border-b flex-shrink-0">
                                                <div className="col-span-1">#</div>
                                                <div className="col-span-4">EXPENSE</div>
                                                <div className="col-span-2 text-center">QTY</div>
                                                <div className="col-span-2 text-center">PRICE</div>
                                                <div className="col-span-2 text-center">TOTAL</div>
                                                <div className="col-span-1 text-center">ACT</div>
                                            </div>

                                            {/* Expense Rows List */}
                                            <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar">
                                                {fields.map((field, index) => {
                                                    const isExiting = exitingExpenseIds.has(field.id!);
                                                    // Calculate visual index based on non-exiting fields before this one
                                                    const visualIndex = fields
                                                        .slice(0, index)
                                                        .filter(f => !exitingExpenseIds.has(f.id!))
                                                        .length + 1;

                                                    // Don't render if it's a *new* item marked for deletion (already handled by remove)
                                                    // Do render if it's an *existing* item marked for deletion (qty=0) or not deleted
                                                    const isMarkedForDeletion = field.expenseItemQuantity === 0 && !!field.orderExpenseId;
                                                    if (field.expenseItemQuantity === 0 && !field.orderExpenseId && !isExiting) {
                                                        return null; // Don't render new items with 0 quantity unless mid-animation
                                                    }

                                                    return (
                                                        <ExpenseItemRow
                                                            key={field.id} // RHF provides stable key
                                                            field={field} // Pass the RHF field object
                                                            fieldIndex={index}
                                                            control={control}
                                                            register={register}
                                                            errors={errors}
                                                            isExiting={isExiting}
                                                            expenseItemsData={expenseItemsData}
                                                            isPending={isSaving} // Pass combined saving state
                                                            onRemoveRequest={handleRemoveItem} // Pass remove handler
                                                            visualIndex={visualIndex}
                                                            setValue={setValue} // Pass setValue for price updates
                                                            onOpenSackDialog={handleOpenSackDialog}
                                                            sackExpenseItemId={SACK_PACKING_EXPENSE_ITEM_ID}

                                                        />
                                                    );
                                                })}
                                            </div>

                                            {/* Shared Notes Area */}
                                            <div className="px-4 pt-3 pb-1 mt-auto flex-shrink-0 border-t bg-gray-50/50">
                                                <label htmlFor="expense-notes" className="block text-sm font-medium text-muted-foreground mb-1">Expense Notes</label>
                                                <Textarea
                                                    id="expense-notes"
                                                    placeholder="Add general notes for the order expenses..."
                                                    rows={2}
                                                    className={cn("text-sm", errors.expenseNotes && "border-destructive")}
                                                    disabled={isSaving}
                                                    {...register("expenseNotes")} // Register notes field
                                                />
                                                {errors.expenseNotes && <p className="text-xs text-destructive mt-1">{errors.expenseNotes.message}</p>}
                                            </div>
                                        </>
                                    )}
                                </CardContent>

                                {/* Footer with Totals */}
                                {hasActiveExpenses && (
                                    <CardFooter className="flex flex-col items-stretch border-t pt-3 pb-3 flex-shrink-0 bg-gray-50/50 px-4">
                                        <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                                            <span>Number of active expenses:</span>
                                            {/* Count based on watched data */}
                                            <span>{watchedExpenses.filter(exp => !exitingExpenseIds.has(exp.id!) && exp.expenseItemQuantity > 0).length}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-medium">
                                            <span>Total Active Expense Cost:</span>
                                            <span className="text-lg">AED {totalExpenseCost.toFixed(2)}</span>
                                        </div>
                                    </CardFooter>
                                )}
                            </Card>
                        </div>

                        {/* Dialog Actions inside the form */}
                        <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50 mt-auto">
                            <Button
                                type="button" // Important: Not submit
                                variant="outline"
                                onClick={() => {
                                    if (isDirty && !isSaving) {
                                        setIsCancelDialogOpen(true);
                                    } else {
                                        setIsOpen(false); // Close directly if not dirty or saving
                                    }
                                }}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit" // Submit the form
                                className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isLoading || hasLoadError || isSaving || !isDirty} // Disable if loading options, error, saving, or form isn't dirty
                            >
                                {isSaving ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSaving ? "Saving..." : "Update Expenses"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>

            {/* Error Dialog Component */}
            <ErrorDialogComponent />

            {/* Cancel Confirmation Dialog */}
            {/* <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to discard them?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsCancelDialogOpen(false)}>
                            Continue Editing
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => {
                            setIsCancelDialogOpen(false);
                            setIsOpen(false); // Close the main dialog
                            reset(); // Reset form state to defaults (or last fetched data)
                        }}>
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog> */}
            {editingSackIndex !== null && (
                <SackSizeDialog
                    isOpen={editingSackIndex !== null}
                    onClose={handleCloseSackDialog}
                    onSave={handleSaveSackSizes}
                    initialData={currentSackData ?? []} // Pass current data or empty array
                    expenseItemName={expenseItemsData?.find(item => item.expenseItemId === fields[ editingSackIndex ]?.expenseItemId)?.expenseName || 'Expense Item'}
                />
            )}
        </Dialog>
    );
}