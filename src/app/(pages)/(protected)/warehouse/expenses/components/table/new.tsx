// src/components/ExpenseTable.tsx
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'; // Import router and pathname
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { expenseColumns } from './columns';
import { EnrichedOrderExpenseSchemaType, ExpenseFilters, ExpenseSort, ExpenseSortFields } from '@/types/expense';
import { useOrderExpenses } from '@/hooks/data/useExpenses';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming you have a debounce hook

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

const parseSortingState = (
    fieldParam: string | null,
    dirParam: string | null | undefined
): SortingState => {
    if (!fieldParam) {
        return []; // No sort field specified
    }
    const isDesc = dirParam !== 'asc'; // Default to desc if field exists but dir is missing or not 'asc'
    return [ { id: fieldParam, desc: isDesc } ];
};

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

export function ExpensesTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // === Derive State Directly from URL Search Params ===
    const pagination = useMemo<PaginationState>(() => {
        const page = safeParseInt(searchParams.get(PAGE_PARAM), 1);
        const pageSize = safeParseInt(searchParams.get(PAGE_SIZE_PARAM), 10);
        return { pageIndex: page - 1, pageSize }; // pageIndex is 0-based
    }, [ searchParams ]);

    const sorting = useMemo<SortingState>(() =>
        parseSortingState(
            searchParams.get(SORT_FIELD_PARAM),
            searchParams.get(SORT_DIR_PARAM)
        ),
        [ searchParams ]
    );

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

    // === URL Update Logic ===
    const updateUrl = useCallback((newParams: Record<string, string | number | null>) => {
        const current = new URLSearchParams(Array.from(searchParams.entries())); // Create mutable copy

        Object.entries(newParams).forEach(([ key, value ]) => {
            if (value === null || value === undefined || value === '') {
                current.delete(key);
            } else {
                current.set(key, String(value));
            }
        });

        // Reset page to 1 when sorting or filtering changes
        const shouldResetPage = Object.keys(newParams).some(key =>
            key === SORT_FIELD_PARAM || key === SORT_DIR_PARAM || key === SEARCH_PARAM /* || other filter keys */
        );
        if (shouldResetPage && pagination.pageIndex !== 0) {
            current.set(PAGE_PARAM, '1');
        }

        const search = current.toString();
        const query = search ? `?${search}` : '';
        // Use replace for search updates, push for pagination/sorting
        const method = Object.keys(newParams).includes(SEARCH_PARAM) ? 'replace' : 'push';
        router[ method ](`${pathname}${query}`, { scroll: false }); // Prevent page jump

    }, [ searchParams, pathname, router, pagination.pageIndex ]);

    // === Handlers to Trigger URL Updates ===
    const handlePaginationChange = useCallback((updater: React.SetStateAction<PaginationState>) => {
        const newState = typeof updater === 'function' ? updater(pagination) : updater;
        updateUrl({
            [ PAGE_PARAM ]: newState.pageIndex + 1,
            [ PAGE_SIZE_PARAM ]: newState.pageSize,
        });
    }, [ updateUrl, pagination ]);

    const handleSortingChange = useCallback((updater: React.SetStateAction<SortingState>) => {
        const newState = typeof updater === 'function' ? updater(sorting) : updater;
        if (newState?.length > 0) {
            updateUrl({
                [ SORT_FIELD_PARAM ]: newState[ 0 ].id,
                [ SORT_DIR_PARAM ]: newState[ 0 ].desc ? 'desc' : 'asc',
            });
        } else {
            // Clear sorting params if newState is empty
            updateUrl({
                [ SORT_FIELD_PARAM ]: null,
                [ SORT_DIR_PARAM ]: null,
            });
        }
    }, [ updateUrl, sorting ]);

    // Update search input state immediately for responsiveness
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    // Effect to update URL when debounced search term changes
    useEffect(() => {
        // Only update URL if debounced value is different from param, prevents initial unnecessary update
        if (debouncedSearch !== currentSearch) {
            updateUrl({ [ SEARCH_PARAM ]: debouncedSearch });
        }
    }, [ debouncedSearch, updateUrl, currentSearch ]);


    // === Row Click Handler ===
    const handleRowClick = (order: EnrichedOrderExpenseSchemaType) => {
        console.log("Row clicked in parent:", order);
        // Example: Update URL to show details view (can be done within DataTable too)
        // updateUrl({ view: order.orderExpenseId });
    };

    return (
        <div className="flex flex-col h-full"> {/* Example: Make container take full height */}
            <div className="p-4">
                <Input
                    placeholder="Search..."
                    value={searchInput} // Controlled input based on local state
                    onChange={handleSearchInputChange}
                    className="max-w-sm"
                />
                {/* Optionally display current API params for debugging */}
                {/* <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                     API Params: {JSON.stringify(apiQueryParams, null, 2)}
                 </pre> */}
            </div>

            <div className="flex-grow min-h-0"> {/* Allow DataTable to scroll */}
                <DataTable
                    columns={expenseColumns}
                    // Pass derived data and state reflecting the URL
                    data={queryResult.data?.data || []} // Adjusted based on throwing error pattern
                    pageCount={queryResult.data?.pagination?.totalPages ?? 0} // Adjusted
                    rowCount={queryResult.data?.pagination?.total ?? 0} // Adjusted
                    pagination={pagination} // Derived from URL
                    sorting={sorting} // Derived from URL
                    // Pass handlers that update the URL
                    onPaginationChange={handlePaginationChange}
                    onSortingChange={handleSortingChange}
                    // Pass loading/error states from useQuery
                    isLoading={queryResult.isLoading}
                    isFetching={queryResult.isFetching} // Use this for loading indicators during refetch
                    isError={queryResult.isError}
                    error={queryResult.error}
                    // Other props
                    rowIdKey="orderExpenseId"
                    onRowClick={handleRowClick}
                // No need to pass param names if DataTable doesn't need them
                // (Assuming DataTable uses on...Change handlers now)
                // selectParamName="selected" // Keep if DataTable uses them internally
                // viewParamName="view"
                />
            </div>
        </div>
    );
}