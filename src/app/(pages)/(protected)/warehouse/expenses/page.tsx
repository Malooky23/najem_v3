// src/app/(pages)/(protected)/warehouse/expenses/page.tsx
'use client';

import React, {
    useState, useEffect, useMemo, useCallback, Suspense,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RowSelectionState, type PaginationState, type SortingState } from '@tanstack/react-table';
import { z } from 'zod';
import { useDebounce } from 'use-debounce';
import { type DateRange } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns'; // Import parse and isValid

import ExpenseHeader from './components/ExpenseHeader';
import { ExpensesTable } from './components/table/ExpensesTable';
import { orderExpenseStatusTypesSchema } from '@/server/db/schema'; // Ensure path is correct
import { type ExpenseFilters } from '@/types/expense'; // Import the type

// --- URL Parameter Names (Constants) ---
const PAGE_PARAM = 'page';
const PAGE_SIZE_PARAM = 'pageSize';
const SORT_FIELD_PARAM = 'sortField';
const SORT_DIR_PARAM = 'sortDirection';
const SEARCH_PARAM = 'search';
const STATUS_PARAM = 'status';
const DATE_FROM_PARAM = 'dateFrom';
const DATE_TO_PARAM = 'dateTo';
const VIEW_PARAM = 'view';
const ORDER_NUMBER_PARAM = 'orderNumber';
const CUSTOMER_ID_PARAM = 'customerId';
const EXPENSE_ITEM_PARAM = 'expenseItem';
const DATE_FORMAT = 'yyyy-MM-dd'; // Define consistent date format

// --- Helper Functions ---
const safeParseInt = (val: string | null | undefined, defaultVal: number): number => {
    if (val === null || val === undefined) return defaultVal;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) || parsed < 1 ? defaultVal : parsed;
};

const parseSortingParams = (
    fieldParam: string | null,
    dirParam: string | null | undefined,
): SortingState => {
    if (!fieldParam) {
        return [ { id: 'createdAt', desc: true } ]; // Default sort
    }
    const isDesc = dirParam !== 'asc';
    return [ { id: fieldParam, desc: isDesc } ];
};

const formatSortingForUrl = (sorting: SortingState): { [ key: string ]: string | null } => {
    if (sorting.length > 0) {
        const sort = sorting[ 0 ];
        return {
            [ SORT_FIELD_PARAM ]: sort.id,
            [ SORT_DIR_PARAM ]: sort.desc === false ? 'asc' : null,
        };
    }
    return {
        [ SORT_FIELD_PARAM ]: null,
        [ SORT_DIR_PARAM ]: null,
    };
};

const parseStatusParam = (statusParam: string | null): z.infer<typeof orderExpenseStatusTypesSchema> | null => {
    if (!statusParam) return null;
    const validationResult = orderExpenseStatusTypesSchema.safeParse(statusParam);
    if (validationResult.success) {
        return validationResult.data;
    }
    console.warn(`Invalid status value found in URL: ${statusParam}`);
    return null;
};

// Helper to parse date from URL param (e.g., 'yyyy-MM-dd')
const parseDateParam = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    try {
        // Use date-fns parse for better control over format
        const parsedDate = parse(dateStr, DATE_FORMAT, new Date());
        if (isValid(parsedDate)) {
            return parsedDate;
        }
        console.warn(`Invalid date format found in URL param: ${dateStr}`);
        return null;
    } catch (error) {
        console.error(`Error parsing date string "${dateStr}":`, error);
        return null;
    }
};

export default function ExpensesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // === State Initialization (Read ONCE from URL) ===
    const initialPagination = useMemo<PaginationState>(() => {
        const page = safeParseInt(searchParams.get(PAGE_PARAM), 1);
        const pageSize = safeParseInt(searchParams.get(PAGE_SIZE_PARAM), 20);
        return { pageIndex: page - 1, pageSize };
    }, []); // Run once

    const initialSorting = useMemo<SortingState>(() => parseSortingParams(
        searchParams.get(SORT_FIELD_PARAM),
        searchParams.get(SORT_DIR_PARAM),
    ), []); // Run once

    const initialSearch = useMemo(() => searchParams.get(SEARCH_PARAM) || '', []);
    const initialOrderNumber = useMemo(() => searchParams.get(ORDER_NUMBER_PARAM) || '', []);
    const initialCustomerId = useMemo(() => searchParams.get(CUSTOMER_ID_PARAM) || '', []);
    const initialExpenseItemName = useMemo(() => searchParams.get(EXPENSE_ITEM_PARAM) || '', []);
    const initialDateFrom = useMemo(() => parseDateParam(searchParams.get(DATE_FROM_PARAM)), []); // Use safe parser
    const initialDateTo = useMemo(() => parseDateParam(searchParams.get(DATE_TO_PARAM)), []); // Use safe parser
    const initialViewId = useMemo(() => searchParams.get(VIEW_PARAM) || null, []);
    const initialStatus = useMemo(() => parseStatusParam(searchParams.get(STATUS_PARAM)), []); // Run once

    // === Component State (Single Source of Truth) ===
    const [ pagination, setPagination ] = useState<PaginationState>(initialPagination);
    const [ sorting, setSorting ] = useState<SortingState>(initialSorting);
    const [ searchInput, setSearchInput ] = useState(initialSearch); // Raw input state
    const [ viewId, setViewId ] = useState<string | null>(initialViewId);
    const [ status, setStatus ] = useState<z.infer<typeof orderExpenseStatusTypesSchema> | null>(initialStatus);
    const [ orderNumber, setOrderNumber ] = useState(initialOrderNumber);
    const [ customerId, setCustomerId ] = useState(initialCustomerId);
    const [ expenseItemName, setExpenseItemName ] = useState(initialExpenseItemName);
    const [ dateFrom, setDateFrom ] = useState<Date | null>(initialDateFrom); // State holds Date or null
    const [ dateTo, setDateTo ] = useState<Date | null>(initialDateTo); // State holds Date or null

    const [ orderNumberDEBOUNCED ] = useDebounce(orderNumber, 500)
    // Derived state for filtering (passed to children)
    const currentState = useMemo<ExpenseFilters>(() => {
        let dateRange: DateRange | undefined;

        // Only create range if both dates are valid Date objects
        if (dateFrom && dateTo) {
            dateRange = { from: dateFrom, to: dateTo };
        }
        // console.log("currentState: ",{
        //     status: status || '',
        //     orderNumber: orderNumber || undefined, // Use undefined if empty string means 'not set'
        //     dateRange,
        //     customerId: customerId || undefined,
        //     expenseItemName: expenseItemName || undefined,
        // })

        return {
            status: status || '', // Use '' to represent 'all' statuses
            orderNumber: orderNumber || undefined, // Use undefined if empty string means 'not set'
            dateRange, // Pass Date objects directly
            customerId: customerId || undefined,
            expenseItemName: expenseItemName || undefined,
        };
    }, [ status, orderNumber, dateFrom, dateTo, customerId, expenseItemName ]);

    const [ debouncedSearchForUrl ] = useDebounce(searchInput, 500);

    // === URL Update Function ===
    const updateUrlParams = useCallback((newParams: Record<string, string | number | null>, resetPage: boolean = false) => {
        const current = new URLSearchParams(searchParams.toString()); // Get fresh params
        let changed = false;

        Object.entries(newParams).forEach(([ key, value ]) => {
            const currentValue = current.get(key);
            const newValue = (value === null || value === undefined || value === '') ? null : String(value);

            if (currentValue !== newValue) {
                if (newValue === null) {
                    current.delete(key);
                } else {
                    current.set(key, newValue);
                }
                changed = true;
            }
        });

        if (resetPage && current.get(PAGE_PARAM) !== '1') {
            if (safeParseInt(current.get(PAGE_PARAM), 1) !== 1) {
                current.set(PAGE_PARAM, '1');
                changed = true;
                // No need to setPagination here, the effect will sync it
            }
        }

        if (changed) {
            const search = current.toString();
            // Using replace to avoid polluting browser history
            router.replace(`${pathname}?${search}`, { scroll: false });
        }
    }, [ pathname, router, searchParams ]); // Depends on router/pathname for navigation, searchParams TO GET LATEST

    // === Effect to Sync State -> URL ===
    useEffect(() => {
        const paramsToUpdate: Record<string, string | number | null> = {};

        // Format state values for URL comparison and update
        const formattedDateFrom = dateFrom ? format(dateFrom, DATE_FORMAT) : null;
        const formattedDateTo = dateTo ? format(dateTo, DATE_FORMAT) : null;
        const sortParams = formatSortingForUrl(sorting);

        // paramsToUpdate[ PAGE_PARAM ] = pagination.pageIndex + 1;
        // Set page param to null if pageIndex is 0 (page 1), otherwise set to pageIndex + 1
        paramsToUpdate[ PAGE_PARAM ] = pagination.pageIndex === 0 ? null : pagination.pageIndex + 1;
        paramsToUpdate[ PAGE_SIZE_PARAM ] = pagination.pageSize === 20 ? null : pagination.pageSize;
        paramsToUpdate[ SORT_FIELD_PARAM ] = sortParams[ SORT_FIELD_PARAM ] === 'createdAt' ? null : sortParams[ SORT_FIELD_PARAM ];
        paramsToUpdate[ SORT_DIR_PARAM ] = sortParams[ SORT_DIR_PARAM ];
        paramsToUpdate[ SEARCH_PARAM ] = debouncedSearchForUrl || null;
        paramsToUpdate[ VIEW_PARAM ] = viewId || null;
        paramsToUpdate[ STATUS_PARAM ] = status || null;
        paramsToUpdate[ ORDER_NUMBER_PARAM ] = orderNumberDEBOUNCED || null;
        paramsToUpdate[ CUSTOMER_ID_PARAM ] = customerId || null;
        paramsToUpdate[ EXPENSE_ITEM_PARAM ] = expenseItemName || null;
        paramsToUpdate[ DATE_FROM_PARAM ] = formattedDateFrom;
        paramsToUpdate[ DATE_TO_PARAM ] = formattedDateTo;

        // Compare state-derived params with current URL and update if needed
        const current = new URLSearchParams(searchParams.toString());
        let needsUrlUpdate = false;

        Object.entries(paramsToUpdate).forEach(([ key, stateValue ]) => {
            const urlValue = current.get(key);
            const formattedStateValue = (stateValue === null || stateValue === undefined) ? null : String(stateValue);

            // --- Prevent adding default values to URL ---
            // Page 1
            if (key === PAGE_PARAM && formattedStateValue === '1' && urlValue === null) return;
            // Default Page Size
            if (key === PAGE_SIZE_PARAM && formattedStateValue === String(initialPagination.pageSize) && urlValue === null) return;
            // Empty Search
            if (key === SEARCH_PARAM && formattedStateValue === null && (urlValue === null || urlValue === '')) return;
            // Null View
            if (key === VIEW_PARAM && formattedStateValue === null && urlValue === null) return;
            // Null Status
            if (key === STATUS_PARAM && formattedStateValue === null && urlValue === null) return;
            // Null Order Number
            if (key === ORDER_NUMBER_PARAM && formattedStateValue === null && (urlValue === null || urlValue === '')) return;
            // Null Customer ID
            if (key === CUSTOMER_ID_PARAM && formattedStateValue === null && (urlValue === null || urlValue === '')) return;
            // Null Expense Item
            if (key === EXPENSE_ITEM_PARAM && formattedStateValue === null && (urlValue === null || urlValue === '')) return;
            // Null Dates
            if (key === DATE_FROM_PARAM && formattedStateValue === null && urlValue === null) return;
            if (key === DATE_TO_PARAM && formattedStateValue === null && urlValue === null) return;
            // Default Sort
            const defaultSortParams = formatSortingForUrl(initialSorting);
            if (key === SORT_FIELD_PARAM && formattedStateValue === defaultSortParams[ SORT_FIELD_PARAM ] && urlValue === null) return;
            if (key === SORT_DIR_PARAM && formattedStateValue === defaultSortParams[ SORT_DIR_PARAM ] && urlValue === null) return;
            // --- End Default Value Checks ---

            if (urlValue !== formattedStateValue) {
                needsUrlUpdate = true;
            }
        });

        // Also check if URL has params that are no longer in the state (e.g., cleared filter)
        for (const key of current.keys()) {
            if (!(key in paramsToUpdate) || paramsToUpdate[ key ] === null) {
                // Exception for default params that shouldn't be removed if state matches default
                if (key === PAGE_PARAM && pagination.pageIndex === 0) continue;
                if (key === PAGE_SIZE_PARAM && pagination.pageSize === initialPagination.pageSize) continue;
                const defaultSortParams = formatSortingForUrl(initialSorting);
                if (key === SORT_FIELD_PARAM && sorting[ 0 ]?.id === defaultSortParams[ SORT_FIELD_PARAM ]) continue;
                if (key === SORT_DIR_PARAM && (sorting[ 0 ]?.desc !== false ? null : 'asc') === defaultSortParams[ SORT_DIR_PARAM ]) continue;
                // Add similar checks for other potentially defaulted params if needed

                if (paramsToUpdate[ key ] === null) { // Only consider removal if state is truly null/empty
                    needsUrlUpdate = true;
                    break;
                }
            }
        }


        if (needsUrlUpdate) {
            // Update URL without resetting page from here, handlers manage page reset
            updateUrlParams(paramsToUpdate, false);
        }
    }, [
        pagination, sorting, debouncedSearchForUrl, viewId, status, orderNumberDEBOUNCED, customerId, expenseItemName, dateFrom, dateTo, // State values
        updateUrlParams, searchParams, // URL related
        initialPagination.pageSize, initialSorting, // Initial defaults for comparison
    ]);


    const handleStatusChange = useCallback((newStatus: z.infer<typeof orderExpenseStatusTypesSchema> | null) => {
        setStatus(newStatus);
        setPagination(p => ({ ...p, pageIndex: 0 })); // Reset page
    }, []);

    // === Handlers ===
    const handleSortingChange = useCallback((updater: React.SetStateAction<SortingState>) => {
        setSorting(updater); // Functional update is safe
        setPagination((p) => ({ ...p, pageIndex: 0 })); // Reset page
    }, []); // No dependencies needed for functional updates + reset

    const handlePaginationChange = useCallback((updater: React.SetStateAction<PaginationState>) => {
        setPagination((currentPagination) => {
            const newState = typeof updater === 'function' ? updater(currentPagination) : updater;
            // Reset page only if page size changes
            const pageSizeChanged = newState.pageSize !== currentPagination.pageSize;
            return pageSizeChanged ? { ...newState, pageIndex: 0 } : newState;
        });
    }, []); // No dependencies needed for functional updates

    const handleViewChange = useCallback((newViewId: string | null) => {
        setViewId(newViewId);
        // Optionally reset page if view changes imply different data sets
        // setPagination(p => ({ ...p, pageIndex: 0 }));
    }, []);

    // Raw search input handler
    const handleSearchInputChange = useCallback((value: string) => {
        setSearchInput(value);
        setPagination((p) => ({ ...p, pageIndex: 0 })); // Reset page on new search term
    }, []);

    // Handler for the main filter component/form
    const handleFilterChange = useCallback((filters: Partial<ExpenseFilters>) => {
        // Update state based on incoming filters
        // Use functional updates for pagination to ensure reset happens correctly
        let shouldResetPage = false;

        if (filters.status !== undefined) {
            const newStatus = filters.status === '' ? null : filters.status;
            if (status !== newStatus) {
                setStatus(newStatus);
                shouldResetPage = true;
            }
        }
        if (filters.orderNumber !== undefined) {
            if (orderNumber !== filters.orderNumber) {
                setOrderNumber(filters.orderNumber)
                shouldResetPage = true;
            }
        }
        if (filters.customerId !== undefined) {
            if (customerId !== filters.customerId) {
                setCustomerId(filters.customerId);
                shouldResetPage = true;
            }
        }
        if (filters.expenseItemName !== undefined) {
            if (expenseItemName !== filters.expenseItemName) {
                setExpenseItemName(filters.expenseItemName);
                shouldResetPage = true;
            }
        }
        // Handle date range changes
        const newDateFrom = filters.dateRange?.from ?? null;
        const newDateTo = filters.dateRange?.to ?? null;
        if (dateFrom?.getTime() !== newDateFrom?.getTime()) { // Compare date timestamps
            setDateFrom(newDateFrom);
            shouldResetPage = true;
        }
        if (dateTo?.getTime() !== newDateTo?.getTime()) { // Compare date timestamps
            setDateTo(newDateTo);
            shouldResetPage = true;
        }

        if (shouldResetPage) {
            setPagination((p) => ({ ...p, pageIndex: 0 }));
        }
    }, [ status, orderNumberDEBOUNCED, customerId, expenseItemName, dateFrom, dateTo ]); // Depend on current filter values for comparison

    // Handler to clear all filters, search, sorting and reset pagination/view
    const handleClearAll = useCallback(() => {
        setSorting(initialSorting);
        setPagination(initialPagination); // Resets pageIndex and pageSize
        setSearchInput(''); // Clear raw input
        setStatus(null);
        setViewId(null);
        setOrderNumber('');
        setCustomerId('');
        setExpenseItemName('');
        setDateFrom(null);
        setDateTo(null);
    }, [ initialSorting, initialPagination ]); // Depend on initial states

    // console.log("Rendering ExpensesPage. Current State for Table:", currentState);
    // console.log("Current URL Search Params:", searchParams.toString());

    const [ rowSelection, setRowSelection ] = useState<RowSelectionState>({})
    Object.keys(rowSelection).map((key, index) => console.log([ index, key ]))

    return (
        // Use a container that allows vertical scrolling if content exceeds viewport
        <div className="px-4 h-[100vh] flex flex-col overflow-clip ">
            {/* Header remains fixed */}
            <ExpenseHeader
                currentStatus={status}
                onStatusChange={handleStatusChange}
                currentSearch={searchInput}
                onSearchChange={handleSearchInputChange}
                onClearAll={handleClearAll}
                currentState={currentState}
                onFilterChange={handleFilterChange}
                rowSelection={rowSelection}

            />

            {/* Table takes remaining space and scrolls internally if needed */}
            {/* Using Suspense is fine, but ensure ExpensesTable itself handles loading states */}
            <ExpensesTable
                // Pass state down
                pagination={pagination}
                sorting={sorting}
                viewId={viewId}
                searchInput={debouncedSearchForUrl} // Pass DEBOUNCED search value to table
                // Pass filters derived from component state
                currentState={{
                    status: currentState.status === null ? "" : currentState.status, // Pass null if '' means 'all'
                    orderNumber: currentState.orderNumber,
                    customerId: currentState.customerId,
                    expenseItemName: currentState.expenseItemName,
                    // Pass Date objects or undefined for date range
                    dateRange: currentState.dateRange ? {
                        from: currentState.dateRange.from ?? undefined,
                        to: currentState.dateRange.to ?? undefined
                    } : undefined,
                }}

                statusFilter={currentState.status === "" ? null : currentState.status === undefined ? null : currentState.status}
                dateFilter={currentState.dateRange ? {
                    from: currentState.dateRange.from ?? undefined,
                    to: currentState.dateRange.to ?? undefined
                } : undefined}

                // Pass handlers down
                onPaginationChange={handlePaginationChange}
                onSortingChange={handleSortingChange}
                onViewChange={handleViewChange} // If table controls view
                setRowSelection={setRowSelection}


            />
        </div>
    );
}