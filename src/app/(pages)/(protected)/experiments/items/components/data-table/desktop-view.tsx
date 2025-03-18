"use client"

import { type Table, flexRender } from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ItemSchemaType } from "@/types/items"
import { FilterControls } from "./filter-controls"
import { ActiveFilters } from "./active-filters"
import type { FilterState } from "./items-page-wrapper"
import { toast } from "sonner"
import { DetailsPanel } from "@/app/(pages)/(protected)/warehouse/items/components/details/DetailsPanel"
import { useItemsStore } from "@/stores/items-store"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"


interface DesktopViewProps {
  table: Table<ItemSchemaType>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  activeFilters: FilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter: (customer: string) => void
  handleItemSelection: (itemId: string) => void
  clearAllFilters: () => void
  availableItemTypes: string[]
  availableCustomers: string[]
  data: ItemSchemaType[]
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
  const store = useItemsStore()
  let selectedItem
  const handleRowClick = (item: ItemSchemaType) => {
    selectedItem = item
    if(store.selectedItemId === item.itemId) {
      store.closeDetails()
    }else{
      store.selectItem(item.itemId)
    }
    // toast("Toast", {
    //   description: (
    //     <div className="mt-2 text-black space-y-1">
    //       <p>
    //         <strong>Item ID:</strong> #{item.itemNumber}
    //       </p>
    //       <p>
    //         <strong>Type:</strong> {item.itemType}
    //       </p>
    //       <p>
    //         <strong>Customer:</strong> {item.customerDisplayName}
    //       </p>
    //       <p>
    //         <strong>Total Stock:</strong> {item.itemStock ? item.itemStock.reduce((acc, curr) => acc + curr.currentQuantity, 0) : 0}
    //       </p>
    //       <p>
    //         <strong>Created:</strong> {item.createdAt.toLocaleDateString()}
    //       </p>
    //       <p>
    //         <strong>Last Updated:</strong> {item.updatedAt ? item.updatedAt.toLocaleDateString() : 'N/A'}
    //       </p>
    //     </div>
    //   ),
    // })


  }

  return (

    <div className="p-4 h-screen w-full overflow-hidden">


      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
          Items
        </h1>
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
          isLoading? {isLoading.toString()}
        </h1>
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
          Status: {status.toString()}
        </h1>
        <Button onClick={()=>refetch()}>Refetch</Button>
        <div className="flex  items-center gap-2">
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
          <FilterControls
            activeFilters={activeFilters}
            handleTypeFilter={handleTypeFilter}
            handleCustomerFilter={handleCustomerFilter}
            handleItemSelection={handleItemSelection}
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
        </div>
      </div>


      {/* TABLE */}
      
      <div className="flex flex-col h-full pt-2 ">
        <div className="h-[89vh] flex gap-2  ">
          <div className={cn("h-full animate duration-300 overflow-x-auto overflow-y-auto rounded-md bg-slate-50 border-2 border-slate-200",
            store.isDetailsOpen ? 
            isMobile ? "w-full " : "w-[60%]" : "w-full"
          )}>
            {/* <div className="w-full h-[calc(100%_-_4rem)] overflow-x-auto overflow-y-auto rounded-md bg-slate-50 border-2 border-slate-200">Added overflow-y-auto */}
            <UITable style={{ tableLayout: 'auto', minWidth: '100%' }}>{/* Add minWidth: 100% */}
              <TableHeader className="sticky top-0 rounded-t-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}
                    style={{ position: 'relative' }}
                  >
                    {headerGroup.headers.map((header) => {
                      const width = undefined;
                      return (
                        <TableHead
                          key={header.id}
                          style={{ position: 'relative', width: width ? width : undefined }}
                          className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis text-slate-600 text-m"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
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

          <DetailsPanel  items={data} /> {/* Updated to handle selectedItem */}
        </div>

        {/* PAGINATION CONTROLS  */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row  pt-2">

          {/* Page x of x etx etc */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{" "}
              of {table.getFilteredRowModel().rows.length}
            </div>
          </div>

          {/* Page navigation controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 ">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <span className="text-sm">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              {/* <span className="text-sm font-medium">Rows per page:</span> */}
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
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

      </div>


    </div>


  )
}

