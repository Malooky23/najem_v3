// src/components/data-table.tsx
'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'; // Removed useTransition
import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    PaginationState,
    RowSelectionState,
    OnChangeFn,
} from '@tanstack/react-table';
import {
    ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal,
} from 'lucide-react';
// Removed: import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
    onRowClick?: (row: TData) => void; // Keep original onRowClick if needed for other purposes
    currentViewId?: string | null; // New: Controlled view state from parent
    onViewChange?: (viewId: string | null) => void; // New: Callback to change view state in parent
    // Removed URL param name props
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    rowCount,
    pagination,
    sorting,
    onPaginationChange,
    onSortingChange,
    initialRowSelection = {},
    onRowSelectionChange,
    isLoading,
    isFetching,
    isError,
    error,
    rowIdKey,
    onRowClick,
    currentViewId, // Use prop
    onViewChange, // Use prop
}: DataTableProps<TData, TValue>) {

    // Removed: router, pathname, searchParams, useTransition, updateSearchParams

    const [ rowSelection, setRowSelection ] = useState<RowSelectionState>(initialRowSelection);
    const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>({});

    // Removed: viewParam derived from searchParams

    // --- Tanstack Table Instance ---
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: { pagination, sorting, rowSelection, columnVisibility },
        onPaginationChange, // Pass parent updater
        onSortingChange,    // Pass parent updater
        onRowSelectionChange: (updater) => {
            // Keep local update for immediate feedback if needed, but notify parent
            const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
            setRowSelection(newSelection);
            if (onRowSelectionChange) onRowSelectionChange(newSelection);

            // If selection changes (especially if > 1 selected), clear the view
            const selectedIds = Object.keys(newSelection).filter(id => newSelection[ id ]);
            if (selectedIds.length !== 1 && currentViewId && onViewChange) {
                onViewChange(null);
            }
        },
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        // Provide a default getRowId if rowIdKey is used
        getRowId: (row) => String(row[rowIdKey]),
    });

    // Removed: useEffect hook for syncing state TO URL (lines 142-288 in original)

    // --- Handler for Row Click ---
    const handleRowClickInternal = (row: TData) => {
        const rowId = String(row[ rowIdKey ]);

        // Call the generic onRowClick if provided
        if (onRowClick) onRowClick(row);

        // Handle view change via callback
        if (onViewChange) {
            const newViewId = currentViewId === rowId ? null : rowId;
            onViewChange(newViewId);

            // If setting a view, clear selection
            if (newViewId !== null && onRowSelectionChange) {
                setRowSelection({}); // Update local state immediately
                onRowSelectionChange({}); // Notify parent
            }
        }
    };

    // --- Render Logic ---
    const checkboxState = () => {
        if (table.getIsAllPageRowsSelected()) return true
        if (table.getIsSomePageRowsSelected()) return 'indeterminate'
        return false
    }

    return (
        <div className="flex flex-col h-full w-full rounded-lg border overflow-hidden">
            {/* Table Container */}
            <div className="flex-grow relative overflow-hidden">
                {/* Loading State Overlay */}
                {isLoading && (
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
                                        <Checkbox
                                            checked={checkboxState()}
                                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                            aria-label="Select all rows"
                                        />
                                    </TableHead>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                                            {header.isPlaceholder ? null : (
                                                <Button variant="ghost" onClick={header.column.getToggleSortingHandler()} disabled={!header.column.getCanSort()} className="px-2 hover:bg-muted">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && <ArrowUpDown className={cn("ml-2 h-4 w-4", sorting.find(s => s.id === header.column.id) ? 'text-foreground' : 'text-muted-foreground/70')} />}
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
                            {isError && (
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
                                                // Highlight based on controlled currentViewId prop
                                                currentViewId === row.id && "bg-accent/50 hover:bg-accent/60 data-[state=selected]:bg-accent/60"
                                            )}
                                        >
                                            {/* Selection Cell */}
                                            <TableCell className="px-2">
                                                <Checkbox
                                                    checked={row.getIsSelected()}
                                                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                                                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
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
            {/* Pagination Controls Component */}
            <div className="p-2 flex w-full justify-center min-w-0">
                <PaginationControls<TData>
                    // Pass necessary props, table instance might be enough if controls use it directly
                    table={table}
                    totalPages={pageCount}
                    total={rowCount}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    pageSize={table.getState().pagination.pageSize}
                    isLoading={isLoading || isFetching} // Combine loading states for controls
                    // Removed direct page/size props if controls get them from table state
                    // Removed onPageChange/onPageSizeChange if controls use table methods
                />
            </div>
        </div>
    );
}
