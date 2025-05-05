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

const SACK_PACKING_EXPENSE_ITEM_ID = process.env.SACK_PACKING_EXPENSE_ITEM_ID || "1d55fcb3-bc10-4b3a-82e9-a329deeafcf0"; // Load from env or define directly
// --- Types ---

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

// Initial Expense Data (doesn't need sackSizes as they aren't fetched initially)
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
        setValue,
        getValues, // Need getValues to pass current sack data
        formState: { errors, isDirty, isSubmitting },
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
        keyName: "id",
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

    // --- Event Handlers ---

    const addExpense = useCallback(() => {
        if (!canAddExpense || !orderData || !session?.user?.id) return;
        append({
            orderId: orderData.orderId,
            expenseItemId: "",
            expenseItemPrice: 0,
            expenseItemQuantity: 1,
            notes: undefined,
            createdBy: session.user.id,
            sackSizes: null, // Initialize sackSizes as null or empty array
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
        setEditingSackIndex(index);
    }, []);

    // Handler to close the Sack Size Dialog
    const handleCloseSackDialog = useCallback(() => {
        setEditingSackIndex(null);
    }, []);

    // Handler to save sack sizes from the dialog back into the main form state
    const handleSaveSackSizes = useCallback((index: number, newSackSizes: FormSackSizeType[]) => {
        const currentExpenseItem = getValues(`expenses.${index}`);
        update(index, {
            ...currentExpenseItem,
            sackSizes: newSackSizes.length > 0 ? newSackSizes : null, // Store as null if empty
        });
        setEditingSackIndex(null); // Close the dialog
    }, [ getValues, update ]);


    // RHF's onSubmit handler - needs to include sackSizes in the payload
    const onSubmit = useCallback(async (formData: OrderExpenseFormValues) => {
        if (!session?.user?.id || !orderData) {
            showErrorDialog("Authentication Error", "User session not found.");
            return;
        }

        const initialSnapshotMap = initialExpensesRef.current;
        // Ensure the type includes sackSizes for comparison/submission
        const changedItems: (CreateOrderExpenseItem & { sackSizes?: FormSackSizeType[] | null })[] = [];

        formData.expenses.forEach(currentExpense => {
            if (exitingExpenseIds.has(currentExpense.id!)) return;

            const { id, ...currentItemData } = currentExpense; // Exclude RHF's internal 'id'

            if (!currentItemData.orderExpenseId) {
                // 1. NEW item
                if (currentItemData.expenseItemQuantity > 0) {
                    changedItems.push(currentItemData); // Includes sackSizes if present
                }
            } else {
                // 2. EXISTING item
                const initialItemData = initialSnapshotMap.get(currentItemData.orderExpenseId);

                if (currentItemData.expenseItemQuantity === 0) {
                    // 2a. Marked for DELETION
                    if (initialItemData) {
                        // Include sackSizes (though backend might ignore them on delete)
                        changedItems.push(currentItemData);
                    }
                } else if (isExpenseModified(initialItemData, currentExpense)) {
                    // 2b. MODIFIED (isExpenseModified now checks sacks)
                    changedItems.push(currentItemData); // Includes sackSizes
                }
            }
        });

        if (changedItems.length === 0) {
            toast.info("No changes detected to save.");
            setIsOpen(false);
            return;
        }

        // Prepare the final payload
        // The backend schema createOrderExpenseSchema expects sackSizes, so this matches
        const expensesToSubmit: createOrderExpenseSchemaType = changedItems.map(item => ({
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

        console.log("Submitting changed expenses (Delta):", JSON.stringify(expensesToSubmit, null, 2));

        // --- Backend Validation (using the correct schema) ---
        try {
            // Use the schema that the *backend* expects (includes sackSizes)
            createOrderExpenseSchema.parse(expensesToSubmit);
        } catch (validationError) {
            // ... (error handling as before) ...
            return;
        }

        // --- Execute Mutation ---
        try {
            await createOrderExpenseMutate(expensesToSubmit);
            // ... (success handling as before) ...
        } catch (error: any) {
            // ... (error handling as before) ...
        }

    }, [
        session?.user?.id,
        orderData,
        createOrderExpenseMutate,
        queryClient,
        showErrorDialog,
        exitingExpenseIds,
    ]);

    // --- Render ---
    if (!orderData) {
        return <Dialog><DialogTrigger asChild>{children}</DialogTrigger></Dialog>;
    }

    const currentSackData = editingSackIndex !== null ? fields[ editingSackIndex ]?.sackSizes : null;


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {/* ... DialogTrigger ... */}

            <DialogContent /* ... props ... */ >
                {/* ... Header, Overlays, Loading/Error States ... */}

                {/* Form Content */}
                {showContent && (
                    <form onSubmit={handleSubmit(onSubmit)} className={/* ... cn ... */}>
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden">
                            {/* ... Left Panel ... */}

                            {/* Right Panel: Expenses Card */}
                            <Card className="md:col-span-7 flex flex-col overflow-hidden shadow-md border">
                                {/* ... CardHeader ... */}
                                <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
                                    {/* ... Loading/Empty State ... */}
                                    {/* Expense Rows List */}
                                    <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar">
                                        {fields.map((field, index) => {
                                            // ... calculating visualIndex, isExiting, isMarkedForDeletion ...
                                            if (field.expenseItemQuantity === 0 && !field.orderExpenseId && !isExiting) {
                                                return null;
                                            }

                                            return (
                                                <ExpenseItemRow
                                                    key={field.id}
                                                    field={field}
                                                    fieldIndex={index}
                                                    control={control}
                                                    register={register}
                                                    errors={errors}
                                                    isExiting={isExiting}
                                                    expenseItemsData={expenseItemsData}
                                                    isPending={isSaving}
                                                    onRemoveRequest={handleRemoveItem}
                                                    visualIndex={visualIndex}
                                                    setValue={setValue}
                                                    // Pass handler to open sack dialog
                                                    onOpenSackDialog={handleOpenSackDialog}
                                                    // Pass the special ID to conditionally show the button
                                                    sackExpenseItemId={SACK_PACKING_EXPENSE_ITEM_ID}
                                                />
                                            );
                                        })}
                                    </div>
                                    {/* ... Shared Notes Area ... */}
                                </CardContent>
                                {/* ... CardFooter ... */}
                            </Card>
                        </div>
                        {/* ... DialogFooter ... */}
                    </form>
                )}
            </DialogContent>

            {/* Error Dialog Component */}
            <ErrorDialogComponent />

            {/* Cancel Confirmation Dialog */}
            {/* ... AlertDialog ... */}

            {/* Sack Size Dialog */}
            {editingSackIndex !== null && (
                <SackSizeDialog
                    isOpen={editingSackIndex !== null}
                    onClose={handleCloseSackDialog}
                    onSave={(newSizes) => handleSaveSackSizes(editingSackIndex, newSizes)}
                    initialData={currentSackData ?? []} // Pass current data or empty array
                    expenseItemName={expenseItemsData?.find(item => item.expenseItemId === fields[ editingSackIndex ]?.expenseItemId)?.expenseName || 'Expense Item'}
                />
            )}
        </Dialog>
    );
}