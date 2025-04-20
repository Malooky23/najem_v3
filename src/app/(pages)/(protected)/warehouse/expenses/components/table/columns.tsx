import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EnrichedOrderExpenseSchemaType } from "@/types/expense";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";


export const expenseColumns: ColumnDef<EnrichedOrderExpenseSchemaType>[] = [
  // Note: Selection column is added automatically by the DataTable component internally
  // {
  //   id: "index",
  //   header: () => <p className="flex justify-center font-bold">Index</p>,
  //   cell: ({ row }) => <span>{row.index + 1}</span>,
  //   enableSorting: false

  // },
  {
    accessorKey: 'orderNumber',
    header: 'Order #',
    // Optional: Cell formatting
    cell: ({ row }) => <span className="pl-1 font-bold">Order {row.original.orderNumber}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    // Optional: Cell formatting
    cell: ({ row }) => <StatusBadge status={row.original.status} />

  },
  {
    accessorKey: 'customerName',
    header: 'Customer',
  },
  {
    accessorKey: 'expenseItemName',
    header: 'Expense',
    enableSorting: false

  },
  // {
  //   accessorKey: 'expenseItemCategory',
  //   header: 'Expense Category',
  //   enableSorting: false

  // },
  {
    accessorKey: 'expenseItemPrice',
    header: 'Expense Cost',
    cell: ({ row }) => (row.original.expenseItemPrice * row.original.expenseItemQuantity),
    enableSorting: false


  },

  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
  },
  {
    id: 'actions',
    enableSorting: false,

    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('View order', order.orderExpenseId)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Order</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete Order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block"
    const statuses: { [ key: string ]: string } = {
      "PENDING": "bg-yellow-500/20 text-yellow-700",
      "DONE": "bg-purple-500/20 text-purple-700",
      "CANCELLED": "bg-red-500/20 text-red-700",
    }
    return `${baseStyles} ${statuses[ status ] || statuses[ "PENDING" ]}`
  }

  return (
    <div className="flex items-center  w-full">
      <span className={getStatusStyles(status)}>{status}</span>
    </div>
  )
}