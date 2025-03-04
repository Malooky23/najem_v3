// "use client"
// import { useEffect, useCallback, useState, Suspense } from "react"
// import { useSearchParams, useRouter } from "next/navigation"
// import { StockMovementTable } from "./components/table/table"
// import { stockMovementColumns } from "./components/table/columns"
// import { useMediaQuery } from "@/hooks/use-media-query"
// import { cn } from "@/lib/utils"
// import { PaginationControls } from "@/components/ui/pagination-controls"
// import { RowSelectionState } from "@tanstack/react-table"
// import { SearchBar } from "./components/search/SearchBar"
// import {
//   StockMovementSort,
//   type StockMovementSortFields,
//   type EnrichedStockMovementView,
//   type StockMovementFilters,
//   type MovementType
// } from "@/types/stockMovement"
// import { useOrderDetails, useStockMovements } from "@/hooks/data-fetcher"
// import { useSession } from "next-auth/react"
// import Loading from "@/components/ui/loading"
// import { OrderDetails } from "./components/details/OrderDetails"

// export default function StockMovementPage() {

//   // const session = useSession()

//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const isMobile = useMediaQuery("(max-width: 768px)")

//   // Get URL parameters
//   const page = Number(searchParams.get('page')) || 1
//   const pageSize = Number(searchParams.get('pageSize')) || 10
//   const sortField = (searchParams.get('sort') || 'createdAt') as StockMovementSortFields
//   const sortDirection = (searchParams.get('direction') || 'desc') as 'asc' | 'desc'

//   // Get filter parameters
//   const search = searchParams.get('search') || undefined
//   const movement = searchParams.get('movement') as MovementType | undefined
//   const itemName = searchParams.get('itemName') || undefined
//   const customerDisplayName = searchParams.get('customerDisplayName') || undefined
//   const dateFrom = searchParams.get('dateFrom')
//   const dateTo = searchParams.get('dateTo')

//   // Get movement ID from URL for details view
//   const selectedMovementId = searchParams.get('movementId')
//   const isDetailsOpen = !!selectedMovementId

//   const sort: StockMovementSort = {
//     field: sortField,
//     direction: sortDirection
//   }

//   // Construct filters object
//   const filters: StockMovementFilters = {
//     ...(search && { search }),
//     ...(movement && { movement }),
//     ...(itemName && { itemName }),
//     ...(customerDisplayName && { customerDisplayName }),
//     ...(dateFrom && dateTo && {
//       dateRange: {
//         from: new Date(dateFrom),
//         to: new Date(dateTo)
//       }
//     })
//   }

//   const { data: movements, pagination, isLoading, error, isFetching, status, isError } = useStockMovements({
//     page,
//     pageSize,
//     sort,
//     filters,
//   })
//   const [selectedMovementReferenceId, setSelectedMovementReferenceId] = useState<string | null>(null)
//   const { data: order, isLoading: orderLoading, isError: orderError } = useOrderDetails(selectedMovementReferenceId)

//   const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
//     const params = new URLSearchParams(searchParams)
//     Object.entries(updates).forEach(([key, value]) => {
//       if (value === null) {
//         params.delete(key)
//       } else {
//         params.set(key, value)
//       }
//     })
//     router.replace(`?${params.toString()}`)
//   }, [searchParams, router])

//   const handleCloseDetails = useCallback(() => {
//     updateUrlParams({ movementId: null })
//   }, [updateUrlParams])


//   const handleMovementClick = useCallback((movement: EnrichedStockMovementView) => {
//     if(selectedMovementId === movement.movementId){
//       // updateUrlParams({ movementId: null })
//       // setSelectedMovementReferenceId(null)
//       handleCloseDetails()
//       return
//     }
//     updateUrlParams({ movementId: movement.movementId })

//     setSelectedMovementReferenceId(movement.referenceId)
//   }, [updateUrlParams])

//   const handlePageChange = useCallback((newPage: number) => {
//     updateUrlParams({ page: newPage.toString() })
//   }, [updateUrlParams])

//   const handlePageSizeChange = useCallback((newPageSize: number) => {
//     updateUrlParams({
//       pageSize: newPageSize.toString(),
//       page: '1' // Reset to first page when changing page size
//     })
//   }, [updateUrlParams])

//   const handleSortChange = useCallback((field: StockMovementSortFields, direction: 'asc' | 'desc') => {
//     updateUrlParams({
//       sort: field,
//       direction: direction
//     })
//   }, [updateUrlParams])

//   const [selectedRows, setSelectedRows] = useState<RowSelectionState>({})
//   const handleRowSelection = (selection: RowSelectionState) => {
//     setSelectedRows(selection)

//     // Get the selected items
//     const selectedItems = Object.keys(selection)
//       .filter(key => selection[key])
//       .map(key => movements[parseInt(key)])

//     console.log("Selected movements:", selectedItems)
//   }

//   useEffect(() => {
//     if (pagination?.totalPages && page > pagination.totalPages) {
//       updateUrlParams({ page: pagination.totalPages.toString() })
//     }
//   }, [page, pagination?.totalPages, updateUrlParams])


//   if (isError || error) {
//     return (

//       // <div className="min-h-screen flex items-center justify-center">
//       //   <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
//       //     Error loading movements: {error instanceof Error ? error.message : 'Unknown error'}
//       //   </div>
//       // </div>

//       <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
//         Error loading movements: {error instanceof Error ? error.message : 'Unknown error'}
//       </div>

//     );
//   }



//   // if (session.data?.user.userType !== 'EMPLOYEE') {
//   //   return <div>RESTRICTED</div>
//   // }

//   return (
//     <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
//       <div className="flex justify-between mt-2">
//         <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
//           Item Movements
//         </h1>
//         <SearchBar isLoading={isFetching} />
//       </div>
//       <div className="flex gap-4 flex-1 min-h-0 overflow-hidden mt-0">
//         <div
//           className={cn(
//             "flex flex-col rounded-md transition-all duration-300",
//             isMobile ? (isDetailsOpen ? "hidden" : "w-full") : (isDetailsOpen ? "w-[40%]" : "w-full"),
//           )}
//         >
//           {/* <Suspense fallback={<div className="flex flex-col items-center justify-center">Loading...</div>}></Suspense> */}
//           <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200">
//             <StockMovementTable
//               columns={stockMovementColumns}
//               data={movements || []}
//               isLoading={isLoading}
//               onRowClick={handleMovementClick}
//               selectedId={selectedMovementId || undefined}
//               isCompact={isDetailsOpen || isMobile}
//               onSort={handleSortChange}
//               sortField={sortField}
//               sortDirection={sortDirection}
//               onRowSelectionChange={handleRowSelection}
//               selectedRows={selectedRows}
//             />
//           </div>
//           {pagination && (
//             <div className="p-2 flex w-full justify-center min-w-0">
//               <PaginationControls
//                 currentPage={pagination.currentPage}
//                 totalPages={pagination.totalPages}
//                 pageSize={pagination.pageSize}
//                 total={pagination.total}
//                 onPageChange={handlePageChange}
//                 onPageSizeChange={handlePageSizeChange}
//                 selectedRows={Object.keys(selectedRows).filter(key => selectedRows[key]).length}
//               />
//             </div>
//           )}
//         </div>
//         {/* <Suspense/> */}

//         {isDetailsOpen && (
//           <div
//             className={cn(
//               "bg-white rounded-md border relative transition-all duration-300 flex-1 w-[100%] overflow-auto",
//               isMobile ? "fixed inset-0 z-50 m-0" : "w-[70%]"
//             )}
//           >
//             {/* Movement details component will be implemented later */}
//             <OrderDetails
//               order={order!}
//               isMobile={isMobile}
//               handleClose={handleCloseDetails}
//               // onSave={handleUpdateOrder}
//             />

//           </div>
//         )}
//       </div>
//     </div>
//   )
// }