// src/app/(pages)/(protected)/customers/components/desktop-view.tsx
"use client"

import { type Table, flexRender } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft, // Keep for desktop
  ChevronsRight, // Keep for desktop
  ChevronUp,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Keep for desktop
import { CustomerFilterState } from "@/types/customer"
import { FilterControls } from "./filter-controls"
import { ActiveFilters } from "./active-filters"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Skeleton } from "@/components/ui/skeleton"
import { EnrichedCustomer } from "@/types/customer"
import { useCustomersStore } from "@/stores/customer-store"
import { CustomerDetailsContainer } from "@/components/details-panel/customer-details/CustomerDetailsContainer"
import { QuickAccess } from "@/components/quick-access"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import CustomerModalWrapper from "../../../../../components/dialogs/CustomerDialog/CustomerModalWrapper"


interface DesktopViewProps {
  table: Table<EnrichedCustomer>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  activeFilters: CustomerFilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter: (customer: string) => void
  handleItemSelection: (itemId: string) => void
  clearAllFilters: () => void
  availableItemTypes: string[]
  availableCustomers: string[]
  data: EnrichedCustomer[]
  isLoading: boolean
  status: string
  refetch: () => void
}

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


  const isMobile = useMediaQuery("(max-width: 800px)")
  const store = useCustomersStore()
  useEffect(() => {
    const countryColumn = table.getColumn("country");
    const typeColumn = table.getColumn("customerType");
    if (countryColumn && typeColumn) {
      countryColumn.toggleVisibility(!isMobile);
      typeColumn.toggleVisibility(!isMobile);
    }
  }, [ isMobile, table ]);

  const handleRowClick = (item: EnrichedCustomer) => {
    if (store.selectedCustomerId === item.customerId) {
      store.closeDetails()
    } else {
      store.selectCustomer(item.customerId, item)
    }
  }
  const [ isExpanded, setIsExpanded ] = useState(false);
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const tableScrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTableTop = () => {
    if (tableScrollContainerRef.current) {
      tableScrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <>
      {store.isDetailsOpen && isMobile && (
        <>
          <CustomerDetailsContainer className="w-full h-full" isMobile={isMobile} />
        </>
      )}

      <div className={cn("pt-4 w-full flex  flex-col", 
        isMobile ? "px-0 pb-0" : "px-4 pb-2",
        isMobile ? "h-full" : "h-screen overflow-hidden ",
      )
        }>
        {/* PAGE HEADER */}
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4", isMobile ? "px-2" : "")}>
          <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4 hidden md:block">
            Customers
          </h1>

          <div className="flex flex-wrap items-center gap-2 ">
            <div className="hidden md:block">
              <ActiveFilters
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                activeFilters={activeFilters}
                handleTypeFilter={handleTypeFilter}
                handleCustomerFilter={handleCustomerFilter}
                handleItemSelection={handleItemSelection}
                clearAllFilters={clearAllFilters}
                data={data}
              />
            </div>

            {/* <div className="flex flex-wrap items-center gap-2 ">
          {!isMobile && (
            <ActiveFilters
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              activeFilters={activeFilters}
              handleTypeFilter={handleTypeFilter}
              handleCustomerFilter={handleCustomerFilter}
              handleItemSelection={handleItemSelection}
              clearAllFilters={clearAllFilters}
              data={data}
            />
          )} */}

            <div className="relative bg-white rounded-md flex-grow sm:flex-grow-0 ml-4 ">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-9 w-full min-w-[180px] pl-8 sm:w-[250px]"
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

              <FilterControls
                activeFilters={activeFilters}
                handleTypeFilter={handleTypeFilter}
                handleCustomerFilter={handleCustomerFilter}
                handleItemSelection={handleItemSelection}
                clearAllFilters={clearAllFilters}
                availableItemTypes={availableItemTypes}
                availableCustomers={availableCustomers}
                data={data}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleExpanded}
                  disabled={isLoading}
                  className="absolute right-0 top-0 h-9 w-9"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </FilterControls>

            </div>
            <CustomerModalWrapper />
            <Button className="hidden md:block" variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <QuickAccess />
          </div>
        </div>

        {/* TABLE WITH RESIZABLE PANELS */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <ResizablePanelGroup
            direction={isMobile ? "vertical" : "horizontal"}
            className="flex-1"
          >
            <ResizablePanel
              defaultSize={isMobile ? (store.isDetailsOpen ? 40 : 100) : (store.isDetailsOpen ? 50 : 100)}
              minSize={isMobile ? 30 : 25}
              className={cn(isMobile ? "" : "border rounded-md")}
            >
              <div ref={tableScrollContainerRef}  className="h-full overflow-auto bg-slate-50">
                <UITable style={{ tableLayout: 'auto', width: "100%" }}>
                  <TableHeader className="sticky top-0 bg-slate-50 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} >
                        {headerGroup.headers.map((header) => {
                          const isActionsColumn = header.id === 'actions';
                          const headerStyles = isActionsColumn
                            ? { position: 'sticky' as const, right: 0, zIndex: 1, backgroundColor: 'inherit' }
                            : { width: header.getSize() };
                          const headerClassNames = cn(
                            "font-semibold whitespace-nowrap text-ellipsis text-slate-600 text-m p-1",
                            "bg-slate-100",
                            header.column.getCanSort() ? "cursor-pointer select-none" : ""
                          );
                          const sortState = header.column.getIsSorted();
                          const centerHeader = header.id === 'customerType' || header.id === 'displayName'
                          const headerCellClass = cn("flex items-center gap-1 px-2", // Added px-2 for cell padding
                            centerHeader && 'justify-center '
                          )
                          return (
                            <TableHead
                              key={header.id}
                              style={headerStyles}
                              className={headerClassNames}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className={headerCellClass}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                {sortState === 'asc' ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : sortState === 'desc' ? (
                                  <ArrowDown className="h-3 w-3" />
                                ) : header.column.getCanSort() ? (
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
                      Array.from({ length: isMobile ? 10 : 5 }).map((_, index) => (
                        <TableRow key={`loading-row-${index}`}>
                          {Array.from({ length: table.getAllColumns().length }).map((_, cellIndex) => (
                            <TableCell key={`loading-cell-${cellIndex}`} className={cn(isMobile ? "px-2 py-3" : "p-2")}>
                              <Skeleton className="h-6 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="cursor-pointer hover:bg-muted/100"
                          onClick={() => handleRowClick(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className={cn("text-sm", isMobile ? "px-2 py-3" : "p-2")}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="">
                        <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                          <div className=" h-[50vh] flex flex-col items-center justify-center space-y-2 ">
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
                  <TableBody>
                    <TableRow> 
                      <TableCell colSpan={(5 - Object.values(table.getState().columnVisibility).filter(isVisible => isVisible).length) + Object.values(table.getState().columnVisibility).filter(isVisible => isVisible).length}>
                        <div className="pb-8 md:pb-2 w-full flex flex-row items-center justify-center md:justify-between gap-y-2 pt-2 px-4 border-t bg-slate-50 rounded-b-md flex-shrink-0"> {/* Adjusted layout */}
                          {/* Page x of x etc */}
                          {!isMobile && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div>
                              {table.getFilteredRowModel().rows.length > 0 ?
                                `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}- ${Math.min(
                                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                  table.getFilteredRowModel().rows.length,
                                )} of ${table.getFilteredRowModel().rows.length} items`
                                : '0 items'
                              }
                            </div>
                          </div>}

                          {/* Page navigation controls */}
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8  sm:flex" // Hide on small screens
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
                                onClick={() => {
                                  table.previousPage();
                                  scrollToTableTop();
                                }}
                                disabled={!table.getCanPreviousPage()}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous page</span>
                              </Button>

                              <span className="text-sm px-2">
                                {isMobile ? "" : "Page"} {table.getPageCount() > 0 ? table.getState().pagination.pageIndex + 1 : 0} of {table.getPageCount()}
                              </span>

                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  table.nextPage();
                                  scrollToTableTop();
                                }}
                                disabled={!table.getCanNextPage()}
                              >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next page</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8  sm:flex" // Hide on small screens
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
                      </TableCell>
                    </TableRow>

                  </TableBody>
                </UITable>
              </div >
            </ResizablePanel >

            {store.isDetailsOpen && !isMobile && (
              <>
                <ResizableHandle withHandle className={cn("m-2", isMobile && "h-2 w-full my-1", !isMobile && "w-2 h-full mx-1")} />
                <ResizablePanel
                  defaultSize={isMobile ? 60 : 50}
                  minSize={isMobile ? 40 : 15}
                  maxSize={isMobile ? 80 : 50}
                  className={cn(isMobile ? "" : "border rounded-md")} // No border/rounded on mobile for full width
                >
                  <CustomerDetailsContainer className="w-full h-full" isMobile={isMobile} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>

          {/* PAGINATION CONTROLS */}
          {true &&
            <div className="pb-8 md:pb-2 flex flex-row items-center justify-center md:justify-between gap-y-2 pt-2 px-4 border-t bg-slate-50 rounded-b-md flex-shrink-0"> {/* Adjusted layout */}
              {/* Page x of x etc */}
              {!isMobile && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div>
                  {table.getFilteredRowModel().rows.length > 0 ?
                    `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}- ${Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length,
                    )} of ${table.getFilteredRowModel().rows.length} items`
                    : '0 items'
                  }
                </div>
              </div>}
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
                    {isMobile ? "" : "Page"} {table.getPageCount() > 0 ? table.getState().pagination.pageIndex + 1 : 0} of {table.getPageCount()}
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
          }
        </div >
      </div >

    </>
  )
}
