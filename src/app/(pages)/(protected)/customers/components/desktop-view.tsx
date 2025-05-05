// "use client"

// import { type Table, flexRender } from "@tanstack/react-table"
// import {
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
//   ChevronUp,
//   Filter,
//   MoreHorizontal,
//   RefreshCcw,
//   Search,
//   X,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import type { FilterState, ItemSchemaType } from "@/types/items"
// import { FilterControls } from "./filter-controls"
// import { ActiveFilters } from "./active-filters"

// // import { DetailsPanel } from "./DetailsPanel"
// import { useItemsStore } from "@/stores/items-store"
// import { useMediaQuery } from "@/hooks/use-media-query"
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from "@/components/ui/resizable"
// import CreateItemForm from "@/components/dialogs/ItemDialog/CreateItem"
// import { Skeleton } from "@/components/ui/skeleton"
// import { EnrichedCustomer } from "@/types/customer"
// import { useCustomersStore } from "@/stores/customer-store"
// import { CustomerDetailsContainer } from "@/components/customer-details/CustomerDetailsContainer"
// import { QuickAccess } from "@/components/quick-access"
// import { useState } from "react"


// interface DesktopViewProps {
//   table: Table<EnrichedCustomer>
//   globalFilter: string
//   setGlobalFilter: (value: string) => void
//   activeFilters: FilterState
//   handleTypeFilter: (type: string) => void
//   handleCustomerFilter: (customer: string) => void
//   handleItemSelection: (itemId: string) => void
//   clearAllFilters: () => void
//   availableItemTypes: string[]
//   availableCustomers: string[]
//   data: EnrichedCustomer[]
//   isLoading: boolean
//   status: string
//   refetch: () => void
// }

// export function DesktopView({
//   table,
//   globalFilter,
//   setGlobalFilter,
//   activeFilters,
//   handleTypeFilter,
//   handleCustomerFilter,
//   handleItemSelection,
//   clearAllFilters,
//   availableItemTypes,
//   availableCustomers,
//   data,
//   isLoading,
//   status,
//   refetch
// }: DesktopViewProps) {


//   const isMobile = useMediaQuery("(max-width: 800px)")
//   const store = useCustomersStore()
//   let selectedItem
//   const handleRowClick = (item: EnrichedCustomer) => {
//     selectedItem = item
//     if (store.selectedCustomerId === item.customerId) {
//       store.closeDetails()
//     } else {
//       store.selectCustomer(item.customerId, item)
//     }
//   }
//   const [ isExpanded, setIsExpanded ] = useState(false);
//   const toggleExpanded = () => {
//     setIsExpanded(!isExpanded);
//   };

//   return (
//     <div className="px-4 pt-4 h-screen w-full overflow-hidden flex flex-col">
//       {/* PAGE HEADER */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
//         <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
//           Customers
//         </h1>


//         <div className="flex  items-center gap-2">
//           <ActiveFilters
//             globalFilter={globalFilter}
//             setGlobalFilter={setGlobalFilter}
//             activeFilters={activeFilters}
//             handleTypeFilter={handleTypeFilter}
//             handleCustomerFilter={handleCustomerFilter}
//             handleItemSelection={handleItemSelection}
//             clearAllFilters={clearAllFilters}
//             data={data}
//           />

//           <div className="relative bg-white rounded-md">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search customers..."
//               value={globalFilter}
//               onChange={(e) => setGlobalFilter(e.target.value)}
//               className="h-9 w-[200px] pl-8 sm:w-[250px]"
//             />
//             {globalFilter && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-0 top-0 h-9 w-9 p-0"
//                 onClick={() => setGlobalFilter("")}
//               >
//                 <X className="h-4 w-4" />
//                 <span className="sr-only">Clear search</span>
//               </Button>
//             )}
//             <FilterControls
//               activeFilters={activeFilters}
//               handleTypeFilter={handleTypeFilter}
//               handleCustomerFilter={handleCustomerFilter}
//               handleItemSelection={handleItemSelection}
//               clearAllFilters={clearAllFilters}
//               availableItemTypes={availableItemTypes}
//               availableCustomers={availableCustomers}
//               data={data}
//             >
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={toggleExpanded}
//                 disabled={isLoading}
//                 className="absolute right-0 top-0 h-9 w-9"
//               >
//                 {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//               </Button>
//             </FilterControls>
//           </div>
//           <Button variant="ghost" onClick={() => refetch()}>
//             <RefreshCcw />
//           </Button>
//           <QuickAccess />
//         </div>
//       </div>

//       {/* TABLE WITH RESIZABLE PANELS */}
//       <div className="flex-1 flex flex-col overflow-hidden min-h-0">
//         <ResizablePanelGroup
//           direction="horizontal"
//           className="  flex-1"
//         >
//           <ResizablePanel
//             defaultSize={75}
//             minSize={25}
//             className=" border rounded-md"
//           >
//             <div className="h-full overflow-auto bg-slate-50">
//               <UITable style={{ tableLayout: 'auto', width: '100%' }}>
//                 <TableHeader className="sticky top-0 rounded-t-md">
//                   {table.getHeaderGroups().map((headerGroup) => (
//                     <TableRow key={headerGroup.id}
//                       style={{ position: 'relative' }}
//                     >
//                       {headerGroup.headers.map((header) => {
//                         const width = undefined;
//                         return (
//                           <TableHead
//                             key={header.id}
//                             // style={{ position: 'relative', width: width ? width : undefined }}
//                             className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis text-slate-600 text-m"
//                           >
//                             {header.isPlaceholder
//                               ? null
//                               : flexRender(
//                                 header.column.columnDef.header,
//                                 header.getContext()
//                               )}
//                           </TableHead>
//                         );
//                       })}
//                       <TableHead
//                         // key={header.id}
//                         style={{ position: 'sticky', right:0  }}
//                         className="flex justify-end items-center bg-red-300 w-fit overflow-hidden whitespace-nowrap text-ellipsis text-slate-600 text-m"
//                       >
//                         {
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="sm" className="h-4 ">
//                                 <MoreHorizontal className="h-4 w-4" />
//                                 <span className="sr-only">More options</span>
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuLabel>Columns</DropdownMenuLabel>
//                               <DropdownMenuSeparator />
//                               {table
//                                 .getAllColumns()
//                                 .filter((column) => column.getCanHide())
//                                 .map((column) => {
//                                   return (
//                                     <DropdownMenuCheckboxItem
//                                       key={column.id}
//                                       className="capitalize"
//                                       checked={column.getIsVisible()}
//                                       onCheckedChange={(value) => column.toggleVisibility(!!value)}
//                                     >
//                                       {column.id.replace(/([A-Z])/g, " $1").trim()}
//                                     </DropdownMenuCheckboxItem>
//                                   )
//                                 })}
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         }
//                       </TableHead>
//                     </TableRow>
//                   ))}

//                 </TableHeader>

//                 <TableBody>
//                   {isLoading ? (
//                     // Display multiple skeleton rows to better represent loading state
//                     Array.from({ length: 5 }).map((_, index) => (
//                       <TableRow key={`loading-row-${index}`}>
//                         {Array.from({ length: table.getAllColumns().length }).map((_, cellIndex) => (
//                           <TableCell key={`loading-cell-${cellIndex}`}>
//                             <Skeleton className="h-8 w-full" />
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ))
//                   ) : table.getRowModel().rows?.length ? (
//                     table.getRowModel().rows.map((row) => (
//                       <TableRow
//                         key={row.id}
//                         data-state={row.getIsSelected() && "selected"}
//                         className="cursor-pointer hover:bg-muted/50"
//                         onClick={() => handleRowClick(row.original)}
//                       >
//                         {row.getVisibleCells().map((cell) => (
//                           <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
//                         ))}
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow className="">
//                       <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
//                         <div className=" h-[50vh] flex flex-col items-center justify-center space-y-2 ">
//                           <Filter className="h-8 w-8 text-muted-foreground" />
//                           <div className="text-muted-foreground">No results found</div>
//                           <Button variant="outline" size="sm" onClick={clearAllFilters}>
//                             Clear filters
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </UITable>
//             </div>
//           </ResizablePanel>

//           {store.isDetailsOpen && (
//             <>
//               <ResizableHandle withHandle className="m-2" />
//               <ResizablePanel
//                 defaultSize={40}
//                 minSize={15}
//                 maxSize={50}
//                 className=" border rounded-md"
//               >

//                 {/* <DetailsPanel items={data} /> */}
//                 <CustomerDetailsContainer className="w-full h-full" isMobile={isMobile} />
//               </ResizablePanel>
//             </>
//           )}
//         </ResizablePanelGroup>

//         {/* PAGINATION CONTROLS */}
//         <div className="flex flex-row items-center justify-center gap-y-4 py-2 px-4 backdrop-blur-lg">
//           {/* Page x of x etx etc */}
//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <div>
//               {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
//               {Math.min(
//                 (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
//                 table.getFilteredRowModel().rows.length,
//               )}{" "}
//               of {table.getFilteredRowModel().rows.length}
//             </div>
//           </div>

//           {/* Page navigation controls */}
//           <div className="flex items-center space-x-2">
//             <div className="flex items-center space-x-2 ">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => table.setPageIndex(0)}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <ChevronsLeft className="h-4 w-4" />
//                 <span className="sr-only">First page</span>
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 <span className="sr-only">Previous page</span>
//               </Button>
//               <span className="text-sm">
//                 Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
//               </span>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <ChevronRight className="h-4 w-4" />
//                 <span className="sr-only">Next page</span>
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <ChevronsRight className="h-4 w-4" />
//                 <span className="sr-only">Last page</span>
//               </Button>
//             </div>
//             <div className="flex items-center space-x-1">
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(value) => {
//                   table.setPageSize(Number(value))
//                 }}
//               >
//                 <SelectTrigger className="h-8 w-[70px]">
//                   <SelectValue placeholder={table.getState().pagination.pageSize} />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[ 10, 20, 30, 40, 50 ].map((pageSize) => (
//                     <SelectItem key={pageSize} value={`${pageSize}`}>
//                       {pageSize}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

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
  ChevronsLeft,
  ChevronsRight,
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
import { CustomerFilterState } from "@/types/customer"
import { FilterControls } from "./filter-controls"
import { ActiveFilters } from "./active-filters"

// import { DetailsPanel } from "./DetailsPanel"
import { useItemsStore } from "@/stores/items-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import CreateItemForm from "@/components/dialogs/ItemDialog/CreateItem"
import { Skeleton } from "@/components/ui/skeleton"
import { EnrichedCustomer } from "@/types/customer"
import { useCustomersStore } from "@/stores/customer-store"
import { CustomerDetailsContainer } from "@/components/customer-details/CustomerDetailsContainer"
import { QuickAccess } from "@/components/quick-access"
import { useState } from "react"
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
  let selectedItem
  const handleRowClick = (item: EnrichedCustomer) => {
    selectedItem = item
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

  return (
    <div className="px-4 pt-4 h-screen w-full overflow-hidden flex flex-col">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
          Customers
        </h1>


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

          <div className="relative bg-white rounded-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
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
                <CustomerModalWrapper/>
          <Button variant="ghost" onClick={() => refetch()}>
            <RefreshCcw />
          </Button>
          <QuickAccess />
        </div>
      </div>

      {/* TABLE WITH RESIZABLE PANELS */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1" // Removed extra space before class
        >
          <ResizablePanel
            defaultSize={50}
            minSize={25}
            className="border rounded-md" // Removed extra space before class
          >
            {/* Ensure this container allows horizontal scrolling */}
            <div className="h-full overflow-auto bg-slate-50">
              {/* Using 'auto' layout might prevent sticky from working perfectly if columns aren't sized. Consider 'fixed' if issues persist. */}
              <UITable style={{ tableLayout: 'auto', width: "100%" }}>
                {/* TableHeader needs to be sticky for the TH cells inside it to stick */}
                <TableHeader className="sticky top-0 bg-slate-50 z-10 rounded-t-md">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} /* No relative needed here anymore */ >
                      {headerGroup.headers.map((header) => {
                        const isActionsColumn = header.id === 'actions';
                        const headerStyles = isActionsColumn
                          ? { position: 'sticky' as const, right: 0 } // Use 'as const' for type safety
                          : { width: header.getSize() };
                        const headerClassNames = cn(
                          "font-semibold whitespace-nowrap text-ellipsis text-slate-600 text-m p-1",
                          "bg-slate-100",
                          header.column.getCanSort() ? "cursor-pointer select-none" : "" // Add cursor pointer if sortable
                        );
                        const sortState = header.column.getIsSorted();
                        const centerHeader = header.id === 'customerType' || header.id==='displayName'
                        const headerCellClass = cn("flex items-center gap-1",
                          centerHeader && 'justify-center '
                        )
                        return (
                          <TableHead
                            key={header.id}
                            style={headerStyles} // Apply sticky styles if it's the actions column
                            className={headerClassNames} // Apply conditional class names
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className={headerCellClass}> {/* Wrap content and icon */}
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext() // Context contains table instance needed for dropdown
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
                    // ... loading skeleton rows ...
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`loading-row-${index}`}>
                        {/* Adjusted colspan for the extra sticky header cell */}
                        {Array.from({ length: table.getAllColumns().length }).map((_, cellIndex) => (
                          <TableCell key={`loading-cell-${cellIndex}`}>
                            <Skeleton className="h-8 w-full" />
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
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())} </TableCell>

                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="">
                      {/* Adjusted colspan for the extra sticky header cell */}
                      <TableCell colSpan={table.getAllColumns().length + 0} className="h-24 text-center">
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
              </UITable>
            </div >
          </ResizablePanel >

          {store.isDetailsOpen && (
            <>
              <ResizableHandle withHandle className="m-2" />
              <ResizablePanel
                defaultSize={50}
                minSize={15}
                maxSize={50}
                className=" border rounded-md"
              >

                {/* <DetailsPanel items={data} /> */}
                <CustomerDetailsContainer className="w-full h-full" isMobile={isMobile} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>


        {/* PAGINATION CONTROLS */}
        <div className="flex flex-row items-center justify-center gap-y-4 py-2 px-4 backdrop-blur-lg">
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
              </Button >
            </div >
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
            </div >
          </div >
        </div >
      </div >
    </div >
  )
}


