import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EnrichedOrderExpenseSchemaType } from "@/types/expense";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";


export const expenseColumns: ColumnDef<EnrichedOrderExpenseSchemaType>[] = [
    // Note: Selection column is added automatically by the DataTable component internally
    {
        id: "index",
        header: '#',
        cell: ({ row }) => <span>{row.index+1}</span>,
        enableSorting:false

    },
    {
        accessorKey: 'orderNumber',
        header: 'Order #',
        // Optional: Cell formatting
        cell: ({ row }) => <span>{row.original.orderNumber}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        // Optional: Cell formatting
        cell: ({ row }) => <span>{row.original.status}</span>,
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
    {
        accessorKey: 'expenseItemCategory',
        header: 'Expense Category',
        enableSorting: false

    },
    {
        accessorKey: 'expenseItemPrice',
        header: 'Expense Cost',
        cell: ({ row }) => (row.original.expenseItemPrice*row.original.expenseItemQuantity),
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