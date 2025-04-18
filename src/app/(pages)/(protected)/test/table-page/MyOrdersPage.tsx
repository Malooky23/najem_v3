// src/components/my-orders-page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // Keep for initial read
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';

// Assuming columns and fetcher are defined/imported
// Adjust your actual query hook import and usage

import { DataTable } from './data-table';
import { EnrichedOrderSchemaType, OrderSort } from '@/types/orders';
import { useOrdersQuery } from '@/hooks/data/useOrders';

// Helper to parse URL params safely
const safeParseInt = (val: string | null | undefined, defaultVal: number): number => {
    if (val === null || val === undefined) return defaultVal;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultVal : parsed;
};

// Helper to parse sorting param
const parseSortingParams = (
    fieldParam: string | null,
    dirParam: string | null | undefined // Can be null or undefined
): SortingState => {
    if (!fieldParam) {
        return []; // No sort field specified
    }
    // Default direction is descending if field exists but direction doesn't
    const isDesc = dirParam !== 'asc';
    return [ { id: fieldParam, desc: isDesc } ];
};

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

export function MyOrdersPage() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    // Define URL parameter names (could also be props if needed elsewhere)
    const pageParamName = 'page';
    const pageSizeParamName = 'pageSize';
    const sortFieldParamName = 'sortField'; // New name
    const sortDirParamName = 'sortDirection'; // New name

    // === Local State ===
    // Initialize state ONCE from URL
    const [ pagination, setPagination ] = useState<PaginationState>(() => {
        const page = safeParseInt(searchParams.get(pageParamName), 1);
        const pageSize = safeParseInt(searchParams.get(pageSizeParamName), 10);
        return { pageIndex: page - 1, pageSize };
    });

    const [ sorting, setSorting ] = useState<SortingState>(() =>
        // Use the updated parsing helper
        parseSortingParams(
            searchParams.get(sortFieldParamName),
            searchParams.get(sortDirParamName)
        )
    );

    // Add local state for filters/search if applicable
    // const [filters, setFilters] = useState({});
    // const [search, setSearch] = useState(searchParams.get('search') || '');



    // === Query ===
    // Memoize query params
    const queryParams = useMemo(() => {
        let sortString: string | undefined = undefined;
        if (sorting.length > 0) {
            // API might expect a different format, adjust if necessary
            // For now, let's create a format consistent with our internal state
            sortString = `${sorting[ 0 ].id}:${sorting[ 0 ].desc ? 'desc' : 'asc'}`;
        }
        return {
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            // sort: sortString, // API might need separate field/direction too! Adapt if needed.
            // filters, search,
        };
    }, [ pagination, sorting /*, filters, search */ ]);


    // Use Tanstack Query based on local state
    const queryResult = useOrdersQuery(queryParams)


    const handleRowClick = (order: EnrichedOrderSchemaType) => {
        console.log("Row clicked in parent:", order);
        // Navigate or perform other actions if needed, URL 'view' param is handled by DataTable
    };

    return (
        // Ensure parent provides height context
        <div className="container mx-auto py-6 flex flex-col h-[calc(100vh-100px)]">
            <h1 className="text-2xl font-bold mb-4 flex-shrink-0">Orders</h1>
            {/* Add Filter/Search inputs here, updating local state */}
            {/* <div className="mb-4 flex-shrink-0">... filters ...</div> */}

            <div className="flex-grow min-h-0"> {/* Ensure DataTable's container can grow */}
                <DataTable
                    columns={columns}
                    // Pass derived data and state
                    data={queryResult.data?.orders ?? []} // Adjust 'orders' if needed
                    pageCount={queryResult.data?.pagination?.totalPages ?? -1}
                    rowCount={queryResult.data?.pagination?.total ?? 0}
                    pagination={pagination}
                    sorting={sorting}
                    // Pass state updaters
                    onPaginationChange={setPagination}
                    onSortingChange={setSorting}
                    // Pass loading states
                    isLoading={queryResult.isLoading}
                    isFetching={queryResult.isFetching}
                    isError={queryResult.isError}
                    error={queryResult.error}
                    // Other props
                    rowIdKey="orderId"
                    onRowClick={handleRowClick}
                    // *** Pass the specific URL param names ***
                    pageParamName={pageParamName}
                    pageSizeParamName={pageSizeParamName}
                    sortFieldParamName={sortFieldParamName} // New prop
                    sortDirParamName={sortDirParamName}   // New prop
                    selectParamName="selected" // Keep others if needed
                    viewParamName="view"
                />
            </div>
        </div>
    );
}