// "use client"
// import { memo, useState, useMemo, useEffect, useCallback } from "react"
// import { useMediaQuery } from "@/hooks/use-media-query"
// import { cn } from "@/lib/utils"
// import { useItemsStore } from "@/stores/items-store"
// import { ItemsTable } from "./components/ItemsTable"
// import { DetailsPanel } from "./components/details/DetailsPanel"
// import { useCustomers, useItems } from "@/hooks/data-fetcher"
// import { Skeleton } from "@/components/ui/skeleton"
// import CreateItemForm from "./components/CreateItem"
// import { Input } from "@/components/ui/input"
// import { Search } from "lucide-react"
// import { PaginationControls } from "@/components/ui/pagination-controls"
// import { useItemsQuery } from "@/hooks/data/useItems"
// import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, SortingState, ColumnFiltersState } from "@tanstack/react-table"
// import { itemColumns } from "./components/table/columns"
// import { Button } from "@/components/ui/button"
// import { DataTablePagination } from "./components/table/TestPagination"
// import { ItemSchemaType } from "@/types/items"

// interface PageHeaderProps {
//   isLoading: boolean;
//   searchValue: string;
//   onSearchChange: (value: string) => void;
// }

// // Memoized header component
// const PageHeader = memo<PageHeaderProps>(function PageHeader({
//   isLoading,
//   searchValue,
//   onSearchChange
// }) {
//   // const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading } = useCustomers();

//   return (
//     <div className="flex items-center justify-between mt-2 mb-4">
//       <div className="flex items-center">
//         <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
//           Items
//         </h1>

//         <div className="relative max-w-sm">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
//           <Input
//             placeholder="Search items..."
//             value={searchValue}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className="pl-8 w-[250px] focus-visible:ring-blue-500"
//           />
//         </div>
//       </div>

//       {isLoading ? (
//         <Skeleton className="w-40 h-8" />
//       ) : (
//         <CreateItemForm />

//       )}
//     </div>
//   );
// });

// export default function ItemsPageWrapper() {
//   // Media query for responsive design
//   const isMobile = useMediaQuery("(max-width: 900px)")
//   // Get store state
//   const store = useItemsStore()
//   // Fetch items using the hook
//   const { data: items, isLoading } = useItemsQuery()

//   // State for search filter
//   const [searchValue, setSearchValue] = useState("")

//   // Create the table instance at the parent level
//   const table = useReactTable({
//     data: items ?? [],
//     columns: itemColumns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   })


//   console.log(table.getState().pagination) //access just the row selection state


//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Skeleton className="w-40 h-8" />
//       </div>
//     )
//   }
// console.log(table)
//   return (
//     <div className="lg:px-4 h-screen flex flex-col overflow-hidden">
//       <div className={cn(isMobile && "p-2")}>
//         <PageHeader
//           isLoading={isLoading}
//           searchValue={searchValue}
//           onSearchChange={setSearchValue}
//         />
//       </div>
//       <div className="flex-1 min-h-0 relative">
//         {/* Main table content */}
//         <div
//           className={cn(
//             "w-full h-full flex flex-col transition-all duration-300 ease-in-out",
//             !isMobile && store.isDetailsOpen && "pr-[30%] "
//           )}
//         >
//           <div className="flex-1 min-h-0 overflow-hidden flex justify-center">
//             <ItemsTable
//               isMobile={isMobile}
//               isLoading={isLoading}
//               items={items ?? []}
//             />
//           </div>
//           {/* Pagination controls */}
//           <div className="m-2">
//             <DataTablePagination table={table} />
//           </div>
//         </div>


//         {/* Details panel - Fixed positioning for desktop to prevent layout shift */}
//         {!isMobile && (
//           <div
//             className={cn(
//               "px-2 absolute top-0 right-0 h-full flex w-[30%] transition-transform duration-300 ease-in-out",
//               store.isDetailsOpen
//                 ? "translate-x-0"
//                 : "translate-x-full pointer-events-none"
//             )}
//           >
//             <DetailsPanel
//               isMobile={isMobile}
//               items={items!}
//             />
//           </div>
//         )}

//         {/* Mobile details are handled by the Drawer component in DetailsPanel */}
//         {isMobile && (
//           <DetailsPanel
//             isMobile={isMobile}
//             items={items!}
//           />
//         )}
//       </div>
//     </div>
//   )
// }
