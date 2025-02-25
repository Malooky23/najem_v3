// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Package, Truck, Calendar, User, Box, ArrowUpRight, Printer, ChevronDown } from "lucide-react"
// import type { EnrichedOrders } from "@/types/orders" // Assuming you have a types file with the Zod schemas

// const statusColors = {
//   PENDING: "bg-yellow-500",
//   PROCESSING: "bg-blue-500",
//   SHIPPED: "bg-purple-500",
//   DELIVERED: "bg-green-500",
//   CANCELLED: "bg-red-500",
// }

// type Status = keyof typeof statusColors

// const StatusDropdown = ({
//   currentStatus,
//   onStatusChange,
// }: { currentStatus: Status; onStatusChange: (status: Status) => void }) => {
//   const [isOpen, setIsOpen] = useState(false)

//   return (
//     <div className="relative">
//       <Badge
//         variant="secondary"
//         className={`h-7 px-3 cursor-pointer transition-all hover:shadow-md ${statusColors[currentStatus]} text-white`}
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {currentStatus}
//         <ChevronDown className="w-4 h-4 ml-1" />
//       </Badge>
//       {isOpen && (
//         <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden z-10">
//           {Object.keys(statusColors).map((status) => (
//             <div
//               key={status}
//               className={`px-4 py-2 cursor-pointer ${statusColors[status as Status]} text-white hover:opacity-80 transition-opacity`}
//               onClick={() => {
//                 onStatusChange(status as Status)
//                 setIsOpen(false)
//               }}
//             >
//               {status}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// interface OrderDetailsProps {
//   order: EnrichedOrders | null
//   isMobile?: boolean
// }

// export function OrderDetails({ order, isMobile = false }: OrderDetailsProps) {
//   const [status, setStatus] = useState<Status>((order?.status as Status) || "PENDING")

//   if (!order) {
//     return <div className="p-6 text-center">No order details available.</div>
//   }

//   const containerClass = isMobile
//     ? "p-4"
//     // : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen"
//     : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-orange-100  h-full overflow-scroll"
//   const cardClass = isMobile
//     ? "bg-white"
//     : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl"

//   return (
//     <div className={containerClass}>
//       <div className={`max-w-4xl mx-auto ${cardClass}`}>
//         <div className={isMobile ? "p-4" : "p-6"}>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//               <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
//               <Badge variant="outline" className="h-7 px-3 text-lg border-2 bg-white">
//                 #{order.orderNumber}
//               </Badge>
//               <StatusDropdown currentStatus={status} onStatusChange={setStatus} />
//             </div>
//             <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors">
//               <Printer className="w-4 h-4" />
//               Print Order
//             </Button>
//           </div>

//           <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow">
//             <CardHeader className="p-4">
//               <CardTitle className="text-lg text-gray-700">Order Information</CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 pt-0">
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Movement Type</label>
//                   <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                     <ArrowUpRight className="w-4 h-4 text-blue-500" />
//                     <span>{order.movement}</span>
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Delivery Method</label>
//                   <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                     <Truck className="w-4 h-4 text-green-500" />
//                     <span>{order.deliveryMethod}</span>
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Order Type</label>
//                   <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                     <Package className="w-4 h-4 text-purple-500" />
//                     <span>{order.orderType}</span>
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Packing Type</label>
//                   <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                     <Box className="w-4 h-4 text-orange-500" />
//                     <span>{order.packingType}</span>
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs text-gray-500">Customer</label>
//                   <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                     <User className="w-4 h-4 text-indigo-500" />
//                     <span>{order.customerName}</span>
//                   </div>
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
//                   {order.items.map((item) => (
//                     <TableRow key={item.itemId} className="hover:bg-gray-100/50 transition-colors">
//                       <TableCell className="font-medium">{item.itemName}</TableCell>
//                       <TableCell>{item.quantity}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>

//           {order.notes && (
//             <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
//               <CardHeader className="p-4">
//                 <CardTitle className="text-lg text-gray-700">Notes</CardTitle>
//               </CardHeader>
//               <CardContent className="p-4 pt-0">
//                 <p className="text-sm text-gray-600">{order.notes}</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }