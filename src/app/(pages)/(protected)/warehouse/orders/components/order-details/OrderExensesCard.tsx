// // 'use client';

// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// // import Link from "next/link";

// // interface OrderExpense {
// //   expenseId: string;
// //   expenseName: string;
// //   quantity: number;
// //   price: number;
// // }

// // interface OrderItemsTableProps {
// //   orderExpenses: OrderExpense[];
// // }

// // export function OrderExensesCard({ orderExpenses }: OrderItemsTableProps) {
// //   if (!orderExpenses || !orderExpenses.length) {
// //     return (
// //       <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
// //         <CardHeader className="p-4">
// //           <CardTitle className="text-lg text-gray-700">Order Expenses</CardTitle>
// //         </CardHeader>
// //         <CardContent>
// //           <p className="text-center text-gray-500 py-4">No expense in this order</p>
// //           <Button>
// //             Add Expense
// //           </Button>
// //         </CardContent>
// //       </Card>
// //     );
// //   }
// //   return (
// //     <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
// //       <CardHeader className="p-4">
// //         <CardTitle className="text-lg text-gray-700">Order Expenses</CardTitle>
// //       </CardHeader>
// //       <CardContent className="p-0">
// //         <Table>
// //           <TableHeader>
// //             <TableRow className="bg-gray-100/50">
// //               <TableHead className="w-[70%]1">#</TableHead>
// //               <TableHead className="w-[70%]1">Item</TableHead>
// //               <TableHead className="w-[30%]@">Quantity</TableHead>
// //               <TableHead className="">Price</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {orderExpenses.map((expense, index) => (
// //               <TableRow key={index} className="hover:bg-gray-100/50 transition-colors">
// //                 <TableCell>
// //                   {index}
// //                 </TableCell>
// //                 <TableCell className="font-medium">
// //                   {expense.expenseName}
// //                 </TableCell>
// //                 <TableCell>
// //                   {expense.quantity}
// //                 </TableCell>
// //                 <TableCell>
// //                   {expense.price}
// //                 </TableCell>
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //         <div className="p-4">
// //           tota
// //           total price: 100
// //         </div>
// //       </CardContent>
// //     </Card>
// //   );
// // }

// "use client"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// interface OrderExpense {
//   expenseId: string
//   expenseName: string
//   quantity: number
//   price: number
// }

// interface OrderItemsTableProps {
//   orderExpenses: OrderExpense[]
// }

// export function OrderExensesCard({ orderExpenses }: OrderItemsTableProps) {
//   if (!orderExpenses || !orderExpenses.length) {
//     return (
//       <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
//         <CardHeader className="p-4">
//           <CardTitle className="text-lg text-gray-700">Order Expenses</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-center text-gray-500 py-4">No expense in this order</p>
//           <Button>Add Expense</Button>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Calculate total price
//   const totalPrice = orderExpenses.reduce((sum, expense) => sum + expense.price, 0)

//   return (
//     <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
//       <CardHeader className="p-4">
//         <CardTitle className="text-lg text-gray-700">Order Expenses</CardTitle>
//       </CardHeader>
//       <CardContent className="p-0">
//         <Table>
//           <TableHeader>
//             <TableRow className="bg-gray-100/50">
//               <TableHead className="w-[70%]1">#</TableHead>
//               <TableHead className="w-[70%]1">Item</TableHead>
//               <TableHead className="w-[30%]@">Quantity</TableHead>
//               <TableHead className="">Price</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {orderExpenses.map((expense, index) => (
//               <TableRow key={index} className="hover:bg-gray-100/50 transition-colors">
//                 <TableCell>{index + 1}</TableCell>
//                 <TableCell className="font-medium">{expense.expenseName}</TableCell>
//                 <TableCell>{expense.quantity}</TableCell>
//                 <TableCell>${expense.price.toFixed(2)}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//         <Separator className="my-2" />
//         <div className="p-4 bg-gray-50 rounded-b-lg">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-500">Number of expenses:</span>
//               <span className="text-sm font-bold">{orderExpenses.length}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-500">Total price:</span>
//               <span className="text-base font-bold">${totalPrice.toFixed(2)}</span>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


"use client"

import { OrderExpenseDialog } from "@/components/CreateOrderExpense/OrderExpenseDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, EditIcon, Home } from "lucide-react"


interface OrderExpense {
  expenseId: string
  expenseName: string
  quantity: number
  price: number
}

interface OrderItemsTableProps {
  orderExpenses: OrderExpense[];
  isLoading: boolean;
}

export function OrderExensesCard({ orderExpenses, isLoading }: OrderItemsTableProps) {

  if (isLoading) {
    return (
      <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
        {/* <CardHeader className="p-4">
          <CardTitle className="text-lg text-gray-700">Order Expenses</CardTitle>
        </CardHeader> */}
        <CardContent className="p-2">
          <Skeleton className="h-12" />
        </CardContent>
      </Card>
    );
  }

  if (!orderExpenses || !orderExpenses.length) {
    return (
      <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-4">
          <CardTitle className="text-lg text-gray-700">Order Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">No expense in this order</p>
          <OrderExpenseDialog>
            <div className="flex justify-center">
            <Button className="w-full">Add Expense</Button>
            </div>
          </OrderExpenseDialog>
        </CardContent>
      </Card>
    )
  }

  // Calculate total price
  const totalPrice = orderExpenses.reduce((sum, expense) => sum + expense.price, 0)

  return (
    <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 ">
        <CardTitle className="text-lg text-gray-700 flex justify-between">
          <p>Order Expenses</p>

        <OrderExpenseDialog>
          <button>
            <Edit className="hover:cursor-pointer! stroke-cyan-400" />
          </button>
        </OrderExpenseDialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex">
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/50">
              <TableHead className="w-[70%]1">#</TableHead>
              <TableHead className="w-[70%]1">Item</TableHead>
              <TableHead className="w-[30%]@">Quantity</TableHead>
              <TableHead className="">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderExpenses.map((expense, index) => (
              <TableRow key={index} className="hover:bg-gray-100/50 transition-colors">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{expense.expenseName}</TableCell>
                <TableCell>{expense.quantity}</TableCell>
                <TableCell>${expense.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className="my-2" />
        <div className="p-4 bg-gray-50 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Number of expenses:</span>
              <span className="text-sm font-bold">{orderExpenses.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Total price:</span>
              <span className="text-base font-bold">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
