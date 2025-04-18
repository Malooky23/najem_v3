'use client'
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';


import { Checkbox } from "@/components/ui/checkbox"; // Needed for selection column def
import { useSearchParams } from 'next/navigation';
import { useOrdersQuery } from '@/hooks/data/useOrders';
import { DataTable } from './DataTable';
import { EnrichedOrderSchema, EnrichedOrderSchemaType } from '@/types/orders';



// Define Columns
export const columns: ColumnDef<EnrichedOrderSchemaType>[] = [
    // Note: Selection column is added automatically by the DataTable component internally
    {
        accessorKey: 'orderNumber',
        header: 'Order #',
    },
    {
        accessorKey: 'customerName',
        header: 'Customer',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        // Optional: Cell formatting
        cell: ({ row }) => <span>{row.original.status}</span>,
    },
    
    {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    // Add more columns as needed...
    // Example: Actions column (if you need specific actions per row)
    // {
    //   id: 'actions',
    //   cell: ({ row }) => {
    //     const order = row.original;
    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem onClick={() => console.log('View order', order.id)}>
    //             View Details
    //           </DropdownMenuItem>
    //           <DropdownMenuItem>Edit Order</DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem className="text-destructive">Delete Order</DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
];


// --- Component Using the DataTable ---
export function NewOrdersTable() {
    const  searchParams  = useSearchParams();

    // Read params for the query hook
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sort = searchParams.get('sort') || undefined; // e.g., "createdAt:desc"
    const filters = {}; // Add your filter logic here based on other searchParams if needed
    const search = searchParams.get('search') || undefined;

    // Use your actual Tanstack Query hook
    const queryResult = useOrdersQuery({
        page,
        pageSize,
        filters,
        // sort,
        // search,
    });

    const handleRowClick = (order: EnrichedOrderSchemaType) => {
        console.log("Row clicked in parent:", order);
        // You could potentially navigate here instead of relying solely on the URL param update
        // navigate(`/orders/${order.id}`);
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Orders</h1>
            <DataTable
                columns={columns}
                queryHookResult={queryResult}
                rowIdKey="orderId" // Specify the unique key for rows
                onRowClick={handleRowClick} // Optional callback
            // Optional: Customize param names if needed
            // pageParamName="p"
            // pageSizeParamName="size"
            // sortParamName="orderBy"
            // selectParamName="sel"
            // viewParamName="details"
            />
        </div>
    );
}