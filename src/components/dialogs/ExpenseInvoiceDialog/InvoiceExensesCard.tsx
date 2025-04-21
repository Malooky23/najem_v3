
"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, EditIcon, Home } from "lucide-react"
import { z } from "zod"
import { EnrichedOrderExpenseSchemaType, orderExpenseWithName, orderExpenseWithNameType } from '@/types/expense'
import { OrderExpenseDialog } from "@/components/dialogs/ExpenseDialog/OrderExpenseDialog"
import { useSession } from "next-auth/react"



interface OrderItemsTableProps {
  orderExpenses: EnrichedOrderExpenseSchemaType[]
  isLoading: boolean;
}

export function InvoiceExensesCard({ orderExpenses, isLoading }: OrderItemsTableProps) {
  const allOrderIds = Object.keys(orderExpenses).map((key, index) => key)
  allOrderIds.map((id) => {
    console.log("InvoiceExensesCard: ", id)
  })

  const { data: session } = useSession()
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
          {session?.user.userType === 'EMPLOYEE' &&
            <OrderExpenseDialog>
              <div className="flex justify-center">
                <Button className="w-full">Add Expense</Button>
              </div>
            </OrderExpenseDialog>
          }
        </CardContent>
      </Card>
    )
  }

  // Calculate total price


  return (
    <Card className="mt-6 bg-white/70 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 ">
        <CardTitle className="text-lg text-gray-700 flex justify-between">
          <p>Order Expenses</p>
          
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex">
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/50">
              <TableHead className="w-[70%]1">#</TableHead>
              <TableHead className="w-[70%]1">Order Number</TableHead>
              <TableHead className="w-[30%]@">Customer</TableHead>
              <TableHead className=""># of Expenses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderExpenses.map((expense, index) => (
              <TableRow key={index} className="hover:bg-gray-100/50 transition-colors">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{expense.orderNumber}</TableCell>
                <TableCell>{expense.customerName}</TableCell>
                <TableCell> ??????</TableCell>
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
              <span className="text-base font-bold">AED XXXX</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
