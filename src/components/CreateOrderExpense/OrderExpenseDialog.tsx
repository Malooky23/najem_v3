// // "use client"

// // import React, { ReactNode, useState, useRef, useEffect } from "react";
// // import { Plus, Trash2 } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import {
// //     Dialog,
// //     DialogClose,
// //     DialogContent,
// //     DialogFooter,
// //     DialogHeader,
// //     DialogTitle,
// //     DialogTrigger
// // } from "@/components/ui/dialog";
// // import { cn } from "@/lib/utils";
// // import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// // import { useIsMobileTEST } from "@/hooks/use-media-query";
// // import { OrderItemsTable } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderItemsTable";
// // import { useSelectedOrderData } from "@/stores/orders-store";
// // import { Textarea } from "@/components/ui/textarea";
// // import { OrderInfoCard } from "./OrderInfoCard";
// // // Import the necessary schema and types
// // import { createOrderExpenseSchema, createOrderExpenseSchemaType, selectExpenseSchemaType } from "@/types/expense";
// // import { useQuery, useQueryClient } from "@tanstack/react-query";
// // import { z } from "zod";

// // import { useSession } from "next-auth/react";
// // import { useCreateOrderExpense } from "@/hooks/data/useOrders"; // Assuming this hook calls the backend upsert logic
// // import { LoadingSpinner } from "../ui/loading-spinner";
// // import { useErrorDialog } from "@/hooks/useErrorDialog";
// // import { toast } from "sonner";

// // // Correctly derive the inferred type for a single item from the creation schema array
// // // This includes the optional orderExpenseId
// // type CreateOrderExpenseItem = z.infer<typeof createOrderExpenseSchema.element>;

// // // Define an augmented type for state management with numeric clientId
// // type OrderExpenseWithClient = CreateOrderExpenseItem & { clientId: number };


// // // --- CSS Transition Duration ---
// // const EXIT_ANIMATION_DURATION = 300;

// // interface OrderExpenseDialogProps {
// //     children: ReactNode;
// // }


// // // --- Component ---
// // export function OrderExpenseDialog({
// //     children,
// // }: OrderExpenseDialogProps) {

// //     const orderData = useSelectedOrderData();
// //     if (!orderData) {
// //         console.error("OrderExpenseDialog: No Order Selected in store");
// //         return <Dialog><DialogTrigger asChild>{children}</DialogTrigger></Dialog>;
// //     }

// //     // Memoize initial expenses derived from orderData
// //     const initialExpensesFromStore = React.useMemo(() => {
// //         return orderData.expenses?.map(exp => ({
// //             orderExpenseId: exp.orderExpenseId,
// //             orderId: exp.orderId,
// //             expenseItemId: exp.expenseItemId,
// //             expenseItemQuantity: exp.expenseItemQuantity,
// //             notes: exp.notes,
// //             createdBy: exp.createdBy,
// //         })) ?? [];
// //     }, [ orderData.expenses, orderData.orderId ]);

// //     // Assuming useCreateOrderExpense hook now points to a service that handles upsert/delete
// //     const { mutateAsync, isPending, isError, isSuccess, error: mutationError, status:mutationStatus } = useCreateOrderExpense();

// //     // --- State ---
// //     const [ isOpen, setIsOpen ] = useState(false);
// //     const [ nextClientId, setNextClientId ] = useState(1);
// //     const [ expenses, setExpenses ] = useState<OrderExpenseWithClient[]>([]);
// //     const [ expenseNotes, setExpenseNotes ] = useState(""); // Use overall order notes for this field
// //     const [ exitingExpenseIds, setExitingExpenseIds ] = useState<Set<number>>(new Set());
// //     const queryClient = useQueryClient()


// //     // --- Refs ---
// //     const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

// //     // --- Hooks ---
// //     const isMobile = useIsMobileTEST();
// //     const { data: session } = useSession();
// //     const { ErrorDialogComponent, showErrorDialog } = useErrorDialog()

// //     // Fetch available expense items
// //     const { data: expenseItemsData, isLoading: isExpenseItemsLoading, isError: isExpenseItemsError } = useQuery<selectExpenseSchemaType[]>({
// //         queryKey: [ "expenseItems" ],
// //         queryFn: async (): Promise<selectExpenseSchemaType[]> => {
// //             const demo: selectExpenseSchemaType[] = [
// //                 { expenseItemId: "1aa82b76-fbf0-42ea-b17a-395e87cbf2fb", expenseName: "Sack Small", expensePrice: 5, expenseCategory: "PACKING", notes: "Small sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
// //                 { expenseItemId: "35608ed0-5472-4fc5-ae7d-049d9d46453b", expenseName: "Sack Large", expensePrice: 5, expenseCategory: "PACKING", notes: "Large sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
// //                 { expenseItemId: "c8a9f0b1-e2d3-4c5b-8a9f-0b1e2d3c4b5a", expenseName: "Loading", expensePrice: 10, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
// //                 { expenseItemId: "969f409b-c721-43a1-b0a3-40950b8434fe", expenseName: "Offloading", expensePrice: 15, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
// //             ];
// //             await new Promise(resolve => setTimeout(resolve, 500));
// //             return demo;
// //         },
// //     });


// //     // --- Effects ---
// //     useEffect(() => {
// //         const timeouts = timeoutsRef.current;
// //         return () => {
// //             timeouts.forEach(timeoutId => clearTimeout(timeoutId));
// //             timeouts.clear();
// //         };
// //     }, []);

// //     // Reset state when dialog opens/closes or orderData changes
// //     useEffect(() => {
// //         if (isOpen && orderData) {
// //             // Use the memoized initial expenses
// //             const mappedInitialExpenses = initialExpensesFromStore.map((exp, index) => ({
// //                 ...exp,
// //                 orderId: orderData.orderId, // Ensure orderId is current
// //                 clientId: index + 1 // Assign client ID
// //             }));

// //             setExpenses(mappedInitialExpenses);
// //             setNextClientId(mappedInitialExpenses.length + 1); // Set next ID correctly
// //             setExpenseNotes(orderData.notes ?? "");
// //             setExitingExpenseIds(new Set());
// //         }
// //     }, [ isOpen, orderData, initialExpensesFromStore ]); // Add dependency


// //     // --- Event Handlers ---
// //     const addExpense = () => {
// //         if (!expenseItemsData || expenseItemsData.length === 0 || !session?.user.id) {
// //             console.warn("Cannot add expense: No expense items loaded or user not logged in.");
// //             return;
// //         }

// //         const defaultExpenseItem = expenseItemsData[ 0 ];
// //         // New expenses don't have orderExpenseId
// //         const newExpense: OrderExpenseWithClient = {
// //             clientId: nextClientId,
// //             orderId: orderData.orderId,
// //             expenseItemId: defaultExpenseItem.expenseItemId,
// //             expenseItemQuantity: 1,
// //             notes: undefined, // Initialize notes as undefined
// //             createdBy: session.user.id,
// //             // orderExpenseId is omitted
// //         };

// //         setExpenses(prevExpenses => [ ...prevExpenses, newExpense ]);
// //         setNextClientId(prevId => prevId + 1);
// //     };


// //     // Use keys from the correctly inferred CreateOrderExpenseItem type
// //     const updateExpense = (clientId: number, field: keyof CreateOrderExpenseItem, value: any) => {
// //         // Prevent updating fields that shouldn't be changed directly in the grid
// //         if (field === 'orderId' || field === 'createdBy' || field === 'orderExpenseId') {
// //             return;
// //         }

// //         setExpenses(prevExpenses =>
// //             prevExpenses.map((expense) => {
// //                 if (expense.clientId !== clientId) return expense;

// //                 let processedValue = value;
// //                 if (field === "expenseItemQuantity") {
// //                     const numValue = Number.parseInt(String(value), 10);
// //                     processedValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
// //                 } else if (field === "notes") {
// //                     // Store null internally if empty, otherwise store the string
// //                     processedValue = value === "" ? null : value;
// //                 }

// //                 return { ...expense, [ field ]: processedValue };
// //             })
// //         );
// //     };


// //     const removeExpense = (clientId: number) => {
// //         if (exitingExpenseIds.has(clientId) || !timeoutsRef.current) return;

// //         setExitingExpenseIds(prev => new Set(prev).add(clientId));

// //         const timeoutId = setTimeout(() => {
// //             // Important: Filter based on clientId, not orderExpenseId
// //             setExpenses(prev => prev.filter(exp => exp.clientId !== clientId));
// //             setExitingExpenseIds(prev => {
// //                 const newSet = new Set(prev);
// //                 newSet.delete(clientId);
// //                 return newSet;
// //             });
// //             timeoutsRef.current.delete(clientId);
// //         }, EXIT_ANIMATION_DURATION);

// //         timeoutsRef.current.set(clientId, timeoutId);
// //     };

// //     // Handles submission assuming backend performs upsert and delete
// //     const handleUpdate = async () => {
// //         if (!session?.user.id) {
// //             console.error("User not authenticated.");
// //             // TODO: Show error toast
// //             return;
// //         }

// //         const activeExpenses = expenses.filter(exp => !exitingExpenseIds.has(exp.clientId));

// //         // Prepare the full list of desired expenses for the backend upsert/sync
// //         const expensesToSubmit: createOrderExpenseSchemaType = activeExpenses.map((exp) => ({
// //             orderExpenseId: exp.orderExpenseId, // Include existing ID for updates/identification
// //             orderId: exp.orderId,
// //             expenseItemId: exp.expenseItemId,
// //             expenseItemQuantity: exp.expenseItemQuantity,
// //             // Use current user ID for creator on *all* items sent? Or keep original?
// //             // Keeping original for now, backend might decide. Schema requires it.
// //             createdBy: exp.createdBy,
// //             notes: exp.notes === null ? undefined : exp.notes, // Handle null -> undefined
// //         }));

// //         console.log("Submitting Expenses for Upsert/Sync:", JSON.stringify(expensesToSubmit, null, 2));
// //         // TODO: Consider submitting the overall 'expenseNotes' as well if it maps to order.notes

// //         try {
// //             // Validate the payload before sending
// //             const validatedValues = createOrderExpenseSchema.parse(expensesToSubmit);
// //             // if (!validatedValues.success) {
// //             //     console.error("Validation failed:", validatedValues.error.format());
// //             //     // TODO: Show validation error toast
// //             //     showErrorDialog("Error", " Zod validation failed")
// //             //     return;
// //             // }
// //             console.log("Validation successful. Sending to backend...");

// //             // Call the mutation hook (assuming it points to the updated backend logic)
// //             console.log(validatedValues)
// //             if(validatedValues.length <= 0){
// //                 setIsOpen(false)
// //                 throw new Error("Nothing to save")
// //             }
// //             await mutateAsync(validatedValues);

// //             if (isSuccess) {
// //                 setIsOpen(false); // Close dialog optimistically
// //                 toast.success("Expense Saved")
// //                 queryClient.invalidateQueries({queryKey:[ 'order', validatedValues[0].orderId]})
// //             }

// //             if (isError) {
// //                 showErrorDialog("Failed to save expense", mutationError.message)
// //             }

// //         } catch (error:any) {
// //             showErrorDialog("Failed to save expense", error.message)
// //             console.error("Submission failed:", error);
// //             // TODO: Show error toast to the user
// //         }
// //     };


// //     const totalExpenseCost = expenses
// //         .filter(exp => !exitingExpenseIds.has(exp.clientId))
// //         .reduce((sum, orderExpense) => {
// //             const expenseItem = expenseItemsData?.find(item => item.expenseItemId === orderExpense.expenseItemId);
// //             const price = expenseItem?.expensePrice ?? 0;
// //             const quantity = orderExpense.expenseItemQuantity ?? 0;
// //             return sum + price * quantity;
// //         }, 0);


// //     // Handle loading state for expense items query
// //     const isLoading = isExpenseItemsLoading;

// //     // Render loading state within the dialog if it's open
// //     const renderLoadingOrError = () => {
// //         if (isLoading) {
// //             return (
// //                 <div className="flex-grow flex items-center justify-center">
// //                     <LoadingSpinner /> <span className="ml-2">Loading Expense Items...</span>
// //                 </div>
// //             );
// //         }
// //         if (isExpenseItemsError) {
// //             return (
// //                 <div className="flex-grow flex items-center justify-center text-destructive">
// //                     Error loading expense items.
// //                 </div>
// //             );
// //         }
// //         return null;
// //     };


// //     // Main Dialog Render
// //     return (
// //         <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
// //             <DialogTrigger asChild>{children}</DialogTrigger>

// //             <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
// //                 <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
// //                     <DialogTitle className="text-2xl">Order Expense #{orderData.orderId} {mutationStatus}</DialogTitle>
// //                 </DialogHeader>
// //                 {isPending && ( // Show saving overlay
// //                     <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center rounded-md">
// //                         <Card>
// //                             <CardHeader><CardTitle>Saving...</CardTitle></CardHeader>
// //                             <CardContent><LoadingSpinner /></CardContent>
// //                         </Card>
// //                     </div>
// //                 )}

// //                 {/* Conditional rendering for loading/error states */}
// //                 {isLoading || isExpenseItemsError ? (
// //                     renderLoadingOrError()
// //                 ) : (
// //                     <div className={cn("grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden", isPending && "opacity-50 pointer-events-none")}>

// //                         <div className="flex flex-col md:col-span-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
// //                             <OrderInfoCard
// //                                 customerId={orderData.customerId}
// //                                 customerName={orderData.customerName}
// //                                 orderType={(orderData as any).orderType || "N/A"}
// //                                 movement={orderData.movement}
// //                                 packingType={orderData.packingType}
// //                                 deliveryMethod={orderData.deliveryMethod}
// //                                 orderMark={orderData.orderMark || undefined}
// //                             />
// //                             <h3 className="text-md font-semibold text-gray-700 mt-2 border-b pb-1">Order Items</h3>
// //                             <OrderItemsTable items={orderData.items} isLoading={false} />
// //                         </div>

// //                         <Card className="md:col-span-7 flex flex-col overflow-hidden shadow-md border">
// //                             <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-blue-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
// //                                 <CardTitle className="text-lg font-semibold">Order Expenses</CardTitle>
// //                                 <Button onClick={addExpense} variant="outline" size="sm" className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50" disabled={!expenseItemsData || isPending}>
// //                                     <Plus className="h-4 w-4" /> Add Expense
// //                                 </Button>
// //                             </CardHeader>

// //                             <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
// //                                 {expenses.length === 0 && exitingExpenseIds.size === 0 ? (
// //                                     <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
// //                                         <p>No expenses added yet.</p>
// //                                         <p className="text-sm">Click "Add Expense" to begin.</p>
// //                                     </div>
// //                                 ) : (
// //                                     <>
// //                                         <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-4 py-2 sticky top-0 bg-gray-100 z-10 border-b flex-shrink-0">
// //                                             <div className="col-span-1">#</div>
// //                                             <div className="col-span-4">CATEGORY</div>
// //                                             <div className="col-span-2 text-center">QTY</div>
// //                                             <div className="col-span-2 text-center">PRICE</div>
// //                                             <div className="col-span-2 text-center">TOTAL</div>
// //                                             <div className="col-span-1 text-center">ACT</div>
// //                                         </div>

// //                                         <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar">
// //                                             {expenses.map((expense, index) => {
// //                                                 const isExiting = exitingExpenseIds.has(expense.clientId);
// //                                                 const visualIndex = expenses.slice(0, index).filter(e => !exitingExpenseIds.has(e.clientId)).length + 1;
// //                                                 const currentExpenseItem = expenseItemsData?.find(item => item.expenseItemId === expense.expenseItemId);
// //                                                 const currentExpensePrice = currentExpenseItem?.expensePrice ?? 0;
// //                                                 const quantity = expense.expenseItemQuantity ?? 1;

// //                                                 return (
// //                                                     <div
// //                                                         key={expense.clientId}
// //                                                         className={cn(
// //                                                             "grid grid-cols-12 gap-x-2 gap-y-1 items-center py-1",
// //                                                             "expense-row",
// //                                                             isExiting && "expense-row-exiting"
// //                                                         )}
// //                                                         aria-hidden={isExiting}
// //                                                     >
// //                                                         <div className="col-span-1 text-sm text-muted-foreground pl-1 font-medium">
// //                                                             {!isExiting ? visualIndex : ''}
// //                                                         </div>

// //                                                         <div className="col-span-4">
// //                                                             <Select
// //                                                                 value={expense.expenseItemId}
// //                                                                 onValueChange={(value) => updateExpense(expense.clientId, "expenseItemId", value)}
// //                                                                 disabled={isExiting || !expenseItemsData || isPending}
// //                                                             >
// //                                                                 <SelectTrigger className="h-8 text-sm">
// //                                                                     <SelectValue placeholder="Select category" />
// //                                                                 </SelectTrigger>
// //                                                                 <SelectContent>
// //                                                                     {expenseItemsData?.map((item) => (
// //                                                                         <SelectItem key={item.expenseItemId} value={item.expenseItemId}>
// //                                                                             {item.expenseName}
// //                                                                         </SelectItem>
// //                                                                     ))}
// //                                                                 </SelectContent>
// //                                                             </Select>
// //                                                         </div>

// //                                                         <div className="col-span-2">
// //                                                             <Input
// //                                                                 type="number"
// //                                                                 min="1"
// //                                                                 className="h-8 text-sm text-center"
// //                                                                 value={quantity}
// //                                                                 onChange={(e) => updateExpense(expense.clientId, "expenseItemQuantity", e.target.value)}
// //                                                                 disabled={isExiting || isPending}
// //                                                             />
// //                                                         </div>

// //                                                         <div className="col-span-2">
// //                                                             <div className="relative">
// //                                                                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
// //                                                                 <Input
// //                                                                     type="number"
// //                                                                     min="0"
// //                                                                     step="0.01"
// //                                                                     className="pl-4 pr-1 h-8 text-sm text-center"
// //                                                                     value={currentExpensePrice.toFixed(2)}
// //                                                                     readOnly
// //                                                                     disabled={isExiting || isPending}
// //                                                                 />
// //                                                             </div>
// //                                                         </div>

// //                                                         <div className="col-span-2">
// //                                                             <div className={cn(
// //                                                                 "bg-muted/80 px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center font-medium",
// //                                                                 isExiting && "opacity-50"
// //                                                             )}>
// //                                                                 ${(currentExpensePrice * quantity).toFixed(2)}
// //                                                             </div>
// //                                                         </div>

// //                                                         <div className="col-span-1 flex justify-center">
// //                                                             <Button
// //                                                                 variant="ghost"
// //                                                                 size="icon"
// //                                                                 className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 disabled:opacity-30"
// //                                                                 onClick={() => removeExpense(expense.clientId)}
// //                                                                 disabled={isExiting || isPending}
// //                                                                 aria-label="Remove expense"
// //                                                             >
// //                                                                 <Trash2 className="h-4 w-4" />
// //                                                             </Button>
// //                                                         </div>
// //                                                     </div>
// //                                                 );
// //                                             })}
// //                                         </div>

// //                                         <div className="px-4 pt-3 pb-1 mt-auto flex-shrink-0 border-t bg-gray-50/50">
// //                                             <label htmlFor="expense-notes" className="block text-sm font-medium text-muted-foreground mb-1">Order Notes (Shared)</label>
// //                                             <Textarea
// //                                                 id="expense-notes"
// //                                                 placeholder="Add general notes for the order..."
// //                                                 rows={2}
// //                                                 className="text-sm"
// //                                                 value={expenseNotes ?? ""}
// //                                                 onChange={(e) => {
// //                                                     setExpenseNotes(e.target.value)
// //                                                 }
// //                                                 }
// //                                                 disabled={isPending}
// //                                             />
// //                                             {/* TODO: Add individual expense notes if needed */}
// //                                         </div>
// //                                     </>
// //                                 )}
// //                             </CardContent>

// //                             {expenses.some(exp => !exitingExpenseIds.has(exp.clientId)) && (
// //                                 <CardFooter className="flex flex-col items-stretch border-t pt-3 pb-3 flex-shrink-0 bg-gray-50/50 px-4">
// //                                     <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
// //                                         <span>Number of expenses:</span>
// //                                         <span>{expenses.filter(exp => !exitingExpenseIds.has(exp.clientId)).length}</span>
// //                                     </div>
// //                                     <div className="flex justify-between items-center font-medium">
// //                                         <span>Total Expense Cost:</span>
// //                                         <span className="text-lg">${totalExpenseCost.toFixed(2)}</span>
// //                                     </div>
// //                                 </CardFooter>
// //                             )}
// //                         </Card>
// //                     </div>
// //                 )}

// //                 <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50">
// //                     <DialogClose asChild>
// //                         <Button type="button" variant="outline" disabled={isPending}>
// //                             Cancel
// //                         </Button>
// //                     </DialogClose>
// //                     <Button
// //                         type="button"
// //                         onClick={handleUpdate}
// //                         className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
// //                         disabled={isPending || isLoading || isExpenseItemsError} // Disable if loading items, error, or saving
// //                     >
// //                         {isPending ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
// //                         {isPending ? "Saving..." : "Update Expenses"}
// //                     </Button>
// //                 </DialogFooter>
// //             </DialogContent>
// //             <ErrorDialogComponent />

// //         </Dialog>
// //     );
// // }

// "use client"

// import React, { ReactNode, useState, useRef, useEffect, useCallback, useMemo } from "react";
// import { Plus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import {
//     Dialog,
//     DialogClose,
//     DialogContent,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger
// } from "@/components/ui/dialog";
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import { useIsMobileTEST } from "@/hooks/use-media-query";
// import { OrderItemsTable } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderItemsTable";
// import { useSelectedOrderData } from "@/stores/orders-store";
// import { OrderInfoCard } from "./OrderInfoCard";
// import { createOrderExpenseSchema, createOrderExpenseSchemaType, selectExpenseSchemaType } from "@/types/expense";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { z } from "zod";
// import { useSession } from "next-auth/react";
// import { useCreateOrderExpense } from "@/hooks/data/useOrders";
// import { LoadingSpinner } from "../ui/loading-spinner";
// import { useErrorDialog } from "@/hooks/useErrorDialog";
// import { toast } from "sonner";

// // --- Types ---
// type CreateOrderExpenseItem = z.infer<typeof createOrderExpenseSchema.element>;
// type OrderExpenseWithClient = CreateOrderExpenseItem & { clientId: number }; // Client-side ID for list management

// // --- Constants ---
// const EXIT_ANIMATION_DURATION = 300; // CSS transition duration

// // --- Helper Components ---

// interface ExpenseItemRowProps {
//     expense: OrderExpenseWithClient;
//     index: number;
//     isExiting: boolean;
//     expenseItemsData: selectExpenseSchemaType[] | undefined;
//     isPending: boolean; // Is mutation pending?
//     onUpdate: (clientId: number, field: keyof CreateOrderExpenseItem, value: any) => void;
//     onRemove: (clientId: number) => void;
// }

// // Memoized row component to prevent unnecessary re-renders
// const ExpenseItemRow = React.memo(({
//     expense,
//     index,
//     isExiting,
//     expenseItemsData,
//     isPending,
//     onUpdate,
//     onRemove
// }: ExpenseItemRowProps) => {
//     const currentExpenseItem = expenseItemsData?.find(item => item.expenseItemId === expense.expenseItemId);
//     const currentExpensePrice = currentExpenseItem?.expensePrice ?? 0;
//     const quantity = expense.expenseItemQuantity ?? 1;
//     const total = currentExpensePrice * quantity;

//     return (
//         <div
//             key={expense.clientId} // Key is crucial for list rendering
//             className={cn(
//                 "grid grid-cols-12 gap-x-2 gap-y-1 items-center py-1",
//                 "expense-row", // Base class for potential styling
//                 isExiting && "expense-row-exiting" // Class to trigger exit animation
//             )}
//             aria-hidden={isExiting} // Hide from accessibility tree during exit
//         >
//             {/* Row Index */}
//             <div className="col-span-1 text-sm text-muted-foreground pl-1 font-medium">
//                 {!isExiting ? index : ''}
//             </div>

//             {/* Category Select */}
//             <div className="col-span-4">
//                 <Select
//                     value={expense.expenseItemId}
//                     onValueChange={(value) => onUpdate(expense.clientId, "expenseItemId", value)}
//                     disabled={isExiting || !expenseItemsData || isPending}
//                 >
//                     <SelectTrigger className="h-8 text-sm">
//                         <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {expenseItemsData?.map((item) => (
//                             <SelectItem key={item.expenseItemId} value={item.expenseItemId}>
//                                 {item.expenseName}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             </div>

//             {/* Quantity Input */}
//             <div className="col-span-2">
//                 <Input
//                     type="number"
//                     min="1"
//                     className="h-8 text-sm text-center"
//                     value={quantity}
//                     onChange={(e) => onUpdate(expense.clientId, "expenseItemQuantity", e.target.value)}
//                     disabled={isExiting || isPending}
//                 />
//             </div>

//             {/* Price Display */}
//             <div className="col-span-2">
//                 <div className="relative">
//                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
//                     <Input
//                         type="number"
//                         className="pl-4 pr-1 h-8 text-sm text-center"
//                         value={currentExpensePrice.toFixed(2)}
//                         readOnly // Price is derived from selected item
//                         disabled={isExiting || isPending} // Visually disable
//                     />
//                 </div>
//             </div>

//             {/* Total Display */}
//             <div className="col-span-2">
//                 <div className={cn(
//                     "bg-muted/80 px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center font-medium",
//                     isExiting && "opacity-50" // Fade out total if row is exiting
//                 )}>
//                     ${total.toFixed(2)}
//                 </div>
//             </div>

//             {/* Remove Button */}
//             <div className="col-span-1 flex justify-center">
//                 <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 disabled:opacity-30"
//                     onClick={() => onRemove(expense.clientId)}
//                     disabled={isExiting || isPending} // Disable during exit or saving
//                     aria-label="Remove expense"
//                 >
//                     <Trash2 className="h-4 w-4" />
//                 </Button>
//             </div>
//         </div>
//     );
// });
// ExpenseItemRow.displayName = "ExpenseItemRow"; // For better debugging


// // --- Main Dialog Component ---
// interface OrderExpenseDialogProps {
//     children: ReactNode;
// }

// export function OrderExpenseDialog({ children }: OrderExpenseDialogProps) {
//     const orderData = useSelectedOrderData();

//     // --- State ---
//     const [ isOpen, setIsOpen ] = useState(false);
//     const [ expenses, setExpenses ] = useState<OrderExpenseWithClient[]>([]);
//     const [ nextClientId, setNextClientId ] = useState(1); // For unique client-side IDs
//     const [ expenseNotes, setExpenseNotes ] = useState(""); // For the shared notes field
//     const [ exitingExpenseIds, setExitingExpenseIds ] = useState<Set<number>>(new Set()); // Track items being removed

//     // --- Refs ---
//     const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map()); // Store removal timeouts

//     // --- Hooks ---
//     const { data: session } = useSession();
//     const queryClient = useQueryClient();
//     const { ErrorDialogComponent, showErrorDialog } = useErrorDialog();
//     const isMobile = useIsMobileTEST(); // Potentially used for layout adjustments (though not explicitly used in provided JSX)

//     // --- Data Fetching ---
//     const { data: expenseItemsData, isLoading: isExpenseItemsLoading, isError: isExpenseItemsError } = useQuery<selectExpenseSchemaType[]>({
//         queryKey: [ "expenseItems" ],
//         // queryFn: fetchExpenseItems, // Replace demo data with actual API call
//         queryFn: async (): Promise<selectExpenseSchemaType[]> => {
//             const demo: selectExpenseSchemaType[] = [
//                             { expenseItemId: "1aa82b76-fbf0-42ea-b17a-395e87cbf2fb", expenseName: "Sack Small", expensePrice: 5, expenseCategory: "PACKING", notes: "Small sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
//                             { expenseItemId: "35608ed0-5472-4fc5-ae7d-049d9d46453b", expenseName: "Sack Large", expensePrice: 5, expenseCategory: "PACKING", notes: "Large sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
//                             { expenseItemId: "c8a9f0b1-e2d3-4c5b-8a9f-0b1e2d3c4b5a", expenseName: "Loading", expensePrice: 10, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
//                             { expenseItemId: "969f409b-c721-43a1-b0a3-40950b8434fe", expenseName: "Offloading", expensePrice: 15, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
//             ];            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
//             return demo;
//         },
//         enabled: isOpen, // Only fetch when the dialog is open
//         staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//     });

//     // --- Mutation ---
//     const { mutateAsync: createOrderExpenseMutate, isPending: isSaving } = useCreateOrderExpense();

//     // --- Memoized Derived Data ---
//     // Initialize expenses from store data only once when dependencies change
//     const initialExpensesFromStore = useMemo(() => {
//         return orderData?.expenses?.map((exp, index) => ({
//             clientId: index + 1, // Assign initial client IDs
//             orderExpenseId: exp.orderExpenseId,
//             orderId: exp.orderId,
//             expenseItemId: exp.expenseItemId,
//             expenseItemQuantity: exp.expenseItemQuantity,
//             notes: exp.notes ?? undefined, // Ensure notes are undefined if null/empty from source
//             createdBy: exp.createdBy,
//         })) ?? [];
//     }, [ orderData?.expenses, orderData?.orderId ]); // Re-run if order or its expenses change

//     // Calculate total cost, excluding items currently exiting
//     const totalExpenseCost = useMemo(() => {
//         return expenses
//             .filter(exp => !exitingExpenseIds.has(exp.clientId))
//             .reduce((sum, orderExpense) => {
//                 const expenseItem = expenseItemsData?.find(item => item.expenseItemId === orderExpense.expenseItemId);
//                 const price = expenseItem?.expensePrice ?? 0;
//                 const quantity = orderExpense.expenseItemQuantity ?? 1; // Default quantity to 1 if undefined
//                 return sum + price * quantity;
//             }, 0);
//     }, [ expenses, expenseItemsData, exitingExpenseIds ]);

//     // Derived state flags for cleaner rendering logic
//     const isLoading = isExpenseItemsLoading; // Loading expense item definitions
//     const hasLoadError = isExpenseItemsError;
//     const canAddExpense = !!expenseItemsData && expenseItemsData.length > 0 && !!session?.user?.id;
//     const showLoadingState = isOpen && isLoading;
//     const showErrorState = isOpen && hasLoadError && !isLoading; // Show error only if not loading
//     const showContent = isOpen && !isLoading && !hasLoadError;
//     const hasActiveExpenses = expenses.some(exp => !exitingExpenseIds.has(exp.clientId));


//     // --- Effects ---

//     // Cleanup timeouts on component unmount
//     useEffect(() => {
//         const timeouts = timeoutsRef.current;
//         return () => {
//             timeouts.forEach(timeoutId => clearTimeout(timeoutId));
//             timeouts.clear();
//         };
//     }, []);

//     // Reset state when dialog opens or the selected order changes
//     useEffect(() => {
//         if (isOpen && orderData) {
//             setExpenses(initialExpensesFromStore);
//             setNextClientId(initialExpensesFromStore.length + 1);
//             setExpenseNotes(orderData.notes ?? ""); // Initialize notes from order data
//             setExitingExpenseIds(new Set()); // Clear any exiting items from previous interactions
//             // Clear stale timeouts if the dialog re-opens with pending removals (edge case)
//             timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
//             timeoutsRef.current.clear();
//         } else if (!isOpen) {
//             // Optional: Reset state when closed if desired, though reset on open is usually sufficient
//             // setExpenses([]);
//             // setExpenseNotes("");
//             // setNextClientId(1);
//         }
//     }, [ isOpen, orderData, initialExpensesFromStore ]); // Rerun when dialog opens/closes or data changes

//     // --- Event Handlers (Memoized with useCallback) ---

//     const addExpense = useCallback(() => {
//         if (!expenseItemsData || expenseItemsData.length === 0 || !session?.user.id || !orderData) {
//             console.warn("Cannot add expense: prerequisites not met.");
//             return;
//         }
//         const defaultExpenseItem = expenseItemsData[ 0 ];
//         const newExpense: OrderExpenseWithClient = {
//             clientId: nextClientId, // Use the next available client ID
//             orderId: orderData.orderId, // Ensure orderId is set
//             expenseItemId: defaultExpenseItem.expenseItemId,
//             expenseItemQuantity: 1,
//             notes: undefined,
//             createdBy: session.user.id,
//             // orderExpenseId is omitted for new items
//         };
//         setExpenses(prevExpenses => [ ...prevExpenses, newExpense ]);
//         setNextClientId(prevId => prevId + 1); // Increment client ID for the next potential add
//     }, [ expenseItemsData, session?.user?.id, nextClientId, orderData ]);


//     const updateExpense = useCallback((clientId: number, field: keyof CreateOrderExpenseItem, value: any) => {
//         // Prevent updating fields that shouldn't be changed directly
//         if (field === 'orderId' || field === 'createdBy' || field === 'orderExpenseId') return;

//         setExpenses(prevExpenses =>
//             prevExpenses.map(expense => {
//                 if (expense.clientId !== clientId) return expense;

//                 let processedValue = value;
//                 if (field === "expenseItemQuantity") {
//                     const numValue = Number.parseInt(String(value), 10);
//                     processedValue = isNaN(numValue) || numValue < 1 ? 1 : numValue; // Ensure positive integer >= 1
//                 } else if (field === "notes") {
//                     processedValue = value === "" ? undefined : value; // Store undefined for empty notes
//                 }

//                 return { ...expense, [ field ]: processedValue };
//             })
//         );
//     }, []); // No external dependencies changing


//     const removeExpense = useCallback((clientId: number) => {
//         // Prevent double-clicks or removing already exiting items
//         if (exitingExpenseIds.has(clientId) || !timeoutsRef.current) return;

//         // Mark the item as exiting for animation
//         setExitingExpenseIds(prev => new Set(prev).add(clientId));

//         // Set a timeout to remove the item from state after the animation
//         const timeoutId = setTimeout(() => {
//             setExpenses(prev => prev.filter(exp => exp.clientId !== clientId));
//             // Clean up the exiting state and timeout ref for this item
//             setExitingExpenseIds(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(clientId);
//                 return newSet;
//             });
//             timeoutsRef.current.delete(clientId);
//         }, EXIT_ANIMATION_DURATION);

//         // Store the timeout ID for potential cleanup
//         timeoutsRef.current.set(clientId, timeoutId);
//     }, [ exitingExpenseIds ]); // Dependency: exitingExpenseIds set


//     const handleUpdate = useCallback(async () => {
//         if (!session?.user?.id || !orderData) {
//             showErrorDialog("Authentication Error", "User session not found.");
//             return;
//         }

//         // Filter out items marked for removal before submission
//         const activeExpenses = expenses.filter(exp => !exitingExpenseIds.has(exp.clientId));

//         // Prepare payload for the backend, mapping client state to the expected schema
//         const expensesToSubmit: createOrderExpenseSchemaType = activeExpenses.map(exp => ({
//             orderExpenseId: exp.orderExpenseId, // Include ID for updates
//             orderId: orderData.orderId, // Ensure correct order ID
//             expenseItemId: exp.expenseItemId,
//             expenseItemQuantity: exp.expenseItemQuantity,
//             createdBy: exp.createdBy, // Keep original creator (backend might override if needed)
//             notes: exp.notes, // Pass notes (undefined if empty)
//         }));

//         // Optional: Add overall notes update logic here if needed
//         // const notesToSubmit = expenseNotes;

//         // Zod validation before sending
//         try {
//             const validationResult = createOrderExpenseSchema.safeParse(expensesToSubmit);
//             if (!validationResult.success) {
//                 console.error("Validation failed:", validationResult.error.format());
//                 // Concatenate validation errors for user display
//                 const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
//                 showErrorDialog("Validation Error", `Please check the expense details:\n${errorMessages}`);
//                 return;
//             }

//             const validatedValues = validationResult.data;

//             // Avoid mutation if there's nothing to save (empty list submitted)
//             if (validatedValues.length === 0 && initialExpensesFromStore.length === 0) {
//                 toast.info("No expenses to save.");
//                 setIsOpen(false); // Close if nothing was there and nothing is being saved
//                 return;
//             }

//             console.log("Submitting validated expenses:", validatedValues);

//             // Execute the mutation
//             await createOrderExpenseMutate(validatedValues);

//             // Success: Invalidate query, show toast, close dialog
//             toast.success("Expenses updated successfully!");
//             queryClient.invalidateQueries({ queryKey: [ 'order', orderData.orderId ] }); // Invalidate specific order query
//             setIsOpen(false); // Close dialog on success

//         } catch (error: any) {
//             // Error during mutation or validation
//             console.error("Submission failed:", error);
//             const errorMessage = error?.message || "An unexpected error occurred while saving expenses.";
//             showErrorDialog("Save Failed", errorMessage);
//             // Keep the dialog open for user to correct or retry
//         }
//     }, [
//         expenses,
//         exitingExpenseIds,
//         session?.user?.id,
//         orderData,
//         expenseNotes, // Add if notes update is implemented
//         createOrderExpenseMutate,
//         queryClient,
//         showErrorDialog,
//         initialExpensesFromStore.length // Add dependency to check initial state
//     ]);

//     // Render fallback if essential order data is missing
//     if (!orderData) {
//         console.error("OrderExpenseDialog: No Order Selected in store");
//         // Render trigger only, dialog content requires orderData
//         return <Dialog><DialogTrigger asChild>{children}</DialogTrigger></Dialog>;
//     }

//     // --- Main Render ---
//     return (
//         <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
//             <DialogTrigger asChild>{children}</DialogTrigger>

//             <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
//                 <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
//                     <DialogTitle className="text-2xl">Order Expense #{orderData.orderId}</DialogTitle>
//                 </DialogHeader>

//                 {/* Saving Overlay */}
//                 {isSaving && (
//                     <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center rounded-md">
//                         <Card>
//                             <CardHeader><CardTitle>Saving...</CardTitle></CardHeader>
//                             <CardContent><LoadingSpinner /></CardContent>
//                         </Card>
//                     </div>
//                 )}

//                 {/* Loading State */}
//                 {showLoadingState && (
//                     <div className="flex-grow flex items-center justify-center">
//                         <LoadingSpinner /> <span className="ml-2">Loading Expense Items...</span>
//                     </div>
//                 )}

//                 {/* Error State */}
//                 {showErrorState && (
//                     <div className="flex-grow flex items-center justify-center text-destructive">
//                         Error loading expense items. Please try again later.
//                     </div>
//                 )}

//                 {/* Content State */}
//                 {showContent && (
//                     <div className={cn("grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden", isSaving && "opacity-50 pointer-events-none")}>

//                         {/* Left Panel: Order Info & Items */}
//                         <div className="flex flex-col md:col-span-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
//                             <OrderInfoCard
//                                 customerId={orderData.customerId}
//                                 customerName={orderData.customerName}
//                                 orderType={(orderData as any).orderType || "N/A"}
//                                 movement={orderData.movement}
//                                 packingType={orderData.packingType}
//                                 deliveryMethod={orderData.deliveryMethod}
//                                 orderMark={orderData.orderMark || undefined}
//                             />
//                             <h3 className="text-md font-semibold text-gray-700 mt-2 border-b pb-1">Order Items</h3>
//                             <OrderItemsTable items={orderData.items} isLoading={false} />
//                         </div>

//                         {/* Right Panel: Expenses Card */}
//                         <Card className="md:col-span-7 flex flex-col overflow-hidden shadow-md border">
//                             <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-blue-500 flex-shrink-0 bg-gray-50/50 px-4 py-3">
//                                 <CardTitle className="text-lg font-semibold">Order Expenses</CardTitle>
//                                 <Button
//                                     onClick={addExpense}
//                                     variant="outline"
//                                     size="sm"
//                                     className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
//                                     disabled={!canAddExpense || isSaving} // Disable if cannot add or currently saving
//                                 >
//                                     <Plus className="h-4 w-4" /> Add Expense
//                                 </Button>
//                             </CardHeader>

//                             <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
//                                 {/* Empty State */}
//                                 {!hasActiveExpenses && exitingExpenseIds.size === 0 ? (
//                                     <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
//                                         <p>No expenses added yet.</p>
//                                         <p className="text-sm">Click "Add Expense" to begin.</p>
//                                     </div>
//                                 ) : (
//                                     <>
//                                         {/* Header Row */}
//                                         <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-4 py-2 sticky top-0 bg-gray-100 z-10 border-b flex-shrink-0">
//                                             <div className="col-span-1">#</div>
//                                             <div className="col-span-4">CATEGORY</div>
//                                             <div className="col-span-2 text-center">QTY</div>
//                                             <div className="col-span-2 text-center">PRICE</div>
//                                             <div className="col-span-2 text-center">TOTAL</div>
//                                             <div className="col-span-1 text-center">ACT</div>
//                                         </div>

//                                         {/* Expense Rows List */}
//                                         <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar">
//                                             {expenses.map((expense, index) => {
//                                                 const isExiting = exitingExpenseIds.has(expense.clientId);
//                                                 // Calculate visual index only considering non-exiting items before this one
//                                                 const visualIndex = expenses.slice(0, index).filter(e => !exitingExpenseIds.has(e.clientId)).length + 1;
//                                                 return (
//                                                     <ExpenseItemRow
//                                                         key={expense.clientId} // Ensure key is stable and unique
//                                                         expense={expense}
//                                                         index={visualIndex}
//                                                         isExiting={isExiting}
//                                                         expenseItemsData={expenseItemsData}
//                                                         isPending={isSaving} // Pass saving state to disable row controls
//                                                         onUpdate={updateExpense}
//                                                         onRemove={removeExpense}
//                                                     />
//                                                 );
//                                             })}
//                                         </div>

//                                         {/* Shared Notes Area */}
//                                         <div className="px-4 pt-3 pb-1 mt-auto flex-shrink-0 border-t bg-gray-50/50">
//                                             <label htmlFor="expense-notes" className="block text-sm font-medium text-muted-foreground mb-1">Order Notes (Shared)</label>
//                                             <Textarea
//                                                 id="expense-notes"
//                                                 placeholder="Add general notes for the order..."
//                                                 rows={2}
//                                                 className="text-sm"
//                                                 value={expenseNotes ?? ""}
//                                                 onChange={(e) => setExpenseNotes(e.target.value)}
//                                                 disabled={isSaving} // Disable while saving
//                                             />
//                                         </div>
//                                     </>
//                                 )}
//                             </CardContent>

//                             {/* Footer with Totals (only if there are active expenses) */}
//                             {hasActiveExpenses && (
//                                 <CardFooter className="flex flex-col items-stretch border-t pt-3 pb-3 flex-shrink-0 bg-gray-50/50 px-4">
//                                     <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
//                                         <span>Number of expenses:</span>
//                                         <span>{expenses.filter(exp => !exitingExpenseIds.has(exp.clientId)).length}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center font-medium">
//                                         <span>Total Expense Cost:</span>
//                                         <span className="text-lg">${totalExpenseCost.toFixed(2)}</span>
//                                     </div>
//                                 </CardFooter>
//                             )}
//                         </Card>
//                     </div>
//                 )}

//                 {/* Dialog Actions */}
//                 <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50">
//                     <DialogClose asChild>
//                         <Button type="button" variant="outline" disabled={isSaving}>
//                             Cancel
//                         </Button>
//                     </DialogClose>
//                     <Button
//                         type="button"
//                         onClick={handleUpdate}
//                         className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
//                         // Disable if loading items, error loading items, or saving
//                         disabled={isLoading || hasLoadError || isSaving}
//                     >
//                         {isSaving ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
//                         {isSaving ? "Saving..." : "Update Expenses"}
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>

//             {/* Error Dialog Component */}
//             <ErrorDialogComponent />
//         </Dialog>
//     );
// }

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
import { OrderItemsTable } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderItemsTable";
import { useSelectedOrderData } from "@/stores/orders-store";
import { OrderInfoCard } from "./OrderInfoCard";
import { createOrderExpenseSchema, createOrderExpenseSchemaType, selectExpenseSchemaType } from "@/types/expense";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useCreateOrderExpense } from "@/hooks/data/useOrders";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useErrorDialog } from "@/hooks/useErrorDialog";
import { toast } from "sonner";

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

            {/* Category Select */}
            <div className="col-span-4">
                <Select
                    value={expense.expenseItemId}
                    onValueChange={(value) => onUpdate(expense.clientId, "expenseItemId", value)}
                    // Disable if exiting, saving, or marked for deletion (can't change category of item to be deleted)
                    disabled={isExiting || isPending || isMarkedForDeletion}
                >
                    <SelectTrigger className={cn("h-8 text-sm", isMarkedForDeletion && "border-dashed border-destructive/50")}>
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
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
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
                    ${total.toFixed(2)}
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
    const { data: expenseItemsData, isLoading: isExpenseItemsLoading, isError: isExpenseItemsError } = useQuery<selectExpenseSchemaType[]>({
        queryKey: [ "expenseItems" ],
        queryFn: async (): Promise<selectExpenseSchemaType[]> => {
            const demo: selectExpenseSchemaType[] = [
                            { expenseItemId: "1aa82b76-fbf0-42ea-b17a-395e87cbf2fb", expenseName: "Sack Small", expensePrice: 5, expenseCategory: "PACKING", notes: "Small sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
                            { expenseItemId: "35608ed0-5472-4fc5-ae7d-049d9d46453b", expenseName: "Sack Large", expensePrice: 5, expenseCategory: "PACKING", notes: "Large sacks", createdBy: "00000000-0000-0000-0000-000000000001", createdAt: new Date().toISOString() },
                            { expenseItemId: "c8a9f0b1-e2d3-4c5b-8a9f-0b1e2d3c4b5a", expenseName: "Loading", expensePrice: 10, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
                            { expenseItemId: "969f409b-c721-43a1-b0a3-40950b8434fe", expenseName: "Offloading", expensePrice: 15, expenseCategory: "LABOUR", createdBy: "00000000-0000-0000-0000-000000000002", createdAt: new Date().toISOString() },
            ];            await new Promise(resolve => setTimeout(resolve, 500));
            return demo;
        },
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
    });

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
    const showContent = isOpen && !isLoading && !hasLoadError;


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
            expenseItemId: defaultExpenseItem.expenseItemId,
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
        <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
                {/* Header */}
                <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                    <DialogTitle className="text-2xl">Order Expense #{orderData.orderId}</DialogTitle>
                </DialogHeader>

                {/* Saving Overlay */}
                {isSaving && (
                    <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center rounded-md">
                        <Card>
                            <CardHeader><CardTitle>Saving...</CardTitle></CardHeader>
                            <CardContent><LoadingSpinner /></CardContent>
                        </Card>
                    </div>
                )}

                {/* Loading State */}
                {showLoadingState && (
                    <div className="flex-grow flex items-center justify-center">
                        <LoadingSpinner /> <span className="ml-2">Loading Expense Items...</span>
                    </div>
                )}

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
                                <Button
                                    onClick={addExpense}
                                    variant="outline" size="sm"
                                    className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                                    disabled={!canAddExpense || isSaving}
                                >
                                    <Plus className="h-4 w-4" /> Add Expense
                                </Button>
                            </CardHeader>

                            <CardContent className="p-0 flex flex-col flex-grow overflow-hidden">
                                {/* Use hasActiveExpenses which checks for qty > 0 */}
                                {expenses.filter(e => e.expenseItemQuantity > 0 || !!e.orderExpenseId).length === 0 && exitingExpenseIds.size === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                                        <p>No expenses added yet.</p>
                                        <p className="text-sm">Click "Add Expense" to begin.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Header Row */}
                                        <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-4 py-2 sticky top-0 bg-gray-100 z-10 border-b flex-shrink-0">
                                            {/* ... header columns ... */}
                                            <div className="col-span-1">#</div>
                                            <div className="col-span-4">CATEGORY</div>
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
                                            <label htmlFor="expense-notes" className="block text-sm font-medium text-muted-foreground mb-1">Order Notes (Shared)</label>
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
                                )}
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
                                        <span className="text-lg">${totalExpenseCost.toFixed(2)}</span>
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
                        {isSaving ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSaving ? "Saving..." : "Update Expenses"}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Error Dialog Component */}
            <ErrorDialogComponent />
        </Dialog>
    );
}