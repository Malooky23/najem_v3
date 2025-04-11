// // "use client"

// // import { ReactNode, useState } from "react"
// // import { Plus, Trash2 } from "lucide-react"

// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// // import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
// // import { cn } from "@heroui/theme"
// // import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
// // import { useIsMobileTEST } from "@/hooks/use-media-query"
// // import { OrderDetailsContainer } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderDetailsContainer"
// // import { OrderItemsTable } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderItemsTable"
// // import { useSelectedOrderData } from "@/stores/orders-store"
// // import { Label } from "recharts"
// // import { Textarea } from "../ui/textarea"
// // import { OrderInfoCard } from "./OrderInfoCard"

// // const PRESET_PRICES = {
// //     "Sack Small": 5,
// //     "Sack Large": 5,
// //     Loading: 10,
// //     Offloading: 15,
// // }

// // type ExpenseCategory = keyof typeof PRESET_PRICES

// // interface Expense {
// //     id: number
// //     category: ExpenseCategory
// //     quantity: number
// //     price: number
// //     total: number
// // }

// // interface OrderExpenseDialogProps {
// //     open: boolean
// //     orderId: number
// //     initialOrderData?: {
// //         customer: string
// //         movementType: "IN" | "OUT"
// //         status: string
// //         mark: string
// //         packingType: string
// //         deliveryMethod: string
// //         notes: string
// //         items: Array<{
// //             id: number
// //             name: string
// //             quantity: number
// //         }>
// //     }
// //     initialExpenses?: Expense[]
// //     initialExpenseNotes?: string
// //     onOpenChange: (open: boolean) => void
// //     onUpdate: (orderData: any, expenses: Expense[], notes: string) => void
// //     children: ReactNode
// // }

// // export function OrderExpenseDialog({
// //     orderId = 36,
// //     initialOrderData = {
// //         customer: "CargoMan",
// //         movementType: "IN",
// //         status: "COMPLETED",
// //         mark: "",
// //         packingType: "None",
// //         deliveryMethod: "None",
// //         notes: "",
// //         items: [ { id: 1, name: "iPhone 6s", quantity: 1 } ],
// //     },
// //     initialExpenses = [],
// //     initialExpenseNotes = "",
// //     onOpenChange = () => { },
// //     onUpdate = () => { },
// //     children
// // }: OrderExpenseDialogProps) {
// //     const [ expenses, setExpenses ] = useState<Expense[]>(initialExpenses)
// //     const [ nextExpenseId, setNextExpenseId ] = useState(1)
// //     const isMobile = useIsMobileTEST()
// //     const [ orderData1 ] = useState(initialOrderData)

// //     const [ expenseNotes, setExpenseNotes ] = useState(initialExpenseNotes)


// //     const addExpense = () => {
// //         const newExpense = {
// //             id: nextExpenseId,
// //             category: "Sack Small" as ExpenseCategory,
// //             quantity: 1,
// //             price: PRESET_PRICES[ "Sack Small" ],
// //             total: PRESET_PRICES[ "Sack Small" ], // Initial total is just the price * 1
// //         }
// //         setExpenses([ ...expenses, newExpense ])
// //         setNextExpenseId(nextExpenseId + 1)
// //     }

// //     const updateExpense = (id: number, field: keyof Expense, value: any) => {
// //         setExpenses(
// //             expenses.map((expense) => {
// //                 if (expense.id !== id) return expense

// //                 const updatedExpense = { ...expense, [ field ]: value }

// //                 // If category changed, update the price to the preset
// //                 if (field === "category") {
// //                     updatedExpense.price = PRESET_PRICES[ value as ExpenseCategory ]
// //                 }

// //                 // Recalculate total whenever quantity or price changes
// //                 if (field === "quantity" || field === "price" || field === "category") {
// //                     updatedExpense.total = updatedExpense.quantity * updatedExpense.price
// //                 }

// //                 return updatedExpense
// //             }),
// //         )
// //     }

// //     const removeExpense = (id: number) => {
// //         setExpenses(expenses.filter((expense) => expense.id !== id))
// //     }

// //     const totalExpenseCost = expenses.reduce((sum, expense) => sum + expense.total, 0)

// //     const handleUpdate = () => {
// //         onUpdate(orderData, expenses, expenseNotes)
// //         // onOpenChange(false)
// //     }

// //     const orderData = useSelectedOrderData();
// //     if (!orderData) {
// //         return <div><p>no details</p></div>
// //     }

// //     return (
// //         <Dialog modal>
// //             <DialogTrigger asChild>
// //                 {children}
// //             </DialogTrigger>
// //             <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
// //                 <DialogHeader className="p-6 pb-2 flex-shrink-0">
// //                     <DialogTitle className="text-2xl">Order Expense #{orderId}</DialogTitle>
// //                 </DialogHeader>

// //                 <div className="grid grid-cols-2 md:grid-cols-10 gap-6 p-6 pt-2 flex-grow overflow-hidden">

// //                     <div className="flex-column w-full md:col-span-3">
// //                         <OrderInfoCard
// //                             customerId={orderData.customerId}
// //                             customerName={orderData.customerName}
// //                             orderType={"IMPORT"}
// //                             movement={orderData.movement}
// //                             packingType={orderData.packingType}
// //                             deliveryMethod={orderData.deliveryMethod}
// //                             orderMark={orderData.orderMark ? orderData.orderMark : undefined}
// //                         />
// //                         <OrderItemsTable items={orderData.items} />
// //                     </div>
// //                     <Card className="md:col-span-7 flex flex-col overflow-hidden">
// //                         <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-green-500 flex-shrink-0">
// //                             <CardTitle className="text-lg">Order Expenses</CardTitle>
// //                             <Button onClick={addExpense} variant="outline" size="sm" className="flex items-center gap-1">
// //                                 <Plus className="h-4 w-4" /> Add Expense
// //                             </Button>
// //                         </CardHeader>
// //                         <CardContent className="p-3 flex flex-col flex-grow overflow-hidden">
// //                             {expenses.length === 0 ? (
// //                                 <div className="text-center py-8 text-muted-foreground">
// //                                     No expenses added yet. Click "Add Expense" to begin.
// //                                 </div>
// //                             ) : (
// //                                 <>
// //                                     <div className="flex-grow overflow-y-auto space-y-4 pr-2">
// //                                         <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-1 sticky top-0 bg-background z-10 py-1">
// //                                             <div className="col-span-1">#</div>
// //                                             <div className="col-span-4">CATEGORY</div>
// //                                             <div className="col-span-2">QTY</div>
// //                                             <div className="col-span-2">PRICE</div>
// //                                             <div className="col-span-2">TOTAL</div>
// //                                             <div className="col-span-1"></div>
// //                                         </div>

// //                                         {expenses.map((expense, index) => (
// //                                             <div key={expense.id} className="grid grid-cols-12 gap-2 items-center ">
// //                                                 <div className="col-span-1 text-sm text-muted-foreground">{index+1}</div>
// //                                                 <div className="col-span-4">
// //                                                     <Select
// //                                                         value={expense.category}
// //                                                         onValueChange={(value) => updateExpense(expense.id, "category", value)}
// //                                                     >
// //                                                         <SelectTrigger className="h-8 text-sm">
// //                                                             <SelectValue placeholder="Select category" />
// //                                                         </SelectTrigger>
// //                                                         <SelectContent>
// //                                                             {Object.keys(PRESET_PRICES).map((category) => (
// //                                                                 <SelectItem key={category} value={category}>
// //                                                                     {category}
// //                                                                 </SelectItem>
// //                                                             ))}
// //                                                         </SelectContent>
// //                                                     </Select>
// //                                                 </div>
// //                                                 <div className="col-span-2">
// //                                                     <Input
// //                                                         type="number"
// //                                                         min="1"
// //                                                         className="h-8 text-sm"
// //                                                         value={expense.quantity}
// //                                                         onChange={(e) => updateExpense(expense.id, "quantity", Number.parseInt(e.target.value) || 1)}
// //                                                     />
// //                                                 </div>
// //                                                 <div className="col-span-2">
// //                                                     <div className="relative">
// //                                                         <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">$</span>
// //                                                         <Input
// //                                                             type="number"
// //                                                             min="0"
// //                                                             step="0.01"
// //                                                             className="pl-5 h-8 text-sm"
// //                                                             value={expense.price}
// //                                                             onChange={(e) => updateExpense(expense.id, "price", Number.parseFloat(e.target.value) || 0)}
// //                                                         />
// //                                                     </div>
// //                                                 </div>
// //                                                 <div className="col-span-2">
// //                                                     <div className="bg-muted px-2 py-1 rounded-md text-sm h-8 flex items-center">
// //                                                         ${expense.total.toFixed(2)}
// //                                                     </div>
// //                                                 </div>
// //                                                 <div className="col-span-1 flex justify-center">
// //                                                     <Button
// //                                                         variant="ghost"
// //                                                         size="icon"
// //                                                         className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
// //                                                         onClick={() => removeExpense(expense.id)}
// //                                                     >
// //                                                         <Trash2 className="h-4 w-4" />
// //                                                     </Button>
// //                                                 </div>
// //                                             </div>
// //                                         ))}
// //                                     </div>
// //                                     <div className="pt-4 flex-shrink-0">
// //                                         <Label>Notes</Label>
// //                                         <Textarea
// //                                             id="expense-notes"
// //                                             placeholder="Add notes about these expenses..."
// //                                             className="mt-2"
// //                                             value={expenseNotes}
// //                                             onChange={(e) => setExpenseNotes(e.target.value)}
// //                                         />
// //                                     </div>
// //                                 </>
// //                             )}
// //                         </CardContent>
// //                         <CardFooter className="flex flex-col items-stretch border-t pt-4 flex-shrink-0">
// //                             <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
// //                                 <span>Number of expenses:</span>
// //                                 <span>{expenses.length}</span>
// //                             </div>
// //                             <div className="flex justify-between items-center font-medium">
// //                                 <span>Total Expense Cost:</span>
// //                                 <span className="text-lg">${totalExpenseCost.toFixed(2)}</span>
// //                             </div>
// //                         </CardFooter>
// //                     </Card>
// //                 </div>

// //                 <DialogFooter className="p-4">
// //                     {/* <Button type="submit" onClick={handleUpdate}>Save changes</Button> */}
// //                     <div className="flex gap-3">
// //                         <DialogClose asChild>
// //                             <Button type="button" variant="secondary" className="hover:bg-slate-300">
// //                                 Cancel
// //                             </Button>
// //                         </DialogClose>
// //                         <Button
// //                             type="submit"
// //                             // Disable logic: Use formState.isSubmitting. Keep business logic (require items).
// //                             // Add !form.formState.isValid if you only want submission when the form is valid according to schema

// //                             className="px-6 bg-blue-600 hover:bg-blue-800"
// //                         >
// //                             Submit
// //                         </Button>
// //                     </div>
// //                 </DialogFooter>
// //             </DialogContent>
// //         </Dialog >
// //     )
// // }


// "use client"

// import { ReactNode, useState, useRef, useCallback } from "react"
// import { Plus, Trash2 } from "lucide-react"
// import { AnimatePresence, motion } from "framer-motion"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
// import { cn } from "@heroui/theme"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
// import { useIsMobileTEST } from "@/hooks/use-media-query"
// import { OrderDetailsContainer } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderDetailsContainer"
// import { OrderItemsTable } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderItemsTable"
// import { useSelectedOrderData } from "@/stores/orders-store"
// import { Label } from "recharts"
// import { Textarea } from "../ui/textarea"
// import { OrderInfoCard } from "./OrderInfoCard"

// const PRESET_PRICES = {
//     "Sack Small": 5,
//     "Sack Large": 5,
//     Loading: 10,
//     Offloading: 15,
// }

// type ExpenseCategory = keyof typeof PRESET_PRICES

// interface Expense {
//     id: number
//     category: ExpenseCategory
//     quantity: number
//     price: number
//     total: number
//     isDeleting?: boolean // Add a flag to indicate deletion state
// }

// interface OrderExpenseDialogProps {
//     open: boolean
//     orderId: number
//     initialOrderData?: {
//         customer: string
//         movementType: "IN" | "OUT"
//         status: string
//         mark: string
//         packingType: string
//         deliveryMethod: string
//         notes: string
//         items: Array<{
//             id: number
//             name: string
//             quantity: number
//         }>
//     }
//     initialExpenses?: Expense[]
//     initialExpenseNotes?: string
//     onOpenChange: (open: boolean) => void
//     onUpdate: (orderData: any, expenses: Expense[], notes: string) => void
//     children: ReactNode
// }

// export function OrderExpenseDialog({
//     orderId = 36,
//     initialOrderData = {
//         customer: "CargoMan",
//         movementType: "IN",
//         status: "COMPLETED",
//         mark: "",
//         packingType: "None",
//         deliveryMethod: "None",
//         notes: "",
//         items: [ { id: 1, name: "iPhone 6s", quantity: 1 }],
//     },
//     initialExpenses = [],
//     initialExpenseNotes = "",
//     onOpenChange = () => { },
//     onUpdate = () => { },
//     children
// }: OrderExpenseDialogProps) {
//     const [ expenses, setExpenses ] = useState<Expense[]>(initialExpenses)
//     const [ nextExpenseId, setNextExpenseId ] = useState(1)
//     const isMobile = useIsMobileTEST()
//     const [ orderData1 ] = useState(initialOrderData)
//     const [ expenseNotes, setExpenseNotes ] = useState(initialExpenseNotes)

//     const addExpense = () => {
//         const newExpense = {
//             id: nextExpenseId,
//             category: "Sack Small" as ExpenseCategory,
//             quantity: 1,
//             price: PRESET_PRICES[ "Sack Small" ],
//             total: PRESET_PRICES[ "Sack Small" ], // Initial total is just the price * 1
//         }
//         setExpenses([ ...expenses, newExpense ])
//         setNextExpenseId(nextExpenseId + 1)
//     }

//     const updateExpense = (id: number, field: keyof Expense, value: any) => {
//         setExpenses(
//             expenses.map((expense) => {
//                 if (expense.id !== id) return expense

//                 const updatedExpense = { ...expense, [ field ]: value }

//                 // If category changed, update the price to the preset
//                 if (field === "category") {
//                     updatedExpense.price = PRESET_PRICES[ value as ExpenseCategory ]
//                 }

//                 // Recalculate total whenever quantity or price changes
//                 if (field === "quantity" || field === "price" || field === "category") {
//                     updatedExpense.total = updatedExpense.quantity * updatedExpense.price
//                 }

//                 return updatedExpense
//             }),
//         )
//     }

//     const removeExpense = useCallback((id: number) => {
//         setExpenses(currentExpenses =>
//             currentExpenses.map(expense =>
//                 expense.id === id ? { ...expense, isDeleting: true } : expense
//             )
//         );

//         setTimeout(() => {
//             setExpenses(currentExpenses =>
//                 currentExpenses.filter(expense => expense.id !== id)
//             );
//         }, 200); // Duration should match the animation duration
//     }, []);


//     const totalExpenseCost = expenses.reduce((sum, expense) => sum + expense.total, 0)

//     const handleUpdate = () => {
//         onUpdate(orderData, expenses, expenseNotes)
//         // onOpenChange(false)
//     }

//     const orderData = useSelectedOrderData();
//     if (!orderData) {
//         return <div><p>no details</p></div>
//     }

//     return (
//         <Dialog modal>
//             <DialogTrigger asChild>
//                 {children}
//             </DialogTrigger>
//             <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
//                 <DialogHeader className="p-6 pb-2 flex-shrink-0">
//                     <DialogTitle className="text-2xl">Order Expense #{orderId}</DialogTitle>
//                 </DialogHeader>

//                 <div className="grid grid-cols-2 md:grid-cols-10 gap-6 p-6 pt-2 flex-grow overflow-hidden">

//                     <div className="flex-column w-full md:col-span-3">
//                         <OrderInfoCard
//                             customerId={orderData.customerId}
//                             customerName={orderData.customerName}
//                             orderType={"IMPORT"}
//                             movement={orderData.movement}
//                             packingType={orderData.packingType}
//                             deliveryMethod={orderData.deliveryMethod}
//                             orderMark={orderData.orderMark ? orderData.orderMark : undefined}
//                         />
//                         <OrderItemsTable items={orderData.items} />
//                     </div>
//                     <Card className="md:col-span-7 flex flex-col overflow-hidden">
//                         <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-green-500 flex-shrink-0">
//                             <CardTitle className="text-lg">Order Expenses</CardTitle>
//                             <Button onClick={addExpense} variant="outline" size="sm" className="flex items-center gap-1">
//                                 <Plus className="h-4 w-4" /> Add Expense
//                             </Button>
//                         </CardHeader>
//                         <CardContent className="p-3 flex flex-col flex-grow overflow-hidden">
//                             {expenses.length === 0 ? (
//                                 <div className="text-center py-8 text-muted-foreground">
//                                     No expenses added yet. Click "Add Expense" to begin.
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="flex-grow overflow-y-auto space-y-4 pr-2">
//                                         <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-1 sticky top-0 bg-background z-10 py-1">
//                                             <div className="col-span-1">#</div>
//                                             <div className="col-span-4">CATEGORY</div>
//                                             <div className="col-span-2">QTY</div>
//                                             <div className="col-span-2">PRICE</div>
//                                             <div className="col-span-2">TOTAL</div>
//                                             <div className="col-span-1"></div>
//                                         </div>

//                                         <AnimatePresence>
//                                             {expenses.map((expense, index) => (
//                                                 <motion.div
//                                                     key={expense.id}
//                                                     className="grid grid-cols-12 gap-2 items-center"
//                                                     initial={{ opacity: 0, y: -10 }}
//                                                     animate={{ opacity: 1, y: 0 }}
//                                                     exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
//                                                     transition={{ duration: 0.2 }}
//                                                 >
//                                                     <div className="col-span-1 text-sm text-muted-foreground">{index + 1}</div>
//                                                     <div className="col-span-4">
//                                                         <Select
//                                                             value={expense.category}
//                                                             onValueChange={(value) => updateExpense(expense.id, "category", value)}
//                                                         >
//                                                             <SelectTrigger className="h-8 text-sm">
//                                                                 <SelectValue placeholder="Select category" />
//                                                             </SelectTrigger>
//                                                             <SelectContent>
//                                                                 {Object.keys(PRESET_PRICES).map((category) => (
//                                                                     <SelectItem key={category} value={category}>
//                                                                         {category}
//                                                                     </SelectItem>
//                                                                 ))}
//                                                             </SelectContent>
//                                                         </Select>
//                                                     </div>
//                                                     <div className="col-span-2">
//                                                         <Input
//                                                             type="number"
//                                                             min="1"
//                                                             className="h-8 text-sm"
//                                                             value={expense.quantity}
//                                                             onChange={(e) => updateExpense(expense.id, "quantity", Number.parseInt(e.target.value) || 1)}
//                                                         />
//                                                     </div>
//                                                     <div className="col-span-2">
//                                                         <div className="relative">
//                                                             <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">$</span>
//                                                             <Input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 step="0.01"
//                                                                 className="pl-5 h-8 text-sm"
//                                                                 value={expense.price}
//                                                                 onChange={(e) => updateExpense(expense.id, "price", Number.parseFloat(e.target.value) || 0)}
//                                                             />
//                                                         </div>
//                                                     </div>
//                                                     <div className="col-span-2">
//                                                         <div className="bg-muted px-2 py-1 rounded-md text-sm h-8 flex items-center">
//                                                             ${expense.total.toFixed(2)}
//                                                         </div>
//                                                     </div>
//                                                     <div className="col-span-1 flex justify-center overflow-hidden">
//                                                         <Button
//                                                             variant="ghost"
//                                                             size="icon"
//                                                             className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-opacity duration-200"
//                                                             onClick={() => removeExpense(expense.id)}
//                                                             disabled={expense.isDeleting}
//                                                             style={{ opacity: expense.isDeleting ? 0.6 : 1 }}
//                                                         >
//                                                             <Trash2 className="h-4 w-4" />
//                                                         </Button>
//                                                     </div>
//                                                 </motion.div>
//                                             ))}
//                                         </AnimatePresence>
//                                     </div>
//                                     <div className="pt-4 flex-shrink-0">
//                                         <Label>Notes</Label>
//                                         <Textarea
//                                             id="expense-notes"
//                                             placeholder="Add notes about these expenses..."
//                                             className="mt-2"
//                                             value={expenseNotes}
//                                             onChange={(e) => setExpenseNotes(e.target.value)}
//                                         />
//                                     </div>
//                                 </>
//                             )}
//                         </CardContent>
//                         <CardFooter className="flex flex-col items-stretch border-t pt-4 flex-shrink-0">
//                             <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
//                                 <span>Number of expenses:</span>
//                                 <span>{expenses.length}</span>
//                             </div>
//                             <div className="flex justify-between items-center font-medium">
//                                 <span>Total Expense Cost:</span>
//                                 <span className="text-lg">${totalExpenseCost.toFixed(2)}</span>
//                             </div>
//                         </CardFooter>
//                     </Card>
//                 </div>

//                 <DialogFooter className="p-4">
//                     {/* <Button type="submit" onClick={handleUpdate}>Save changes</Button> */}
//                     <div className="flex gap-3">
//                         <DialogClose asChild>
//                             <Button type="button" variant="secondary" className="hover:bg-slate-300">
//                                 Cancel
//                             </Button>
//                         </DialogClose>
//                         <Button
//                             type="submit"
//                             // Disable logic: Use formState.isSubmitting. Keep business logic (require items).
//                             // Add !form.formState.isValid if you only want submission when the form is valid according to schema

//                             className="px-6 bg-blue-600 hover:bg-blue-800"
//                         >
//                             Submit
//                         </Button>
//                     </div>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog >
//     )
// }


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
    DialogDescription, // Keep if needed, but wasn't used in final layout
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"; // Adjusted path assuming it's relative to components/ui
import { cn } from "@/lib/utils"; // Assuming standard shadcn/ui path
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Adjusted path
import { useIsMobileTEST } from "@/hooks/use-media-query"; // Assuming hook path
import { OrderItemsTable } from "@/app/(pages)/(protected)/warehouse/orders/components/order-details/OrderItemsTable"; // Adjust path as needed
import { useSelectedOrderData } from "@/stores/orders-store"; // Assuming store path
import { Textarea } from "@/components/ui/textarea"; // Adjusted path
import { OrderInfoCard } from "./OrderInfoCard"; // Assuming component path - Adjust if needed

// --- Constants ---
const PRESET_PRICES = {
    "Sack Small": 5,
    "Sack Large": 5, // Assuming same price, adjust if needed
    Loading: 10,
    Offloading: 15,
};

// --- Types ---
type ExpenseCategory = keyof typeof PRESET_PRICES;

export interface Expense {
    id: number; // Using number based on nextExpenseId logic
    expenseName: ExpenseCategory;
    quantity: number;
    price: number;
}

interface OrderExpenseDialogProps {
    orderId: number; // Expect orderId to be passed
    // Removed initialOrderData - data should come from useSelectedOrderData primarily
    initialExpenses?: Expense[];
    initialExpenseNotes?: string;
    onUpdate: (expenses: Expense[], notes: string) => void; // Simplified onUpdate signature
    // onUpdate: (sumbitValues:any) => void;
    children: ReactNode; // For the DialogTrigger
    // Optional: Add onOpenChange if external control is truly needed
    // onOpenChange?: (open: boolean) => void;
}

// --- CSS Transition Duration (milliseconds) ---
// Make sure this value matches the duration defined in your CSS!
const EXIT_ANIMATION_DURATION = 300;

// --- Component ---
export function OrderExpenseDialog({
    orderId, // Required prop
    initialExpenses = [],
    initialExpenseNotes = "",
    onUpdate,
    children,
}: OrderExpenseDialogProps) {

    // --- State ---
    const [ expenses, setExpenses ] = useState<Expense[]>(initialExpenses);
    const [ expenseNotes, setExpenseNotes ] = useState(initialExpenseNotes);
    const [ exitingExpenseIds, setExitingExpenseIds ] = useState<Set<number>>(new Set());
    const [ nextExpenseId, setNextExpenseId ] = useState(() => {
        // Calculate starting ID based on initial expenses
        return initialExpenses.length > 0
            ? Math.max(0, ...initialExpenses.map(e => e.id)) + 1 // Ensure IDs are numeric
            : 1;
    });

    // --- Refs ---
    const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

    // --- Hooks ---
    const isMobile = useIsMobileTEST();
    const orderData = useSelectedOrderData(); // Fetch data using Zustand store hook

    // --- Effects ---
    // Cleanup timeouts on component unmount
    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach(timeoutId => clearTimeout(timeoutId));
            timeouts.clear(); // Clear the map as well
        };
    }, []);

    // --- Event Handlers ---
    const addExpense = () => {
        const newExpense: Expense = {
            id: nextExpenseId,
            expenseName: "Sack Small", // Default category
            quantity: 1,
            price: PRESET_PRICES[ "Sack Small" ],
            // total: PRESET_PRICES[ "Sack Small" ],
        };
        setExpenses(prevExpenses => [ ...prevExpenses, newExpense ]);
        setNextExpenseId(prevId => prevId + 1);
    };

    const updateExpense = (id: number, field: keyof Expense, value: any) => {
        setExpenses(prevExpenses =>
            prevExpenses.map((expense) => {
                if (expense.id !== id) return expense;

                const updatedExpense = { ...expense, [ field ]: value };

                // Update price if category changes
                if (field === "expenseName") {
                    const categoryValue = value as ExpenseCategory;
                    updatedExpense.price = PRESET_PRICES[ categoryValue ] ?? 0;
                }

                // Recalculate total (ensure numeric values)
                // if (field === "quantity" || field === "price" || field === "expenseName") {
                //     const quantity = Number(updatedExpense.quantity) || 0;
                //     const price = Number(updatedExpense.price) || 0;
                //     updatedExpense.total = quantity * price;
                // }

                return updatedExpense;
            })
        );
    };

    const removeExpense = (id: number) => {
        // Prevent double-clicks or removing already exiting items
        if (exitingExpenseIds.has(id) || !timeoutsRef.current) return;

        // 1. Mark for deletion (triggers animation via CSS class)
        setExitingExpenseIds(prev => new Set(prev).add(id));

        // 2. Set timeout to remove from state after animation
        const timeoutId = setTimeout(() => {
            setExpenses(prev => prev.filter(exp => exp.id !== id));
            // Clean up exiting state and timeout ref
            setExitingExpenseIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            timeoutsRef.current.delete(id);
        }, EXIT_ANIMATION_DURATION);

        // Store timeout ID for potential cleanup
        timeoutsRef.current.set(id, timeoutId);
    };

    const handleUpdate = () => {

        const finalExpenses = expenses.filter(exp => !exitingExpenseIds.has(exp.id));
        // console.log("Final Expense: ", JSON.stringify(finalExpenses, null, 2))
        // console.log( "Expense Notes: ", JSON.stringify(expenseNotes, null, 2))

        const sumbitValues = {
            ...finalExpenses,
            expenseNotes
        }
        console.log(orderData)
    };

    // --- Calculations ---
    const totalExpenseCost = expenses
        .filter(exp => !exitingExpenseIds.has(exp.id)) // Calculate total based on non-exiting items
        .reduce((sum, expense) => sum + expense.price*expense.quantity, 0);

    // --- Render Logic ---
    // Handle loading state or if order data isn't available
    if (!orderData) {
        return (
            <Dialog>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Loading...</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center">Loading order details...</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog modal>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b"> {/* Added border */}
                    <DialogTitle className="text-2xl">Order Expense #{orderData.orderId}</DialogTitle>
                </DialogHeader>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-10 gap-6 p-6 pt-4 flex-grow overflow-hidden">

                    {/* Left Column: Order Info */}
                    <div className="flex flex-col md:col-span-3 gap-4 overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom scrollbar class if needed */}
                        <OrderInfoCard
                            customerId={orderData.customerId}
                            customerName={orderData.customerName}
                            // This might need adjustment based on actual orderData structure
                            orderType={(orderData as any).orderType || "N/A"}
                            movement={orderData.movement}
                            packingType={orderData.packingType}
                            deliveryMethod={orderData.deliveryMethod}
                            orderMark={orderData.orderMark || undefined}
                        />
                        <h3 className="text-md font-semibold text-gray-700 mt-2 border-b pb-1">Order Items</h3>
                        <OrderItemsTable items={orderData.items} />
                    </div>

                    {/* Right Column: Expenses */}
                    <Card className="md:col-span-7 flex flex-col overflow-hidden shadow-md border">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between border-l-4 border-blue-500 flex-shrink-0 bg-gray-50/50 px-4 py-3"> {/* Adjusted styling */}
                            <CardTitle className="text-lg font-semibold">Order Expenses</CardTitle>
                            <Button onClick={addExpense} variant="outline" size="sm" className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"> {/* Adjusted styling */}
                                <Plus className="h-4 w-4" /> Add Expense
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0 flex flex-col flex-grow overflow-hidden"> {/* Removed padding */}
                            {/* Check if there are expenses *or* exiting expenses to display */}
                            {expenses.length === 0 && exitingExpenseIds.size === 0 ? (
                                <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                                    <p>No expenses added yet.</p>
                                    <p className="text-sm">Click "Add Expense" to begin.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Sticky Header for Expense List */}
                                    <div className="grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground px-4 py-2 sticky top-0 bg-gray-100 z-10 border-b flex-shrink-0"> {/* Adjusted padding/bg */}
                                        <div className="col-span-1">#</div>
                                        <div className="col-span-4">CATEGORY</div>
                                        <div className="col-span-2 text-center">QTY</div>
                                        <div className="col-span-2 text-center">PRICE</div>
                                        <div className="col-span-2 text-center">TOTAL</div>
                                        <div className="col-span-1 text-center">ACT</div> {/* Actions */}
                                    </div>

                                    {/* Animated Expense List */}
                                    <div className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar"> {/* Added padding */}
                                        {/* Render based on the main expenses state */}
                                        {expenses.map((expense, index) => {
                                            const isExiting = exitingExpenseIds.has(expense.id);
                                            // Calculate visual index based on non-exiting items before this one
                                            const visualIndex = expenses.filter((e, i) => i < index && !exitingExpenseIds.has(e.id)).length + 1;

                                            return (
                                                <div
                                                    key={expense.id}
                                                    className={cn(
                                                        "grid grid-cols-12 gap-x-2 gap-y-1 items-center py-1", // Fine-tuned gaps/padding
                                                        "expense-row", // Base class for transition
                                                        isExiting && "expense-row-exiting" // Exit animation class
                                                    )}
                                                    aria-hidden={isExiting}
                                                >
                                                    {/* Index Number */}
                                                    <div className="col-span-1 text-sm text-muted-foreground pl-1 font-medium">
                                                        {visualIndex}
                                                    </div>

                                                    {/* Category Select */}
                                                    <div className="col-span-4">
                                                        <Select
                                                            value={expense.expenseName}
                                                            onValueChange={(value) => updateExpense(expense.id, "expenseName", value)}
                                                            disabled={isExiting} // Disable inputs during exit
                                                        >
                                                            <SelectTrigger className="h-8 text-sm">
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.keys(PRESET_PRICES).map((category) => (
                                                                    <SelectItem key={category} value={category}>
                                                                        {category}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Quantity Input */}
                                                    <div className="col-span-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="h-8 text-sm text-center"
                                                            value={expense.quantity}
                                                            onChange={(e) => updateExpense(expense.id, "quantity", Number.parseInt(e.target.value) || 1)}
                                                            disabled={isExiting}
                                                        />
                                                    </div>

                                                    {/* Price Input */}
                                                    <div className="col-span-2">
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="pl-4 pr-1 h-8 text-sm text-center"
                                                                value={expense.price}
                                                                onChange={(e) => updateExpense(expense.id, "price", Number.parseFloat(e.target.value) || 0)}
                                                                disabled={isExiting}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Total Display */}
                                                    <div className="col-span-2">
                                                        <div className={cn(
                                                            "bg-muted/80 px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center font-medium",
                                                            isExiting && "opacity-50" // Dim total during exit
                                                        )}>
                                                            ${(expense.quantity * expense.price)}
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <div className="col-span-1 flex justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 disabled:opacity-30" // Dim when disabled
                                                            onClick={() => removeExpense(expense.id)}
                                                            disabled={isExiting} // Disable button during exit
                                                            aria-label="Remove expense"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Notes Section */}
                                    <div className="px-4 pt-3 pb-1 mt-auto flex-shrink-0 border-t bg-gray-50/50"> {/* Adjusted padding/bg */}
                                        <label htmlFor="expense-notes" className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                                        <Textarea
                                            id="expense-notes"
                                            placeholder="Add notes about these expenses..."
                                            rows={2}
                                            className="text-sm" // Ensure consistent text size
                                            value={expenseNotes}
                                            onChange={(e) => setExpenseNotes(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>

                        {/* Footer with Totals (only if non-exiting expenses exist) */}
                        {expenses.some(exp => !exitingExpenseIds.has(exp.id)) && (
                            <CardFooter className="flex flex-col items-stretch border-t pt-3 pb-3 flex-shrink-0 bg-gray-50/50 px-4"> {/* Adjusted styling */}
                                <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                                    <span>Number of expenses:</span>
                                    {/* Count only non-exiting expenses */}
                                    <span>{expenses.filter(exp => !exitingExpenseIds.has(exp.id)).length}</span>
                                </div>
                                <div className="flex justify-between items-center font-medium">
                                    <span>Total Expense Cost:</span>
                                    <span className="text-lg">${totalExpenseCost.toFixed(2)}</span>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                {/* Dialog Footer */}
                <DialogFooter className="p-4 border-t flex-shrink-0 bg-gray-50/50"> {/* Adjusted styling */}
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white" // Ensure text color
                    >
                        Update Expenses
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

