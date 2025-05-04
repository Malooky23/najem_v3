"use client"

import { type Table, flexRender } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilterState, ItemSchemaType } from "@/types/items"
import { FilterControls } from "./filter-controls"
import { ActiveFilters } from "./active-filters"

import { ItemDetailsContainer } from "@/components/item-details/ItemDetailsContainer" // NEW Import
import { useItemsStore } from "@/stores/items-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import CreateItemForm from "@/components/dialogs/ItemDialog/CreateItem"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils" // Import cn
import { memo } from "react"


interface DesktopViewProps {
  table: Table<ItemSchemaType>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  activeFilters: FilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter: (customer: string) => void
  handleItemSelection: (itemId: string) => void; // This might be handled by row click now
  clearAllFilters: () => void
  availableItemTypes: string[]
  availableCustomers: string[]
  data: ItemSchemaType[] // Still needed for the table and finding item on click
  isLoading: boolean
  status: string
  refetch: () => void
}

// Memoized content layout component (similar to Orders)
const ContentLayout = memo<{
  isDetailsOpen: boolean;
  children: React.ReactNode;
}>(function ContentLayout({ isDetailsOpen, children }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md border duration-100 overflow-hidden", // Added border here
        isDetailsOpen ? "w-[60%]" : "w-full" // Adjust width based on details panel
      )}
    >
      {children}
    </div>
  );
});


export function DesktopView({
  table,
  globalFilter,
  setGlobalFilter,
  activeFilters,
  handleTypeFilter,
  handleCustomerFilter,
  handleItemSelection,
  clearAllFilters,
  availableItemTypes,
  availableCustomers,
  data,
  isLoading,
  status,
  refetch
}: DesktopViewProps) {
  const isMobile = useMediaQuery("(max-width: 800px)") // Use a breakpoint consistent with Orders if possible
  const store = useItemsStore()

  const handleRowClick = (item: ItemSchemaType) => {
    // Find the full item data from the current data list
    // In a real-world scenario with potential pagination/filtering lag,
    // it might be safer to pass the item itself or trigger a fetch.
    // But based on the original code, finding it here is consistent.
    const selectedItemData = data.find(d => d.itemId === item.itemId) ?? item; // Fallback to row data

    if (store.selectedItemId === item.itemId) {
      store.closeDetails()
    } else {
      // Pass both ID and the full data to the store
      store.selectItem(item.itemId, selectedItemData)
    }
  }

  return (
    <div className="px-4 pb-2 pt-4 h-[calc(100vh-var(--header-height))] md:h-screen w-full overflow-hidden flex flex-col"> {/* Adjust height if needed */}
      {/* PAGE HEADER (Same as before) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
          Items
        </h1>
        <div className="flex items-center gap-2">
          <ActiveFilters
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            activeFilters={activeFilters}
            handleTypeFilter={handleTypeFilter}
            handleCustomerFilter={handleCustomerFilter}
            handleItemSelection={handleItemSelection} // Removed if handled by row click
            clearAllFilters={clearAllFilters}
            data={data}
          />
          <FilterControls
            activeFilters={activeFilters}
            handleTypeFilter={handleTypeFilter}
            handleCustomerFilter={handleCustomerFilter}
            handleItemSelection={handleItemSelection} // Removed if handled by row click
            clearAllFilters={clearAllFilters}
            availableItemTypes={availableItemTypes}
            availableCustomers={availableCustomers}
            data={data}
          />
          <div className="relative bg-white rounded-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-[200px] pl-8 sm:w-[250px]"
            />
            {globalFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 p-0"
                onClick={() => setGlobalFilter("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
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
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/([A-Z])/g, " $1").trim()}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {isLoading ? (<Skeleton className="h-9 w-[150px]" />) :
            <CreateItemForm />
          }
          <Button variant="ghost" onClick={() => refetch()}>
            <RefreshCcw />
          </Button>
        </div>
      </div>

      {/* NEW LAYOUT: Flex container for Table and Details */}
      <div className="flex gap-2 flex-1 min-h-0 overflow-hidden">

        {/* Table Content Area */}
        <ContentLayout isDetailsOpen={store.isDetailsOpen}>
          {/* Make the table container scrollable */}
          <div className="flex-1 overflow-auto bg-slate-50 rounded-md">
            <UITable style={{ tableLayout: 'auto', width: '100%' }}>
              {/* <TableHeader className="sticky top-0 z-10 bg-slate-100 shadow-sm rounded-t-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        // style={{ width: header.getSize() }} // Use Tanstack size if needed
                        className="min-w-[50px] px-3 py-2 whitespace-nowrap text-sm font-medium text-slate-600"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader> */}
              <TableHeader className="sticky top-0 bg-slate-50 z-10 rounded-t-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} /* No relative needed here anymore */ >
                    {headerGroup.headers.map((header) => {
                      const isActionsColumn = header.id === 'actions';
                      const headerStyles = isActionsColumn
                        ? { position: 'sticky' as const, right: 0 } // Use 'as const' for type safety
                        : { width: header.getSize() };
                      const headerClassNames = cn(
                        "font-semibold whitespace-nowrap text-ellipsis text-slate-600 text-m p-1", // Base styles
                        "bg-slate-100",
                        header.column.getCanSort() ? "cursor-pointer select-none" : ""
                      );
                      const sortState = header.column.getIsSorted();
                      // Simplified header centering
                      const centerHeader = header.id === 'itemStock' || header.id === 'itemType' 
                      // || header.id === 'itemNumber';
                      const headerCellClass = cn(
                        "flex items-center gap-1",
                        centerHeader && 'justify-center' // Just center if needed
                        // Removed: tightHeader && 'flex max-w-24 px-1 bg-green-200 text-center'
                      );
                      return (
                        <TableHead
                          key={header.id}
                          style={headerStyles}
                          className={headerClassNames}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {/* The div inside TH handles flex alignment of content + icon */}
                          <div className={headerCellClass}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            {/* Conditional Sort Icons */}
                            {sortState === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : sortState === 'desc' ? (
                              <ArrowDown className="h-3 w-3" /> // Using ChevronDown for descending
                            ) : header.column.getCanSort() ? (
                              // Show faded icon if sortable but not sorted
                              <ArrowUpDown className="h-3 w-3 opacity-30" />
                            ) : null}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, index) => ( // More skeleton rows
                    <TableRow key={`loading-row-${index}`}>
                      {Array.from({ length: table.getAllColumns().length }).map((_, cellIndex) => (
                        <TableCell key={`loading-cell-${cellIndex}`} className="p-3">
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.original.itemId === store.selectedItemId ? "selected" : undefined} // Highlight selected row
                      className="cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted" // Style selected row
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        // **SIMPLIFIED Cell Styling**
                        const cellClasses = cn(
                          "py-2 text-sm", // Keep vertical padding, base text size
                          cell.column.id === 'itemType' || cell.column.id === 'itemNumber'
                            ? "px-1 text-center" // Minimal horizontal padding, center text *within* the cell
                            : "px-3", 
                          // cell.column.id === 'itemNumber' && " items-center bg-green-200"
                        );

                        return (
                          // The TD gets the padding and text-align
                          <TableCell key={cell.id} className={cellClasses}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 min-h-[40vh]"> {/* Adjust height */}
                        <Filter className="h-8 w-8 text-muted-foreground" />
                        <div className="text-muted-foreground">No results found</div>
                        <Button variant="outline" size="sm" onClick={clearAllFilters}>
                          Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </UITable>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-y-2 py-2 px-4 border-t bg-slate-50 rounded-b-md flex-shrink-0"> {/* Adjusted layout */}
            {/* Page x of x etc */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div>
                {table.getFilteredRowModel().rows.length > 0 ?
                  `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}- ${Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length,
                  )} of ${table.getFilteredRowModel().rows.length} items`
                  : '0 items'
                }
              </div>
            </div>

            {/* Page navigation controls */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hidden sm:flex" // Hide on small screens
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">First page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <span className="text-sm px-2">
                  Page {table.getPageCount() > 0 ? table.getState().pagination.pageIndex + 1 : 0} of {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 hidden sm:flex" // Hide on small screens
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </div>
              <div className="flex items-center space-x-1">
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[ 10, 20, 30, 40, 50 ].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </ContentLayout>

        {/* Item Details Area */}
        {/* Use conditional rendering similar to Orders page */}
        <div className={cn(
          "flex flex-col rounded-md overflow-hidden border", // Basic container styles + border
          isMobile ? "w-full" : "w-[40%]", // Responsive width
          store.isDetailsOpen ? (isMobile ? "absolute inset-0 z-40 bg-background" : "ml-2") : "hidden", // Conditional visibility and spacing
          "transition-all duration-100 ease-in-out" // Optional transition
        )}
        >
          {/* Render ItemDetailsContainer only when needed */}
          {store.isDetailsOpen && (
            <ItemDetailsContainer isMobile={isMobile} className="h-full" />
          )}
        </div>
      </div>


    </div>
  )
}