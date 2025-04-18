'use client'
import * as React from 'react';
import {
    ColumnDef,
    ColumnFiltersState, // We might not use this directly if filters are external
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel, // Keep for potential future client-side filtering needs
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal, // Or other icon like SlidersHorizontal
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem, // Keep if needed for row actions
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils'; // Your utility for classnames

// Define the expected shape of the data coming from the query hook
interface PaginatedData<TData> {
    orders: TData[];
    pagination: {
        currentPage: number;
        totalPages: number;
        pageSize: number;
        total: number;
    };
}

// Define the result shape from the Tanstack Query hook
interface QueryHookResult<TData> {
    data: PaginatedData<TData> | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    // refetch is not directly used by DataTable, but parent might need it
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    queryHookResult: QueryHookResult<TData>;
    /** The key in TData that uniquely identifies a row (e.g., 'id', 'orderNumber') */
    rowIdKey: keyof TData;
    /** Optional: Base pathname for row click navigation. Defaults to current location. */
    basePathname?: string;
    /** Optional: Callback when a row is clicked (receives row data) */
    onRowClick?: (row: TData) => void;
    /** Parameter name for single row view in URL */
    viewParamName?: string;
    /** Parameter name for selected rows in URL */
    selectParamName?: string;
    /** Parameter name for page in URL */
    pageParamName?: string;
    /** Parameter name for page size in URL */
    pageSizeParamName?: string;
    /** Parameter name for sort in URL */
    sortParamName?: string;
}

export function DataTable<TData, TValue>({
    columns,
    queryHookResult,
    rowIdKey,
    onRowClick,
    viewParamName = 'view',
    selectParamName = 'selected',
    pageParamName = 'page',
    pageSizeParamName = 'pageSize',
    sortParamName = 'sort',
}: DataTableProps<TData, TValue>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // Read-only URLSearchParams

    // --- State Derivation (remains the same) ---
    const page = parseInt(searchParams.get(pageParamName) || '1', 10);
    const pageSizeParamValue = searchParams.get(pageSizeParamName); // Read from URL
    const sortParam = searchParams.get(sortParamName);
    const selectedParam = searchParams.get(selectParamName);
    const viewParam = searchParams.get(viewParamName);

    // --- Tanstack Table State (remains largely the same) ---
    const [ pageSize, setPageSize ] = React.useState(
        parseInt(pageSizeParamValue || '10', 10)
    ); // Need local state for immediate UI feedback on select change

    const initialSorting: SortingState = React.useMemo(() => {
        if (!sortParam) return [];
        const [ id, dir ] = sortParam.split(':');
        return id && (dir === 'asc' || dir === 'desc') ? [ { id, desc: dir === 'desc' } ] : [];
    }, [ sortParam ]);
    const [ sorting, setSorting ] = React.useState<SortingState>(initialSorting);

    // Row Selection
    const initialRowSelection: Record<string, boolean> = React.useMemo(() => {
        if (!selectedParam) return {};
        const selectedIds = selectedParam.split(',');
        return selectedIds.reduce((acc, id) => {
            if (id) acc[ id ] = true;
            return acc;
        }, {} as Record<string, boolean>);
    }, [ selectedParam ]);
    
    const [ rowSelection, setRowSelection ] = React.useState(initialRowSelection);

    const [ columnVisibility, setColumnVisibility ] = React.useState<VisibilityState>({});


    // --- Function to Update URL Search Params ---
    const updateSearchParams = React.useCallback((newParams: Record<string, string | number | null>, options?: { replace?: boolean }) => {
        const current = new URLSearchParams(Array.from(searchParams.entries())); // Create mutable copy

        Object.entries(newParams).forEach(([ key, value ]) => {
            if (value === null || value === undefined) {
                current.delete(key);
            } else {
                current.set(key, String(value));
            }
        });

        const search = current.toString();
        const query = search ? `?${search}` : '';
        const navigationOptions = { scroll: false }; // Prevent scrolling to top on param change

        if (options?.replace) {
            router.replace(`${pathname}${query}`, navigationOptions);
        } else {
            router.push(`${pathname}${query}`, navigationOptions);
        }
    }, [ searchParams, pathname, router ]);


    // --- Effect to Sync Table State -> URL ---
    React.useEffect(() => {
        const paramsToUpdate: Record<string, string | null> = {};
        let changed = false;

        // Sync Page Size (from local state)
        if (String(pageSize) !== searchParams.get(pageSizeParamName)) {
            paramsToUpdate[ pageSizeParamName ] = String(pageSize);
            // Reset page if size changes
            if (searchParams.get(pageParamName) !== '1') {
                paramsToUpdate[ pageParamName ] = '1';
            }
            changed = true;
        }

        // Sync Sort
        const currentSortString = searchParams.get(sortParamName);
        if (sorting.length > 0) {
            const newSortString = `${sorting[ 0 ].id}:${sorting[ 0 ].desc ? 'desc' : 'asc'}`;
            if (newSortString !== currentSortString) {
                paramsToUpdate[ sortParamName ] = newSortString;
                changed = true;
            }
        } else if (currentSortString) {
            paramsToUpdate[ sortParamName ] = null; // Signal deletion
            changed = true;
        }

        // Sync Selection
        const currentSelectString = searchParams.get(selectParamName);
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[ key ]);
        const newSelectString = selectedIds.join(',');
        if (selectedIds.length > 0) {
            if (newSelectString !== currentSelectString) {
                paramsToUpdate[ selectParamName ] = newSelectString;
                changed = true;
                // Optional: Clear view param if multiple selected
                // if (selectedIds.length > 1 && searchParams.has(viewParamName)) {
                //     paramsToUpdate[viewParamName] = null;
                // }
            }
        } else if (currentSelectString) {
            paramsToUpdate[ selectParamName ] = null; // Signal deletion
            changed = true;
        }

        // Only push update if something actually changed
        if (changed) {
            // Pass existing params that are *not* being actively changed by this effect,
            // otherwise they might get overwritten with null/defaults.
            const existingUnchanged: Record<string, string | null> = {};
            if (!(pageParamName in paramsToUpdate) && searchParams.has(pageParamName)) existingUnchanged[ pageParamName ] = searchParams.get(pageParamName);
            if (!(viewParamName in paramsToUpdate) && searchParams.has(viewParamName)) existingUnchanged[ viewParamName ] = searchParams.get(viewParamName);
            // Add other params if needed

            updateSearchParams({ ...existingUnchanged, ...paramsToUpdate }, { replace: true });
        }

    }, [
        sorting,
        rowSelection,
        pageSize,
        searchParams, // Dependency
        updateSearchParams, // Dependency
        pageParamName,
        pageSizeParamName,
        sortParamName,
        selectParamName,
        viewParamName,
    ]);


    // --- Tanstack Table Instance ---
    const table = useReactTable({
        data: queryHookResult.data?.orders ?? [],
        columns,
        state: {
            sorting,
            rowSelection,
            columnVisibility,
            pagination: {
                // Use page from URL (1-based) converted to 0-based index
                pageIndex: page - 1,
                // Use pageSize from local state synced with URL
                pageSize: pageSize,
            },
        },
        pageCount: queryHookResult.data?.pagination?.totalPages ?? -1,
        onSortingChange: setSorting, // Updates local state -> triggers useEffect -> updates URL
        onRowSelectionChange: setRowSelection, // Updates local state -> triggers useEffect -> updates URL
        onColumnVisibilityChange: setColumnVisibility,
        // No onPaginationChange needed here as we drive it via URL handlers
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        enableRowSelection: true,
        getRowId: (row) => String(row[ rowIdKey ]),
        debugTable: process.env.NODE_ENV === 'development',
    });

    // --- Helper Functions (Updated for Next.js Router) ---
    const handlePageChange = (newPageIndex: number) => {
        const params: Record<string, string | null> = {
            [ pageParamName ]: String(newPageIndex + 1)
        };
        // Reset view/selection?
        params[ viewParamName ] = null;
        params[ selectParamName ] = null;
        setRowSelection({}); // Clear selection state immediately

        updateSearchParams(params); // Use router to push new state
    };

    const handlePageSizeChange = (newPageSize: string) => {
        const newSize = parseInt(newPageSize, 10);
        setPageSize(newSize); // Update local state, useEffect will handle URL update
        // Effect now handles resetting page to 1 and updating URL
        // Also reset view/selection immediately if desired
        const params: Record<string, string | null> = {
            [ viewParamName ]: null,
            [ selectParamName ]: null,
        };
        setRowSelection({});
        updateSearchParams(params, { replace: true }); // Update view/select params immediately
    };

    const handleRowClick = (row: TData) => {
        const rowId = String(row[ rowIdKey ]);
        const params: Record<string, string | null> = {};

        if (viewParam === rowId) {
            params[ viewParamName ] = null; // Deselect
        } else {
            params[ viewParamName ] = rowId; // Select
            // Clear multi-selection?
            params[ selectParamName ] = null;
            setRowSelection({});
        }
        updateSearchParams(params, { replace: true });

        if (onRowClick) {
            onRowClick(row);
        }
    };
    // --- Render Logic ---
    const { isLoading, isFetching, isError, error } = queryHookResult;
    const paginationData = queryHookResult.data?.pagination;

    return (
        <div className="w-full space-y-4">
            {/* Optional: Top controls like filtering - Add later if needed */}
            {/* <div className="flex items-center py-4">
            <Input placeholder="Filter..." />
        </div> */}

            <div className="rounded-md border relative">
                {/* Loading/Fetching Overlay */}
                {(isLoading || isFetching) && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                        {/* Add a spinner here */}
                        <p>Loading...</p>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {/* Selection Header */}
                                <TableHead >
                                    <Checkbox
                                        checked={
                                            table.getIsAllPageRowsSelected() ||
                                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                                        }
                                        onCheckedChange={(value) =>
                                            table.toggleAllPageRowsSelected(!!value)
                                        }
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        disabled={!header.column.getCanSort()}
                                                        className={cn(
                                                            "px-2", // Reduce padding for tighter header
                                                            !header.column.getCanSort() ? "cursor-not-allowed" : "cursor-pointer"
                                                        )}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {header.column.getCanSort() && (
                                                            <ArrowUpDown className={cn(
                                                                "ml-2 h-4 w-4",
                                                                header.column.getIsSorted() === 'asc' && "text-accent-foreground",
                                                                header.column.getIsSorted() === 'desc' && "text-accent-foreground"
                                                            )} />
                                                        )}
                                                    </Button>
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isError && (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-destructive">
                                    Error loading data: {error?.message || 'Unknown error'}
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && !isFetching && !isError && table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    onClick={() => handleRowClick(row.original)} // Add row click handler
                                    className={cn(
                                        "cursor-pointer hover:bg-muted/50",
                                        // Highlight row if it's the 'viewed' one
                                        viewParam === row.id && "bg-muted"
                                    )}
                                >
                                    {/* Selection Cell */}
                                    <TableCell>
                                        <Checkbox
                                            checked={row.getIsSelected()}
                                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                                            onClick={(e) => e.stopPropagation()} // Prevent row click from triggering when clicking checkbox
                                            aria-label="Select row"
                                        />
                                    </TableCell>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            !isLoading && !isFetching && !isError && (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + 1} // +1 for checkbox column
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination and Bottom Controls */}
            <div className="flex items-center justify-between space-x-2 py-4">
                {/* Selected Row Count */}
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {paginationData?.total ?? table.getFilteredRowModel().rows.length} row(s) selected.
                    {viewParam && ` | Viewing row ID: ${viewParam}`}
                </div>

                {/* Column Visibility Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto hidden lg:flex">
                            Columns <MoreHorizontal className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {typeof column.columnDef.header === 'string'
                                            ? column.columnDef.header
                                            : column.id // Fallback to id if header is complex
                                        }
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>


                {/* Pagination Controls */}
                <div className="flex items-center space-x-6 lg:space-x-8">
                    {/* Page Size Selector */}
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium hidden sm:inline">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => handlePageSizeChange(value)}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[ 5, 10, 20, 30, 40, 50 ].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page Indicator */}
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount() > 0 ? table.getPageCount() : 1}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => handlePageChange(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => handlePageChange(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}