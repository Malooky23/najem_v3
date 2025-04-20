// src/app/(pages)/(protected)/warehouse/expenses/components/table/ExpensesTable.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table1';
import { expenseColumns } from './columns';
import { EnrichedOrderExpenseSchemaType, ExpenseFilterFields, ExpenseFilters, ExpenseSort, ExpenseSortFields } from '@/types/expense';
import { useOrderExpenses } from '@/hooks/data/useExpenses';
import { useDebounce } from '@/hooks/useDebounce';
import { orderExpenseStatusTypesSchema } from '@/server/db/schema';

// --- URL Parameter Names (Constants) ---
const PAGE_PARAM = 'page';
const PAGE_SIZE_PARAM = 'pageSize';
const SORT_FIELD_PARAM = 'sortField';
const SORT_DIR_PARAM = 'sortDirection';
const SEARCH_PARAM = 'search';
const STATUS_PARAM = 'status';
const DATE_FROM_PARAM = 'dateFrom';
const DATE_TO_PARAM = 'dateTo';

// --- Helper Functions ---
const safeParseInt = (val: string | null | undefined, defaultVal: number): number => {
    if (val === null || val === undefined) return defaultVal;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 ? defaultVal : parsed;
};

const parseSortingParams = (
    fieldParam: string | null,
    dirParam: string | null | undefined
): SortingState => {
    if (!fieldParam) {
        return [];
    }
    const isDesc = dirParam !== 'asc';
    return [ { id: fieldParam, desc: isDesc } ];
};


export function ExpensesTable() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    // Define URL parameter names (consistent with constants)
    const pageParamName = PAGE_PARAM;
    const pageSizeParamName = PAGE_SIZE_PARAM;
    const sortFieldParamName = SORT_FIELD_PARAM;
    const sortDirParamName = SORT_DIR_PARAM;
    const searchParamName = SEARCH_PARAM;

    // === State ===
    // Initialize state ONCE from URL parameters

    // --- Pagination State ---
    const [ pagination, setPagination ] = useState<PaginationState>(() => {
        const page = safeParseInt(searchParams.get(pageParamName), 1);
        const pageSize = safeParseInt(searchParams.get(pageSizeParamName), 10);
        return { pageIndex: page - 1, pageSize };
    });

    // --- Sorting State ---
    const [ sorting, setSorting ] = useState<SortingState>(() =>
        parseSortingParams(
            searchParams.get(sortFieldParamName),
            searchParams.get(sortDirParamName)
        )
    );

    // --- Search State (for debouncing) ---
    const [ searchInput, setSearchInput ] = useState(searchParams.get(searchParamName) || '');
    const debouncedSearch = useDebounce(searchInput, 300);


    // --- Effect to Sync Pagination State FROM URL ---
    useEffect(() => {
        const page = safeParseInt(searchParams.get(pageParamName), 1);
        const pageSize = safeParseInt(searchParams.get(pageSizeParamName), 10);
        const newPageIndex = page - 1;

        // *** CRITICAL: Check if state actually needs updating ***
        setPagination(currentPagination => {
            if (currentPagination.pageIndex !== newPageIndex || currentPagination.pageSize !== pageSize) {
                console.log("Syncing Pagination FROM URL:", { newPageIndex, pageSize }); // Debug log
                return { pageIndex: newPageIndex, pageSize };
            }
            // If no change, return the existing state object to prevent re-render trigger
            return currentPagination;
        });
    }, [ searchParams, pageParamName, pageSizeParamName ]); // Depend only on URL params

    // --- Effect to Sync Sorting State FROM URL ---
    useEffect(() => {
        const newSorting = parseSortingParams(
            searchParams.get(sortFieldParamName),
            searchParams.get(sortDirParamName)
        );

        // *** CRITICAL: Check if state actually needs updating (deep compare needed for arrays/objects) ***
        setSorting(currentSorting => {
            // Simple JSON compare works for this structure, but consider a deep-equal library for complex states
            if (JSON.stringify(currentSorting) !== JSON.stringify(newSorting)) {
                console.log("Syncing Sorting FROM URL:", newSorting); // Debug log
                return newSorting;
            }
            // If no change, return the existing state object
            return currentSorting;
        });
    }, [ searchParams, sortFieldParamName, sortDirParamName ]); // Depend only on URL params

    // --- Effect to Sync Search Input State FROM URL ---
    useEffect(() => {
        const currentSearch = searchParams.get(searchParamName) || '';
        // Only update if the URL value differs from the input's current value
        // This prevents the URL change (e.g., from DataTable clearing search) from overriding user typing
        if (searchInput !== currentSearch) {
            console.log("Syncing Search Input FROM URL:", currentSearch); // Debug log
            // Check if debounced search also matches - might indicate an external clear vs user typing
            // This logic might need refinement depending on exact desired behavior on external clears
            // For now, simply sync if different:
            setSearchInput(currentSearch);
        }
        // DO NOT add searchInput to dependencies here - it causes loops when typing.
    }, [ searchParams, searchParamName ]);


    // --- Parsed Filters (Derived directly from searchParams) ---
    const parsedFilters = useMemo<ExpenseFilters>(() => {
        const filters: ExpenseFilters = {};
        // console.log("Recalculating parsedFilters because searchParams changed:", searchParams.toString()); // Debug log

        // Status Filter
        const statusValue = searchParams.get(STATUS_PARAM);
        if (statusValue) {
            const validationResult = orderExpenseStatusTypesSchema.safeParse(statusValue);
            if (validationResult.success) {
                filters.status = validationResult.data;
            } else {
                console.warn(`Invalid status value found in URL: ${statusValue}`);
            }
        } else {
            filters.status = undefined;
        }

        // Other String Filters (Example)
        ExpenseFilterFields.options.forEach(key => {
            const value = searchParams.get(key);
            if (value === STATUS_PARAM || value === 'dateRange' || value === SEARCH_PARAM || value === DATE_FROM_PARAM || value === DATE_TO_PARAM) return;
            if (value !== null && value !== undefined) {
                type OtherFilterKey = Exclude<keyof ExpenseFilters, 'status' | 'dateRange' | 'search'>;
                filters[ key as OtherFilterKey ] = value;
            }
        });

        // Date Range Filter
        const dateFromStr = searchParams.get(DATE_FROM_PARAM);
        const dateToStr = searchParams.get(DATE_TO_PARAM);
        filters.dateRange = undefined;
        if (dateFromStr && dateToStr) {
            const fromDate = new Date(dateFromStr);
            const toDate = new Date(dateToStr);
            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime()) && fromDate <= toDate) {
                filters.dateRange = { from: fromDate, to: toDate };
            } else {
                console.warn("Invalid date range in URL parameters.");
                // Maybe clear invalid params here?
                // const newParams = new URLSearchParams(searchParams);
                // newParams.delete(DATE_FROM_PARAM);
                // newParams.delete(DATE_TO_PARAM);
                // router.replace(`${pathname}?${newParams.toString()}`);
            }
        }

        // console.log("Calculated Filters:", filters); // Debug log
        return filters;
    }, [ searchParams ]);


    // --- API Sort Parameters ---
    const getSortParamsForApi = (currentSorting: SortingState): ExpenseSort | undefined => {
        if (!currentSorting || currentSorting.length === 0) {
            return { field: 'createdAt', direction: 'desc' }; // Default sort
        }
        return {
            field: currentSorting[ 0 ].id as ExpenseSortFields,
            direction: currentSorting[ 0 ].desc ? 'desc' : 'asc'
        };
    };

    // --- API Query Parameters ---
    const apiQueryParams = useMemo(() => {
        const sortForApi = getSortParamsForApi(sorting); // Use state 'sorting'
        let filtersForApi: ExpenseFilters = { ...parsedFilters }; // Start with URL filters

        // Add debounced search term
        if (debouncedSearch) {
            filtersForApi.search = debouncedSearch;
        } else {
            filtersForApi.search = undefined;
        }

        // console.log("API Query Params:", { // Debug log
        //     page: pagination.pageIndex + 1,
        //     pageSize: pagination.pageSize,
        //     sort: sortForApi,
        //     filters: filtersForApi,
        // });

        return {
            page: pagination.pageIndex + 1, // Use state 'pagination'
            pageSize: pagination.pageSize, // Use state 'pagination'
            sort: sortForApi,
            filters: filtersForApi,
        };
    }, [ pagination, sorting, debouncedSearch, parsedFilters ]); // Correct dependencies

    // === TanStack Query ===
    const queryResult = useOrderExpenses(apiQueryParams);


    const handleRowClick = (order: EnrichedOrderExpenseSchemaType) => {
        // console.log("Row clicked in parent:", order);
    };

    return (
        // <div className="flex flex-col flex-grow min-h-0"> {/* Ensure container allows growth */}
            <div className="flex-grow min-h-0"> {/* DataTable container */}
                <DataTable
                    columns={expenseColumns}
                    data={queryResult.data?.data?.data ?? []}
                    pageCount={queryResult.data?.data?.pagination?.totalPages ?? -1}
                    rowCount={queryResult.data?.data?.pagination?.total ?? 0}
                    // Pass state derived from URL/useEffect
                    pagination={pagination}
                    sorting={sorting}
                    // Pass state updaters (these will trigger URL updates via DataTable's internal effect)
                    onPaginationChange={setPagination} // DataTable calls this, then updates URL
                    onSortingChange={setSorting}     // DataTable calls this, then updates URL
                    // Pass loading states
                    isLoading={queryResult.isLoading}
                    // Refined isFetching logic: Show fetching unless it's only due to typing in search
                    isFetching={queryResult.isFetching && (searchInput === debouncedSearch)}
                    isError={queryResult.isError}
                    error={queryResult.error}
                    // Other props
                    rowIdKey="orderExpenseId"
                    onRowClick={handleRowClick}
                    // Pass the specific URL param names for DataTable's internal URL updates
                    pageParamName={pageParamName}
                    pageSizeParamName={pageSizeParamName}
                    sortFieldParamName={sortFieldParamName}
                    sortDirParamName={sortDirParamName}
                    // If DataTable handles search input/clearing, pass the param name
                    // searchParamName={searchParamName} // Uncomment if DataTable needs it
                    selectParamName="selected"
                    viewParamName="view"
                />
            </div>
        // </div>
    );
}
