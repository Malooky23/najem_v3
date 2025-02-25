// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Package, Truck, Calendar, User, Box, ArrowUpRight, Printer, ChevronDown, Edit, Save, X } from "lucide-react"
// import { OrderStatus, MovementType, DeliveryMethod, OrderType, PackingType, type EnrichedOrders, orderStatus, movementType, deliveryMethod, orderType, packingType } from "@/types/orders"
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { toast } from "@/hooks/use-toast"
// import { cn } from "@/lib/utils"
// import { updateOrderSchema } from "@/types/orders"

// const SaveButton = ({ onClick, showLabel = false }: { onClick: () => Promise<void>, showLabel?: boolean }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [hasError, setHasError] = useState(false);

//   const handleClick = async () => {
//     setIsLoading(true);
//     setHasError(false);
//     try {
//       await onClick();
//     } catch (error) {
//       setHasError(true);
//       // Add shake animation on error
//       setTimeout(() => setHasError(false), 1000);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Button
//       size="sm"
//       className={cn(
//         "gap-2 transition-all duration-200 relative",
//         isLoading && "text-transparent",
//         hasError ? "bg-red-500 hover:bg-red-600 animate-shake" : "bg-green-500 hover:bg-green-600",
//       )}
//       onClick={handleClick}
//       disabled={isLoading}
//     >
//       <Save className={cn("w-4 h-4", isLoading && "invisible")} />
//       {showLabel && <span className={isLoading ? "invisible" : ""}>Save</span>}
//       {isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}
//     </Button>
//   );
// };

// const statusColors: Record<OrderStatus, string> = {
//   DRAFT: "bg-gray-500",
//   PENDING: "bg-yellow-500",
//   PROCESSING: "bg-blue-500",
//   READY: "bg-purple-500",
//   COMPLETED: "bg-green-500",
//   CANCELLED: "bg-red-500",
// }

// type Status = OrderStatus
// const StatusDropdown = ({
//   currentStatus,
//   onStatusChange,
//   isEditing,
// }: { currentStatus: Status; onStatusChange: (status: Status) => void; isEditing: boolean }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [pendingStatus, setPendingStatus] = useState<Status | null>(null)
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const handleStatusSelect = (status: Status) => {
//     if (isEditing) {
//       onStatusChange(status);
//       return;
//     }

//     if (status !== currentStatus) {
//       setPendingStatus(status);
//       setShowConfirmDialog(true);
//     }
//     setIsOpen(false);
//   };

//   const handleConfirm = async () => {
//     if (!pendingStatus) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       await onStatusChange(pendingStatus);
      
//       // Only close and reset on success
//       toast({
//         title: "Status updated successfully",
//         description: `New Status: ${pendingStatus}`,
//         variant: "default",
//       });
//       setPendingStatus(null);
//       setShowConfirmDialog(false);
//       setError(null);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
//       setError(errorMessage);
//       toast({
//         title: "Failed to update status",
//         description: errorMessage,
//         variant: "destructive",
//       });
//       // Keep dialog open and maintain pendingStatus on error
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isEditing) {
//     return (
//       <Select onValueChange={(value) => handleStatusSelect(value as Status)} defaultValue={currentStatus}>
//         <SelectTrigger className="w-[180px]">
//           <SelectValue placeholder="Select status" />
//         </SelectTrigger>
//         <SelectContent>
//           {orderStatus.options.map((status) => (
//             <SelectItem key={status} value={status}>
//               {status}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     )
//   }

//   return (
//     <>
//       <div className="relative">
//         <Badge
//           variant="secondary"
//           className={cn(
//             "h-7 px-3 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md text-white",
//             statusColors[currentStatus],
//             isLoading && "opacity-50 cursor-not-allowed"
//           )}
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {currentStatus}
//           <ChevronDown className="w-4 h-4 ml-1" />
//         </Badge>
//         {isOpen && (
//           <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden z-10">
//             {orderStatus.options.map((status) => (
//               <div
//                 key={status}
//                 className={cn(
//                   "px-4 py-2 cursor-pointer text-white transition-all duration-200",
//                   statusColors[status],
//                   "hover:opacity-80 hover:translate-x-1",
//                   isLoading && "opacity-50 cursor-not-allowed pointer-events-none",
//                   status === currentStatus && "font-semibold"
//                 )}
//                 onClick={() => !isLoading && handleStatusSelect(status)}
//               >
//                 {status}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <AlertDialog open={showConfirmDialog}>
//         <AlertDialogContent
//         >
//           <AlertDialogHeader>
//             <AlertDialogTitle>Change Order Status</AlertDialogTitle>
//             <AlertDialogDescription className="space-y-2">

//               Are you sure you want to change the order status from {currentStatus} to {pendingStatus}?

//               {error && (
//                 <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
//                   Error: {error}
//                 </p>
//               )}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel
//               disabled={isLoading}
//               onClick={() => {
//                 setPendingStatus(null);
//                 setError(null);
//                 setShowConfirmDialog(false);
//               }}
//             >
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleConfirm}
//               disabled={isLoading}
//               className={cn(
//                 "relative",
//                 isLoading && "text-transparent"
//               )}
//             >
//               {isLoading && (
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 </div>
//               )}
//               Confirm
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   )
// }

// interface OrderDetailsProps {
//   order: EnrichedOrders | null
//   isMobile?: boolean
//   onSave?: (updatedOrder: EnrichedOrders) => void
//   handleClose: () => void
// }

// export function OrderDetails({ order: order, isMobile = false, onSave, handleClose }: OrderDetailsProps) {
//   const form = useForm<EnrichedOrders>({
//     resolver: zodResolver(updateOrderSchema),
//     defaultValues: order || {},
//     mode: "onChange"
//   })

//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)

//   if (!order) {
//     return <div className="p-6 text-center">No order details available.</div>
//   }

//   const containerClass = isMobile
//     ? "p-4 h-full overflow-scroll"
//     : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden "
//   const cardClass = isMobile
//     ? "bg-white"
//     : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl"

//   const handleSave = async () => {
//     try {
//       if (!onSave) {
//         throw new Error('Cannot save: save callback is not provided');
//       }

//       const values = form.getValues();
//       const validationResult = updateOrderSchema.safeParse(values);

//       if (!validationResult.success) {
//         const errors = validationResult.error.issues.map(issue =>
//           `${issue.path.join('.')}: ${issue.message}`
//         );
//         console.error('Validation errors:', errors);
//         toast({
//           title: "Please fix the following errors:",
//           description: <ul className="list-disc pl-4 text-sm">
//             {errors.map((error, index) => (
//               <li key={index}>{error}</li>
//             ))}
//           </ul>,
//           variant: "destructive",
//         });
//         return;
//       }

//       // Check if any values have changed
//       const hasChanges = Object.entries(values).some(([key, value]) => {
//         // Skip comparing functions and complex objects
//         if (typeof value === 'function' || value === null) return false;
//         // Compare with original order values
//         return JSON.stringify(value) !== JSON.stringify(order[key as keyof typeof order]);
//       });

//       if (!hasChanges) {
//         toast({
//           description: "No changes to save",
//           variant: "default",
//         });
//         setIsEditing(false);
//         return;
//       }

//       // Store original values for rollback
//       const originalValues = form.getValues();

//       try {
//         setIsSaving(true);
//         await onSave(values);

//         toast({
//           title: "Order updated successfully",
//           description: <p className="text-sm opacity-90">
//             {Object.entries(values)
//               .filter(([key, value]) => value !== originalValues[key as keyof typeof originalValues])
//               .map(([key, value]) => `${key}: ${value}`)
//               .join(', ')}
//           </p>,
//           variant: "default",
//         });

//         // toast.success(
//         //   <div className="space-y-1">
//         //     <p className="font-semibold">Order updated successfully</p>
//         //     <p className="text-sm opacity-90">
//         //       {Object.entries(values)
//         //         .filter(([key, value]) => value !== originalValues[key as keyof typeof originalValues])
//         //         .map(([key, value]) => `${key}: ${value}`)
//         //         .join(', ')}
//         //     </p>
//         //   </div>
//         // );
//         setIsEditing(false);
//       } catch (error: any) {
//         // Revert form values on error
//         form.reset(originalValues);

//         const errorMessage = error.message || 'An unexpected error occurred';
//         console.error('Save operation failed:', error);
//         toast({
//           title: "Failed to update status",
//           description: <p className="text-sm  p-2 rounded">{errorMessage}</p>,
//           variant: "destructive",
//         });
//         // toast.error(
//         //   <div className="space-y-2">
//         //     <p className="font-semibold">Failed to update order</p>
//         //     <p className="text-sm bg-red-50 p-2 rounded">{errorMessage}</p>
//         //   </div>
//         // );

//         throw error; // Re-throw to trigger SaveButton error state
//       }
//     } catch (error: any) {
//       throw error; // Re-throw to trigger SaveButton error state
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   const handleEdit = () => {
//     setIsEditing(true);
//     form.reset(order); // Reset form with current order data when entering edit mode
//   }

//   return (
//     <div className={containerClass}>
//       <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
//         <div className={isMobile ? "p-4" : "p-6"}>
//           <div className="flex justify-between items-center mb-6 w-full">
//             {isMobile ? (
//               <div className="flex items-center justify-between w-full">
//                 <div className="flex items-center gap-2">
//                   <Badge variant="outline" className="h-7 px-3 text-lg border-2 bg-white">
//                     #{order.orderNumber}
//                   </Badge>
//                   <StatusDropdown
//                     currentStatus={order.status as Status}
//                     onStatusChange={async (status) => {
//                       // Don't proceed if status hasn't changed
//                       if (status === order.status) {
//                         toast({
//                           description: "Status is already " + status,
//                           variant: "default",
//                         });
//                         return;
//                       }

//                       try {
//                         form.setValue("status", status);
//                         if (!isEditing) {
//                           await handleSave();
//                         }
//                       } catch (error) {
//                         // Revert on error
//                         form.setValue("status", order.status);
//                         throw error;
//                       }
//                     }}
//                     isEditing={isEditing}
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">

//                   <Button size="sm" className="gap-2  bg-blue-500 hover:bg-blue-600 transition-colors">
//                     <Printer className="w-4 h-4" />

//                   </Button>
//                   {isEditing ? (
//                     <SaveButton onClick={handleSave} />
//                   ) : (
//                     <Button
//                       size="sm"
//                       className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
//                       onClick={handleEdit}
//                     >
//                       <Edit className="w-4 h-4" />
//                     </Button>
//                   )}
//                   <Button
//                     onClick={handleClose}
//                     size="sm"
//                     className="gap-2 bg-gray-500/50 hover:bg-slate-600 transition-colors"
//                   >
//                     <X />
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//                   <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
//                   <Badge variant="outline" className="h-7 px-3 text-lg border-2 bg-white">
//                     #{order.orderNumber}
//                   </Badge>
//                   <StatusDropdown
//                     currentStatus={order.status as Status}
//                     onStatusChange={async (status) => {
//                       // Don't proceed if status hasn't changed
//                       if (status === order.status) {
//                         toast({
//                           description: "Status is already " + status,
//                           variant: "default",
//                         });
//                         return;
//                       }

//                       try {
//                         form.setValue("status", status);
//                         if (!isEditing) {
//                           await handleSave();
//                         }
//                       } catch (error) {
//                         // Revert on error
//                         form.setValue("status", order.status);
//                         throw error;
//                       }
//                     }}
//                     isEditing={isEditing}
//                   />
//                 </div>
//                 <div className="flex gap-2">
//                   <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors">
//                     <Printer className="w-4 h-4" />
//                     Print Order
//                   </Button>
//                   {isEditing ? (
//                     <SaveButton onClick={handleSave} showLabel />
//                   ) : (
//                     <Button
//                       size="sm"
//                       className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
//                       onClick={handleEdit}
//                     >
//                       <Edit className="w-4 h-4" />
//                       Edit
//                     </Button>
//                   )}
//                   <Button
//                     onClick={handleClose}
//                     size="sm"
//                     className="gap-2 bg-gray-500/50 hover:bg-slate-600 transition-colors"
//                   >
//                     <X />
//                   </Button>
//                 </div>
//               </>
//             )}
//           </div>

//           <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="p-4">
//               <CardTitle className="text-lg text-gray-700">Order Information</CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 pt-0">
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Movement Type</label>
//                   {isEditing ? (
//                     <Select value={form.watch("movement")} onValueChange={(value) => form.setValue("movement", value as MovementType)}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select movement type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {movementType.options.map((type) => (
//                           <SelectItem key={type} value={type}>
//                             {type}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   ) : (
//                     <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                       <ArrowUpRight className="w-4 h-4 text-blue-500" />
//                       <span>{order.movement}</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Delivery Method</label>
//                   {isEditing ? (
//                     <Select value={form.watch("deliveryMethod")} onValueChange={(value) => form.setValue("deliveryMethod", value as DeliveryMethod)}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select delivery method" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {deliveryMethod.options.map((type) => (
//                           <SelectItem key={type} value={type}>
//                             {type.charAt(0) + type.slice(1).toLowerCase()}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   ) : (
//                     <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                       <Truck className="w-4 h-4 text-green-500" />
//                       <span>{order.deliveryMethod}</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Order Type</label>
//                   {isEditing ? (
//                     <Select value={form.watch("orderType")} onValueChange={(value) => form.setValue("orderType", value as OrderType)}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select order type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {orderType.options.map((type) => (
//                           <SelectItem key={type} value={type}>
//                             {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   ) : (
//                     <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                       <Package className="w-4 h-4 text-purple-500" />
//                       <span>{order.orderType}</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Packing Type</label>
//                   {isEditing ? (
//                     <Select value={form.watch("packingType")} onValueChange={(value) => form.setValue("packingType", value as PackingType)}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select packing type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {packingType.options.map((type) => (
//                           <SelectItem key={type} value={type}>
//                             {type.charAt(0) + type.slice(1).toLowerCase()}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   ) : (
//                     <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                       <Box className="w-4 h-4 text-orange-500" />
//                       <span>{order.packingType}</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Customer</label>
//                   {isEditing ? (
//                     <Input
//                       value={form.watch("customerName")}
//                       onChange={(e) => form.setValue("customerName", e.target.value)}
//                     />
//                   ) : (
//                     <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                       <User className="w-4 h-4 text-indigo-500" />
//                       <span>{order.customerName}</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Date</label>
//                   <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                     <Calendar className="w-4 h-4 text-red-500" />
//                     <span>{order.createdAt.toLocaleString()}</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="p-4">
//               <CardTitle className="text-lg text-gray-700">Order Items</CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-gray-100/50">
//                     <TableHead className="w-[70%]">Item</TableHead>
//                     <TableHead className="w-[30%]">Quantity</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {order.items.map((item, index) => (
//                     <TableRow key={`${item.itemId}-${index}`} className="hover:bg-gray-100/50 transition-colors">
//                       <TableCell className="font-medium">
//                         {isEditing ? (
//                           <Input
//                             value={form.watch(`items.${index}.itemName`)}
//                             onChange={(e) => {
//                               const newItems = [...form.getValues("items")]
//                               newItems[index] = { ...newItems[index], itemName: e.target.value }
//                               form.setValue("items", newItems)
//                             }}
//                           />
//                         ) : (
//                           item.itemName
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {isEditing ? (
//                           <Input
//                             type="number"
//                             min="1"
//                             value={form.watch(`items.${index}.quantity`)}
//                             onChange={(e) => {
//                               const newItems = [...form.getValues("items")]
//                               newItems[index] = { ...newItems[index], quantity: Math.max(1, Number.parseInt(e.target.value) || 1) }
//                               form.setValue("items", newItems)
//                             }}
//                           />
//                         ) : (
//                           item.quantity
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>

//           <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="p-4">
//               <CardTitle className="text-lg text-gray-700">Notes</CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 pt-0">
//               {isEditing ? (
//                 <Textarea
//                   value={form.watch("notes") || ""}
//                   onChange={(e) => form.setValue("notes", e.target.value)}
//                   placeholder="Add notes here..."
//                 />
//               ) : (
//                 <p className="text-sm text-gray-600">{order.notes || "No notes available."}</p>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }