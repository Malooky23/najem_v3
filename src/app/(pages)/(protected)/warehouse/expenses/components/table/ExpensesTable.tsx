// src/components/my-orders-page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // Keep for initial read
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useOrdersQuery } from '@/hooks/data/useOrders';
import { DataTable } from '@/components/ui/data-table';
import { expenseColumns } from './columns';
import { EnrichedOrderExpenseSchemaType, ExpenseFilters, ExpenseSort, ExpenseSortFields } from '@/types/expense';
import { useOrderExpenses } from '@/hooks/data/useExpenses';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming you have a debounce hook
import { Router } from 'lucide-react';

// --- URL Parameter Names (Constants) ---
const PAGE_PARAM = 'page';
const PAGE_SIZE_PARAM = 'pageSize';
const SORT_FIELD_PARAM = 'sortField';
const SORT_DIR_PARAM = 'sortDirection';
const SEARCH_PARAM = 'search';
// Add other filter params if needed

// --- Helper Functions ---
const safeParseInt = (val: string | null | undefined, defaultVal: number): number => {
    if (val === null || val === undefined) return defaultVal;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 ? defaultVal : parsed; // Ensure page >= 1
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


export function ExpensesTable() {
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
    const [ filters, setFilters ] = useState({});
    const [ search, setSearch ] = useState(searchParams.get('search') || '');

    useEffect(()=>{

        setSearchInput(searchParams.get('search') || '')

    }, [ searchParams.get('search') ])



    // const queryParams = useMemo(() => {
    //     let sortString: ExpenseSort
    //     if (sorting.length > 0) {
    //         // API might expect a different format, adjust if necessary
    //         // For now, let's create a format consistent with our internal state
    //         // sortString = `sort${sorting[ 0 ].id}:${sorting[ 0 ].desc ? 'desc' : 'asc'}`;
    //         sortString = {
    //             field: sorting[ 0 ].id as ExpenseSortFields,
    //             direction: sorting[ 0 ].desc ? 'desc' : 'asc'
    //         }

    //     }
    //     return {
    //         page: pagination.pageIndex + 1,
    //         pageSize: pagination.pageSize,
    //         sort: sortString,
    //         filters: { "search": search }
    //     };
    // }, [ pagination, sorting, filters, search ]);


    // // Use Tanstack Query based on local state
    // const queryResult = useOrderExpenses(queryParams)

    const getSortParamsForApi = (sorting: SortingState): ExpenseSort | undefined => {
        if (!sorting || sorting.length === 0) {
            // Return default sort or undefined if API handles default
            return { field: 'createdAt', direction: 'desc' };
        }
        // Adapt if API expects a different format
        return {
            field: sorting[ 0 ].id as ExpenseSortFields, // Ensure id matches ExpenseSortFields
            direction: sorting[ 0 ].desc ? 'desc' : 'asc'
        };
    };

    const currentSearch = useMemo(() => searchParams.get(SEARCH_PARAM) || '', [ searchParams ]);
        // Add derivation for other filters if needed
    
        // --- Local state ONLY for debouncing input ---
        const [ searchInput, setSearchInput ] = useState(currentSearch);
        const debouncedSearch = useDebounce(searchInput, 300); // 300ms debounce
    
        // === API Query Parameters ===
        // Memoize the params passed to useOrderExpenses based on derived state
        const apiQueryParams = useMemo(() => {
            const sortForApi = getSortParamsForApi(sorting);
            const filters: ExpenseFilters = {};
            if (debouncedSearch) { // Use debounced search for API query
                filters.search = debouncedSearch;
            }
            // Add other derived filters here
            // if (derivedFilterValue) filters.someFilter = derivedFilterValue;
    
            return {
                page: pagination.pageIndex + 1, // API expects 1-based page
                pageSize: pagination.pageSize,
                sort: sortForApi,
                filters: filters,
            };
        }, [ pagination, sorting, debouncedSearch ]); // Use debouncedSearch here
    
        // === TanStack Query ===
        const queryResult = useOrderExpenses(apiQueryParams);


    const handleRowClick = (order: EnrichedOrderExpenseSchemaType) => {
        console.log("Row clicked in parent:", order);
        // Navigate or perform other actions if needed, URL 'view' param is handled by DataTable
    };

    return (
        // Ensure parent provides height context
        // <div className="container mx-auto py-6 flex flex-col h-[calc(100vh-100px)]">


        <div className="flex-grow min-h-0"> {/* Ensure DataTable's container can grow */}
            <DataTable
                columns={expenseColumns}
                // Pass derived data and state
                data={queryResult.data?.data?.data ?? []}
                pageCount={queryResult.data?.data?.pagination?.totalPages ?? -1}
                rowCount={queryResult.data?.data?.pagination?.total ?? 0}
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
                rowIdKey="orderExpenseId"
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
        // </div>
    );
}