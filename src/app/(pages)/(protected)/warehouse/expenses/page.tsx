// src/app/(pages)/(protected)/warehouse/expenses/page.tsx
'use client'; // Make it a client component

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { z } from 'zod';

import ExpenseHeader from "./components/ExpenseHeader";
import { ExpensesTable } from "./components/table/ExpensesTable";
import { orderExpenseStatusTypesSchema } from '@/server/db/schema';

// --- URL Parameter Names (Constants) ---
const PAGE_PARAM = 'page';
const PAGE_SIZE_PARAM = 'pageSize';
const SORT_FIELD_PARAM = 'sortField';
const SORT_DIR_PARAM = 'sortDirection';
const SEARCH_PARAM = 'search';
const STATUS_PARAM = 'status';
const DATE_FROM_PARAM = 'dateFrom'; // Keep if date filtering exists
const DATE_TO_PARAM = 'dateTo';     // Keep if date filtering exists
const VIEW_PARAM = 'view';

// --- Helper Functions (Copied from ExpensesTable) ---
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
        return [ { id: 'createdAt', desc: true } ]; // Default sort
    }
    const isDesc = dirParam !== 'asc';
    return [ { id: fieldParam, desc: isDesc } ];
};

const formatSortingForUrl = (sorting: SortingState): { [key: string]: string | null } => {
    if (sorting.length > 0) {
        const sort = sorting[0];
        return {
            [SORT_FIELD_PARAM]: sort.id,
            [SORT_DIR_PARAM]: sort.desc === false ? 'asc' : null,
        };
    }
    return {
        [SORT_FIELD_PARAM]: null,
        [SORT_DIR_PARAM]: null,
    };
};

// Helper to parse status from URL
const parseStatusParam = (statusParam: string | null): z.infer<typeof orderExpenseStatusTypesSchema> | null => {
    if (!statusParam) return null;
    const validationResult = orderExpenseStatusTypesSchema.safeParse(statusParam);
    if (validationResult.success) {
        return validationResult.data;
    }
    console.warn(`Invalid status value found in URL: ${statusParam}`);
    return null; // Treat invalid status as null (or handle differently)
};

export default function ExpensesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // === State Initialization (Read ONCE from URL) ===
    const initialPagination = useMemo<PaginationState>(() => {
        const page = safeParseInt(searchParams.get(PAGE_PARAM), 1);
        const pageSize = safeParseInt(searchParams.get(PAGE_SIZE_PARAM), 10);
        return { pageIndex: page - 1, pageSize };
    }, []); // Run once

    const initialSorting = useMemo<SortingState>(() =>
        parseSortingParams(
            searchParams.get(SORT_FIELD_PARAM),
            searchParams.get(SORT_DIR_PARAM)
        )
    , []); // Run once

    const initialSearch = useMemo(() => searchParams.get(SEARCH_PARAM) || '', []);
    const initialViewId = useMemo(() => searchParams.get(VIEW_PARAM) || null, []);
    const initialStatus = useMemo(() => parseStatusParam(searchParams.get(STATUS_PARAM)), []); // Run once

    // === Component State (Single Source of Truth) ===
    const [ pagination, setPagination ] = useState<PaginationState>(initialPagination);
    const [ sorting, setSorting ] = useState<SortingState>(initialSorting);
    const [ searchInput, setSearchInput ] = useState(initialSearch); // Raw input state
    const [ viewId, setViewId ] = useState<string | null>(initialViewId);
    const [ status, setStatus ] = useState<z.infer<typeof orderExpenseStatusTypesSchema> | null>(initialStatus);
    // Add state for date range if needed

    // Note: Debouncing is handled within ExpensesTable now for the API query.
    // We sync the raw searchInput to the URL here.

    // === URL Update Function ===
    const updateUrlParams = useCallback((newParams: Record<string, string | number | null>, resetPage: boolean = false) => {
        const current = new URLSearchParams(searchParams.toString());
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
            current.set(PAGE_PARAM, '1');
            changed = true;
            // Update pagination state directly when resetting page via URL update
            setPagination(p => ({ ...p, pageIndex: 0 }));
        }

        if (changed) {
            const search = current.toString();
            const url = `${pathname}?${search}`;
            router.replace(url, { scroll: false });
        }
    }, [ searchParams, pathname, router ]);

    // === Effect to Sync State -> URL ===
    useEffect(() => {
        const paramsToUpdate: Record<string, string | number | null> = {};

        paramsToUpdate[PAGE_PARAM] = pagination.pageIndex + 1;
        paramsToUpdate[PAGE_SIZE_PARAM] = pagination.pageSize;
        const sortParams = formatSortingForUrl(sorting);
        paramsToUpdate[SORT_FIELD_PARAM] = sortParams[SORT_FIELD_PARAM];
        paramsToUpdate[SORT_DIR_PARAM] = sortParams[SORT_DIR_PARAM];
        paramsToUpdate[SEARCH_PARAM] = searchInput || null; // Sync raw search input
        paramsToUpdate[VIEW_PARAM] = viewId || null;
        paramsToUpdate[STATUS_PARAM] = status || null;
        // Add date range params if needed

        // Compare state-derived params with current URL and update if needed
        const current = new URLSearchParams(searchParams.toString());
        let needsUrlUpdate = false;

        Object.entries(paramsToUpdate).forEach(([key, stateValue]) => {
            const urlValue = current.get(key);
            const formattedStateValue = (stateValue === null || stateValue === undefined) ? null : String(stateValue);

            // Add checks for default values vs null URL params if necessary (similar to previous version)
            // Example: Page 1 vs null
            if (key === PAGE_PARAM && formattedStateValue === '1' && urlValue === null) return;
            // Example: Default Page Size vs null
            if (key === PAGE_SIZE_PARAM && formattedStateValue === String(initialPagination.pageSize) && urlValue === null) return;
            // Example: Empty Search vs null
            if (key === SEARCH_PARAM && formattedStateValue === null && urlValue === null) return;
            // Example: Null View vs null
            if (key === VIEW_PARAM && formattedStateValue === null && urlValue === null) return;
            // Example: Null Status vs null
            if (key === STATUS_PARAM && formattedStateValue === null && urlValue === null) return;
            // Example: Default Sort vs null
            const defaultSortParams = formatSortingForUrl(initialSorting);
            if (key === SORT_FIELD_PARAM && formattedStateValue === defaultSortParams[SORT_FIELD_PARAM] && urlValue === null) return;
            if (key === SORT_DIR_PARAM && formattedStateValue === defaultSortParams[SORT_DIR_PARAM] && urlValue === null) return;

            if (urlValue !== formattedStateValue) {
                needsUrlUpdate = true;
            }
        });

        if (needsUrlUpdate) {
            updateUrlParams(paramsToUpdate, false); // Don't reset page from this effect
        }

    }, [ pagination, sorting, searchInput, viewId, status, searchParams, updateUrlParams, initialPagination.pageSize, initialSorting ]); // Watch all state affecting URL

    // === Handlers ===
    const handleSortingChange = useCallback((updater: React.SetStateAction<SortingState>) => {
        const newState = typeof updater === 'function' ? updater(sorting) : updater;
        setSorting(newState);
        setPagination(p => ({ ...p, pageIndex: 0 })); // Reset page
    }, [sorting]); // Include sorting in dependency if updater function uses it

    const handlePaginationChange = useCallback((updater: React.SetStateAction<PaginationState>) => {
        setPagination(currentPagination => {
            const newState = typeof updater === 'function' ? updater(currentPagination) : updater;
            const pageSizeChanged = newState.pageSize !== currentPagination.pageSize;
            return pageSizeChanged ? { ...newState, pageIndex: 0 } : newState; // Reset page on size change
        });
    }, []);

    const handleViewChange = useCallback((newViewId: string | null) => {
        setViewId(newViewId);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
        setPagination(p => ({ ...p, pageIndex: 0 })); // Reset page
    }, []);

    const handleStatusChange = useCallback((newStatus: z.infer<typeof orderExpenseStatusTypesSchema> | null) => {
        setStatus(newStatus);
        setPagination(p => ({ ...p, pageIndex: 0 })); // Reset page
    }, []);

    // Handler to clear filters/search/sorting and reset pagination/view
    const handleClearAll = useCallback(() => {
        setSorting(initialSorting);
        setPagination(initialPagination);
        setSearchInput('');
        setStatus(null);
        setViewId(null);
        // Add date range reset if needed
        // The useEffect will sync these state resets to the URL
    }, [initialSorting, initialPagination]); // Depend on initial states

    return (
        <div className="px-4 h-[100vh] flex flex-col overflow-clip ">
            {/* Wrap potentially client-only components in Suspense if needed */}
            <Suspense fallback={<div>Loading Header...</div>}>
                <ExpenseHeader
                    currentStatus={status}
                    onStatusChange={handleStatusChange}
                    currentSearch={searchInput}
                    onSearchChange={handleSearchChange}
                    onClearAll={handleClearAll}
                />
            </Suspense>

            <Suspense fallback={<div>Loading Table...</div>}>
                <ExpensesTable
                    // Pass state down
                    pagination={pagination}
                    sorting={sorting}
                    viewId={viewId}
                    searchInput={searchInput} // Pass raw search for debouncing inside table
                    statusFilter={status} // Pass parsed status
                    // Pass date filters if needed

                    // Pass handlers down
                    onPaginationChange={handlePaginationChange}
                    onSortingChange={handleSortingChange}
                    onViewChange={handleViewChange}
                />
            </Suspense>
        </div>
    );
}
