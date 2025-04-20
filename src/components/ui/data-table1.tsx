// src/components/data-table.tsx
'use client';
import React, { useEffect, useState, useTransition, useCallback, useMemo, useRef } from 'react';
import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    PaginationState, // Import PaginationState
    RowSelectionState,
    OnChangeFn, // Import OnChangeFn
} from '@tanstack/react-table';
import {
    ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Assuming UI components and utils are correctly imported
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Ensure this component exists
import PaginationControls from '@/components/ui/pagination-controls';


// --- Props Interface Update ---
interface DataTableProps<TData, TValue> {
    // ... existing props ...
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    rowCount: number;
    pagination: PaginationState;
    sorting: SortingState;
    onPaginationChange: OnChangeFn<PaginationState>;
    onSortingChange: OnChangeFn<SortingState>;
    initialRowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    isLoading: boolean;
    isFetching: boolean;
    isError?: boolean;
    error?: Error | null;
    rowIdKey: keyof TData;
    onRowClick?: (row: TData) => void;
    viewParamName?: string;
    selectParamName?: string;
    pageParamName?: string;
    pageSizeParamName?: string;
    sortFieldParamName?: string;
    sortDirParamName?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    rowCount,
    pagination, // Current pagination state from parent
    sorting,    // Current sorting state from parent
    onPaginationChange,
    onSortingChange, // Receive standard state update function
    initialRowSelection = {},
    onRowSelectionChange,
    isLoading,
    isFetching,
    isError,
    error,
    rowIdKey,
    onRowClick,
    viewParamName = 'view',
    selectParamName = 'selected',
    pageParamName = 'page',
    pageSizeParamName = 'pageSize',
    sortFieldParamName = 'sortField', // Default name for field
    sortDirParamName = 'sortDirection', // Default name for direction
}: DataTableProps<TData, TValue>) {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [ isPendingUrlUpdate, startUrlUpdateTransition ] = useTransition();

    // Store previous searchParams to detect external changes
    const prevSearchParamsRef = useRef<URLSearchParams>(searchParams);


    const [ rowSelection, setRowSelection ] = useState<RowSelectionState>(initialRowSelection);
    const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>({});

    const viewParam = searchParams.get(viewParamName);

    // --- Tanstack Table Instance (no change) ---
    const table = useReactTable({
        // ... configuration ...
        data,
        columns,
        pageCount,
        state: { pagination, sorting, rowSelection, columnVisibility },
        onPaginationChange, // Pass parent updater
        onSortingChange,    // Pass parent updater
        onRowSelectionChange: (updater) => { /* ... handle local/notify parent ... */
            setRowSelection(updater);
            if (onRowSelectionChange) onRowSelectionChange(updater);
        },
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

    // --- URL Update Logic (no change) ---
    const updateSearchParams = useCallback((newParams: Record<string, string | number | null>, options?: { replace?: boolean }) => {
        // ... same logic using startUrlUpdateTransition ...
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        Object.entries(newParams).forEach(([ key, value ]) => {
            if (value === null || value === undefined || value === '') {
                current.delete(key);
            } else {
                current.set(key, String(value));
            }
        });
        const search = current.toString();
        const query = search ? `?${search}` : '';
        const url = `${pathname}${query}`;

        startUrlUpdateTransition(() => {
            // Prefer replace for table state updates to avoid excessive history
            router.replace(url, { scroll: false });
        });
    }, [ searchParams, pathname, router ]);


    // *** UPDATED: Effect to Sync State -> Specific URL Params ***
    useEffect(() => {
        const paramsToUpdate: Record<string, string | null> = {};
        let needsUpdate = false;
        let forcePageReset = false; // Flag to indicate reset needed

        // --- Detect External Filter/Sort Changes ---
        // Compare current searchParams with the previous ones stored in ref
        // We only care if params *other than* pagination/selection/view changed externally
        const currentParamsString = searchParams.toString();
        const prevParamsString = prevSearchParamsRef.current.toString();

        if (currentParamsString !== prevParamsString) {
            const currentKeys = new Set(searchParams.keys());
            const prevKeys = new Set(prevSearchParamsRef.current.keys());

            // Check for changes in keys *not* managed directly by this effect's state dependencies
            // (i.e., ignore changes purely in page, pageSize, sortField, sortDir, select, view for this check)
            const managedKeys = new Set([
                pageParamName, pageSizeParamName, sortFieldParamName, sortDirParamName, selectParamName, viewParamName
            ]);

            let externalChangeDetected = false;
            // Check added/removed keys (excluding managed ones)
            for (const key of currentKeys) {
                if (!managedKeys.has(key) && !prevKeys.has(key)) {
                    externalChangeDetected = true; break;
                }
            }
            if (!externalChangeDetected) {
                for (const key of prevKeys) {
                    if (!managedKeys.has(key) && !currentKeys.has(key)) {
                        externalChangeDetected = true; break;
                    }
                }
            }
            // Check changed values for existing keys (excluding managed ones)
            if (!externalChangeDetected) {
                for (const key of currentKeys) {
                    if (!managedKeys.has(key) && prevKeys.has(key) && searchParams.get(key) !== prevSearchParamsRef.current.get(key)) {
                        externalChangeDetected = true; break;
                    }
                }
            }

            if (externalChangeDetected) {
                console.log("DataTable detected external param change, forcing page reset."); // Debug log
                forcePageReset = true;
            }

            // Update the ref *after* comparison for the next render
            prevSearchParamsRef.current = new URLSearchParams(searchParams.toString());
        }


        // --- Pagination Sync ---
        const currentPageInUrl = searchParams.get(pageParamName) ?? '1';
        // Use '1' if forcePageReset is true, otherwise use the component's state
        const desiredPage = forcePageReset ? '1' : String(pagination.pageIndex + 1);

        if (currentPageInUrl !== desiredPage) {
            paramsToUpdate[ pageParamName ] = desiredPage;
            needsUpdate = true;
        }

        const currentSizeInUrl = searchParams.get(pageSizeParamName) ?? '10';
        const desiredSize = String(pagination.pageSize);
        if (currentSizeInUrl !== desiredSize) {
            paramsToUpdate[ pageSizeParamName ] = desiredSize;
            // If size changes, *always* reset page unless already forced
            if (!forcePageReset && desiredPage !== '1') {
                paramsToUpdate[ pageParamName ] = '1';
                console.log("DataTable detected page size change, forcing page reset."); // Debug log
            }
            needsUpdate = true;
        }

        // --- Sorting Sync ---
        const currentFieldInUrl = searchParams.get(sortFieldParamName);
        const currentDirInUrl = searchParams.get(sortDirParamName);
        const desiredField = sorting.length > 0 ? sorting[ 0 ].id : null;
        const desiredIsDesc = sorting.length > 0 ? sorting[ 0 ].desc : null;
        let desiredDirParamValue: string | null = null;
        if (desiredField !== null) {
            desiredDirParamValue = desiredIsDesc === false ? 'asc' : null; // Only set 'asc', null implies desc or no sort
        }

        // Check if sorting *state* differs from URL
        const sortChanged = currentFieldInUrl !== desiredField || currentDirInUrl !== desiredDirParamValue;

        if (sortChanged) {
            paramsToUpdate[ sortFieldParamName ] = desiredField;
            paramsToUpdate[ sortDirParamName ] = desiredDirParamValue;
            // If sorting changes, *always* reset page unless already forced
            if (!forcePageReset && desiredPage !== '1') {
                paramsToUpdate[ pageParamName ] = '1';
                console.log("DataTable detected sort change, forcing page reset."); // Debug log
            }
            needsUpdate = true;
        }

        // --- Selection & View Sync (no change needed here) ---
        const currentSelectionInUrl = searchParams.get(selectParamName);
        const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[ id ]);
        const desiredSelection = selectedIds.join(',');
        if (currentSelectionInUrl !== desiredSelection && !(currentSelectionInUrl === null && desiredSelection === '')) {
            paramsToUpdate[ selectParamName ] = desiredSelection === '' ? null : desiredSelection;
            needsUpdate = true;
        }
        const currentViewInUrl = searchParams.get(viewParamName);
        if (selectedIds.length > 1 && currentViewInUrl) {
            paramsToUpdate[ viewParamName ] = null;
            needsUpdate = true;
        }
        // ...

        // --- Update URL if needed ---
        if (needsUpdate) {
            // Preserve existing params not actively being changed (simplified)
            const existingUnchanged: Record<string, string | null> = {};
            searchParams.forEach((value, key) => {
                if (!(key in paramsToUpdate)) {
                    existingUnchanged[ key ] = value;
                }
            });

            // Ensure view param isn't wrongly preserved if cleared by multi-select
            if (paramsToUpdate[ viewParamName ] === null && viewParamName in existingUnchanged) {
                delete existingUnchanged[ viewParamName ];
            }

            console.log("DataTable updating URL with:", { ...existingUnchanged, ...paramsToUpdate }); // Debug log
            updateSearchParams({ ...existingUnchanged, ...paramsToUpdate }, { replace: true });
        }

    }, [
        pagination, sorting, rowSelection, // Watch controlled and local state
        searchParams, // Watch current searchParams for comparison trigger
        updateSearchParams,
        pageParamName, pageSizeParamName, sortFieldParamName, sortDirParamName,
        selectParamName, viewParamName
    ]);

    // --- Handler for Row Click (logic remains same, updates URL view param) ---
    const handleRowClickInternal = (row: TData) => { /* ... same as before ... */
        const rowId = String(row[ rowIdKey ]);
        const params: Record<string, string | null> = {};
        if (viewParam === rowId) {
            params[ viewParamName ] = null;
        } else {
            params[ viewParamName ] = rowId;
            params[ selectParamName ] = null;
            setRowSelection({});
            if (onRowSelectionChange) onRowSelectionChange({});
        }
        updateSearchParams(params, { replace: true }); // Update view param URL
        if (onRowClick) onRowClick(row);
    };

    // --- Render Logic (no changes needed from previous local state version) ---
    const checkboxState = () => {
        if (table.getIsAllPageRowsSelected()) return true
        if (table.getIsSomePageRowsSelected()) return 'indeterminate'
        return false
    }    // ... uses isLoading, isFetching, data, props etc. ...
    // ... Table structure ...
    // ... Pagination controls using table.setPageIndex, table.previousPage etc ...

    return (
        <div className="flex flex-col h-full w-full  rounded-lg border  overflow-hidden">
            {/* Table Container */}
            <div className="flex-grow relative overflow-hidden">
                {/* Loading State Overlay */}
                {isLoading && ( /* Based on prop */
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <LoadingSpinner className="h-10 w-10 text-primary" />
                    </div>
                )}

                {/* Inner Scrollable Area */}
                <div className="h-full overflow-auto bg-slate-50 rounded-b-lg">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id} className="border-b">
                                    <TableHead className="w-[40px] px-2">
                                        <Checkbox /* ... select all props ... */
                                            // checked={table.getIsAllPageRowsSelected()}
                                            checked={checkboxState()}
                                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                        />
                                    </TableHead>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                                            {/* ... Sort Button ... */}
                                            {header.isPlaceholder ? null : (
                                                <Button variant="ghost" onClick={header.column.getToggleSortingHandler()} disabled={!header.column.getCanSort()} /* ... className ... */>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && <ArrowUpDown /* ... className ... */ />}
                                                </Button>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody
                            className={cn(
                                !isLoading && isFetching && "opacity-60 blur-[1px] transition-opacity duration-300 pointer-events-none",
                                !isFetching && "pointer-events-auto"
                            )}
                        >
                            {/* Error Row */}
                            {isError && ( /* Based on prop */
                                <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center text-destructive">Error: {error?.message || 'Unknown'}</TableCell></TableRow>
                            )}

                            {/* Data Rows / No Results */}
                            {!isError && !isLoading && (
                                data.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                            onClick={() => handleRowClickInternal(row.original)} // Use internal handler
                                            className={cn(
                                                "cursor-pointer h-[48px]",
                                                "data-[state=selected]:bg-muted",
                                                "hover:bg-muted/50",
                                                viewParam === row.id && "bg-accent/50 hover:bg-accent/60 data-[state=selected]:bg-accent/60" // Highlight based on URL viewParam still
                                            )}
                                        >
                                            {/* Selection Cell */}
                                            <TableCell className="px-2">
                                                <Checkbox
                                                    checked={row.getIsSelected()}
                                                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label="Select row"
                                                />
                                            </TableCell>
                                            {/* Data Cells */}
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">No results found.</TableCell></TableRow>
                                )
                            )}
                            {/* Optional: Empty space filler */}
                            {(isLoading || (isFetching && data.length === 0)) && !isError && (
                                <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center"></TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* ... Pagination Controls Component ... */}
            <div className="p-2 flex w-full justify-center min-w-0">
                <PaginationControls<TData>
                    currentPage={table.getState().pagination.pageIndex + 1}
                    totalPages={table.getPageCount()}
                    pageSize={table.getState().pagination.pageSize}
                    total={table.getRowCount()}
                    table={table}
                    selectedRows={table.getFilteredSelectedRowModel().rows.length}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
