// src/components/data-table.tsx
'use client';
import React, { useEffect, useState, useTransition, useCallback, useMemo } from 'react';
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
    // ... (data, columns, pageCount, rowCount, pagination, onPaginationChange props remain) ...
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    rowCount: number;
    pagination: PaginationState;
    sorting: SortingState; // Still receive the standard SortingState object
    onPaginationChange: OnChangeFn<PaginationState>;
    onSortingChange: OnChangeFn<SortingState>; // Still receive standard updates

    // ... (selection, loading, error, row handling props remain) ...
    initialRowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    isLoading: boolean;
    isFetching: boolean;
    isError?: boolean;
    error?: Error | null;
    rowIdKey: keyof TData;
    onRowClick?: (row: TData) => void;

    // *** UPDATED: Specific URL Sync parameters ***
    viewParamName?: string;
    selectParamName?: string;
    pageParamName?: string;
    pageSizeParamName?: string;
    sortFieldParamName?: string; // New: Name for the field parameter
    sortDirParamName?: string;   // New: Name for the direction parameter
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    rowCount,
    pagination,
    sorting, // Receive standard SortingState [{ id: 'field', desc: true/false }]
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

    const [ rowSelection, setRowSelection ] = useState<RowSelectionState>(initialRowSelection);
    const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>({});

    const viewParam = searchParams.get(viewParamName);

    // --- Tanstack Table Instance (no major change needed here) ---
    const table = useReactTable({
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
        enableRowSelection: true,
        getRowId: (row) => String(row[ rowIdKey ]),
    });

    // --- URL Update Logic (no change needed) ---
    const updateSearchParams = useCallback((newParams: Record<string, string | number | null>, options?: { replace?: boolean }) => {
        // ... (same as before, uses startUrlUpdateTransition) ...
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

        // Use transition for URL updates
        startUrlUpdateTransition(() => {
            if (options?.replace) {
                router.replace(url, { scroll: false });
            } else {
                // Generally prefer replace for table state updates to avoid excessive history
                router.replace(url, { scroll: false });
                // router.push(url, { scroll: false }); // Use push only if specific history entry is desired
            }
        });
    }, [ searchParams, pathname, router ]);


    // *** UPDATED: Effect to Sync State -> Specific URL Params ***
    useEffect(() => {
        const paramsToUpdate: Record<string, string | null> = {};
        let needsUpdate = false;

        // --- Pagination Sync (same as before) ---
        const currentPageInUrl = searchParams.get(pageParamName) ?? '1';
        const desiredPage = String(pagination.pageIndex + 1);
        if (currentPageInUrl !== desiredPage) {
            paramsToUpdate[ pageParamName ] = desiredPage;
            needsUpdate = true;
        }
        const currentSizeInUrl = searchParams.get(pageSizeParamName) ?? '10';
        const desiredSize = String(pagination.pageSize);
        if (currentSizeInUrl !== desiredSize) {
            paramsToUpdate[ pageSizeParamName ] = desiredSize;
            if (desiredPage !== '1') paramsToUpdate[ pageParamName ] = '1';
            needsUpdate = true;
        }

        // --- Sorting Sync (Updated Logic) ---
        const currentFieldInUrl = searchParams.get(sortFieldParamName);
        const currentDirInUrl = searchParams.get(sortDirParamName);

        const desiredField = sorting.length > 0 ? sorting[ 0 ].id : null;
        const desiredIsDesc = sorting.length > 0 ? sorting[ 0 ].desc : null; // null if no sort

        // Update field if necessary
        if (currentFieldInUrl !== desiredField) {
            paramsToUpdate[ sortFieldParamName ] = desiredField; // Use null to delete if desiredField is null
            needsUpdate = true;
        }

        // Update direction based on field and desired direction
        let desiredDirParamValue: string | null = null;
        if (desiredField !== null) { // Only set direction if field exists
            if (desiredIsDesc === false) { // Explicitly ascending
                desiredDirParamValue = 'asc';
            }
            // If desiredIsDesc is true (descending) or null (no sort), direction param should be absent (null)
        }

        if (currentDirInUrl !== desiredDirParamValue) {
            paramsToUpdate[ sortDirParamName ] = desiredDirParamValue; // Use null to delete
            needsUpdate = true;
        }

        // --- Selection & View Sync (same as before) ---
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
            // Preserve existing params not actively being changed
            const existingUnchanged: Record<string, string | null> = {};
            searchParams.forEach((value, key) => {
                // Check against *all* param names managed by this component
                if (!(key in paramsToUpdate) &&
                    key !== pageParamName &&
                    key !== pageSizeParamName &&
                    key !== sortFieldParamName &&
                    key !== sortDirParamName &&
                    key !== selectParamName &&
                    key !== viewParamName
                ) {
                    existingUnchanged[ key ] = value;
                }
            });
            // Re-add params being managed if they aren't in the current update batch
            if (!(pageParamName in paramsToUpdate) && searchParams.has(pageParamName)) existingUnchanged[ pageParamName ] = searchParams.get(pageParamName);
            if (!(pageSizeParamName in paramsToUpdate) && searchParams.has(pageSizeParamName)) existingUnchanged[ pageSizeParamName ] = searchParams.get(pageSizeParamName);
            if (!(sortFieldParamName in paramsToUpdate) && searchParams.has(sortFieldParamName)) existingUnchanged[ sortFieldParamName ] = searchParams.get(sortFieldParamName);
            if (!(sortDirParamName in paramsToUpdate) && searchParams.has(sortDirParamName)) existingUnchanged[ sortDirParamName ] = searchParams.get(sortDirParamName);
            if (!(selectParamName in paramsToUpdate) && searchParams.has(selectParamName)) existingUnchanged[ selectParamName ] = searchParams.get(selectParamName);
            if (!(viewParamName in paramsToUpdate) && searchParams.has(viewParamName)) {
                // Special check: only preserve view if it wasn't cleared by multi-select
                if (paramsToUpdate[ viewParamName ] !== null) {
                    existingUnchanged[ viewParamName ] = searchParams.get(viewParamName);
                }
            }


            updateSearchParams({ ...existingUnchanged, ...paramsToUpdate }, { replace: true });
        }

    }, [
        pagination, sorting, rowSelection, // Watch controlled and local state
        searchParams, updateSearchParams, // URL deps
        pageParamName, pageSizeParamName, sortFieldParamName, sortDirParamName, // Use new names
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
            {/* Pagination Controls */}
        </div>
    )
}

            // <div className={cn(
            //     "flex-shrink-0 flex items-center justify-between space-x-2 py-3 px-4 border-t",
            //     isPendingUrlUpdate && "opacity-75 cursor-wait" // Indicate URL update pending
            // )}>
            //     {/* Left Side - Row Count */}
            //     <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis pr-2">
            //         {table.getFilteredSelectedRowModel().rows.length > 0
            //             ? `${table.getFilteredSelectedRowModel().rows.length} selected`
            //             : rowCount != null // Use rowCount prop
            //                 ? `${rowCount.toLocaleString()} total rows`
            //                 : 'X'
            //         }
            //     </div>
            //     {/* Right Side - Controls */}
            //     <div className="flex items-center space-x-4 lg:space-x-6">
            //         {/* Column Visibility */}
            //         <DropdownMenu>
            //             <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="hidden lg:flex"><MoreHorizontal className="h-4 w-4 mr-1" /> Columns</Button></DropdownMenuTrigger>
            //             <DropdownMenuContent align="end">
            //                 {/* ... Column toggles ... */}
            //                 <DropdownMenuLabel>Toggle columns</DropdownMenuLabel><DropdownMenuSeparator />
            //                 {table.getAllColumns().filter(c => c.getCanHide()).map(c => <DropdownMenuCheckboxItem key={c.id} className="capitalize" checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)}>{/* ... header text ... */}</DropdownMenuCheckboxItem>)}
            //             </DropdownMenuContent>
            //         </DropdownMenu>
            //         {/* Page Size Selector */}
            //         <div className="flex items-center space-x-2">
            //             <span className="text-sm font-medium hidden xl:inline">Rows</span>
            //             <Select
            //                 value={`${table.getState().pagination.pageSize}`}
            //                 onValueChange={(value) => {
            //                     // Call parent's updater
            //                     table.setPageSize(Number(value)); // This triggers onPaginationChange
            //                 }}
            //             >
            //                 <SelectTrigger className="h-8 w-[75px]"><SelectValue placeholder={table.getState().pagination.pageSize} /></SelectTrigger>
            //                 <SelectContent side="top">{[ 5, 10, 20, 50, 100 ].map(s => <SelectItem key={s} value={`${s}`}>{s}</SelectItem>)}</SelectContent>
            //             </Select>
            //         </div>
            //         {/* Page Indicator */}
            //         <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            //             {/* Use pageCount prop */}
            //             Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() > 0 ? table.getPageCount() : 1}
            //         </div>
            //         {/* Navigation Buttons */}
            //         <div className="flex items-center space-x-1">
            //             <Button variant="outline" size="icon" className="h-8 w-8 hidden lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}> {/* Use table methods */}
            //                 <span className="sr-only">First</span><ChevronsLeft className="h-4 w-4" />
            //             </Button>
            //             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}> {/* Use table methods */}
            //                 <span className="sr-only">Prev</span><ChevronLeft className="h-4 w-4" />
            //             </Button>
            //             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}> {/* Use table methods */}
            //                 <span className="sr-only">Next</span><ChevronRight className="h-4 w-4" />
            //             </Button>
            //             <Button variant="outline" size="icon" className="h-8 w-8 hidden lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}> {/* Use table methods */}
            //                 <span className="sr-only">Last</span><ChevronsRight className="h-4 w-4" />
            //             </Button>
            //         </div>
            //     </div>
            // </div>