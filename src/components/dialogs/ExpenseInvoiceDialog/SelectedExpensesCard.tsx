// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { ArrowUpRight, Box, RailSymbol, Truck, UserCircle2 } from "lucide-react"
// import { z } from "zod"
// import { EnrichedOrderExpenseSchemaType } from "@/types/expense"
// import { JSX } from "react"
// import { or } from "drizzle-orm"


// interface SelectedExpensesCardProps {
//     selectedExpenses: EnrichedOrderExpenseSchemaType[]
// }

// export function SelectedExpensesCard({ selectedExpenses }: SelectedExpensesCardProps) {

//     // Helper function to format enum-like strings


//     // Define the information rows
//     const selectedOrders = [
//         {
//             label: "Order Number",
//             value: orderNumber,
//             icon: <ArrowUpRight className="w-4 h-4 text-blue-500" />,
//         },
//         {
//             label: "Delivery Method",
//             value: formatLabel(deliveryMethod),
//             icon: <Truck className="w-4 h-4 text-green-500" />,
//         },
//         {
//             label: "Packing Type",
//             value: formatLabel(packingType),
//             icon: <Box className="w-4 h-4 text-orange-500" />,
//         },
//         {
//             label: "Customer",
//             value: customerName,
//             icon: <UserCircle2 className="w-4 h-4 text-indigo-500" />,
//         },
//         {
//             label: "Order Mark",
//             value: orderMark ?? "-",
//             icon: <RailSymbol className="w-4 h-4 text-indigo-500" />,
//         },
//     ]

//     return (
//         <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow mt-2">
//             <CardHeader className="p-4">
//                 <CardTitle className="text-lg text-gray-700">Selected Expenses </CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 pt-0">
//                 <div className="space-y-3">
//                     {infoRows.map((row, index) => (
//                         <div key={index} className="grid grid-cols-2 gap-4">
//                             <div className="text-sm text-gray-500">{row.label}</div>
//                             <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                                 {row.icon}
//                                 <span className="truncate">{row.value}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </CardContent>
//         </Card>
//     )
// }
