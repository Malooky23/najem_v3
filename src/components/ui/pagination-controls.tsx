// "use client"

// import { useState, useEffect, useMemo, useCallback } from "react"
// import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import React from "react"

// interface PaginationControlsProps {
//   currentPage: number
//   totalPages: number
//   pageSize: number
//   total: number
//   selectedRows?: number
//   onPageChange: (page: number) => void
//   onPageSizeChange: (pageSize: number) => void
//   onNextPageHover?: () => void
//   isLoading?: boolean
// }

// // Wrap component in memo to prevent unnecessary re-renders
// const PaginationControls = React.memo(function PaginationControlsInner({
//   currentPage,
//   totalPages,
//   pageSize,
//   total,
//   selectedRows = 0,
//   onPageChange,
//   onPageSizeChange,
//   onNextPageHover,
//   isLoading = false
// }: PaginationControlsProps) {
//   const canPreviousPage = currentPage > 1
//   const canNextPage = currentPage < totalPages
//   const [showSelectedRows, setShowSelectedRows] = useState(false)

//   // Calculate the range of items being displayed
//   const { startItem, endItem } = useMemo(() => ({
//     startItem: total === 0 ? 0 : (currentPage - 1) * pageSize + 1,
//     endItem: Math.min(currentPage * pageSize, total)
//   }), [currentPage, pageSize, total]);

//   // Handle selected rows display
//   useEffect(() => {
//     if (selectedRows > 0) {
//       setShowSelectedRows(true);
//       const timer = setTimeout(() => setShowSelectedRows(false), 3000);
//       return () => clearTimeout(timer);
//     } else {
//       setShowSelectedRows(false);
//     }
//   }, [selectedRows]);

//   // Generate page buttons - memoize to prevent recalculation on every render
//   const pageButtons = useMemo(() => {
//     const buttons = []
//     const maxVisiblePages = 3
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
//     const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1)
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       const pageNum = i; // Capture the correct page number
//       buttons.push(
//         <Button
//           key={i}
//           variant={i === currentPage ? "default" : "ghost"}
//           size="sm"
//           className="h-8 min-w-[2rem] p-0 flex justify-center items-center text-center transition-colors duration-200 hover:border hover:border-gray-300 rounded-md"
//           onClick={(e) => {
//             e.preventDefault();
//             onPageChange(pageNum);
//           }}
//         >
//           {i}
//         </Button>,
//       )
//     }

//     return buttons
//   }, [currentPage, totalPages, onPageChange]);

//   return (
//     <div className="flex items-center gap-2 relative">
//       {/* If loading, add a subtle indicator */}
//       {isLoading && (
//         <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 animate-pulse" />
//       )}
      
//       <div className="text-sm text-muted-foreground hidden sm:block relative overflow-hidden">
//         <div className={`transition-transform duration-300 ${showSelectedRows ? "-translate-y-full" : ""}`}>
//           {total > 0 ? `${startItem}-${endItem} of ${total}` : "No items"}
//         </div>
//         <div
//           className={`absolute top-0 left-0 transition-transform duration-300 ${showSelectedRows ? "" : "translate-y-full"}`}
//         >
//           {selectedRows} row{selectedRows !== 1 ? "s" : ""} selected
//         </div>
//       </div>

//       <div className="flex items-center space-x-1 sm:space-x-2 ">
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
//           onClick={(e) => {
//             e.preventDefault();
//             if (canPreviousPage) onPageChange(1);
//           }}
//           disabled={!canPreviousPage}
//         >
//           <ChevronsLeft className="h-4 w-4" />
//           <span className="sr-only">First page</span>
//         </Button>

//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
//           onClick={(e) => {
//             e.preventDefault();
//             if (canPreviousPage) onPageChange(currentPage - 1);
//           }}
//           disabled={!canPreviousPage}
//         >
//           <ChevronLeft className="h-4 w-4" />
//           <span className="sr-only">Previous page</span>
//         </Button>

//         <div className="hidden md:flex items-center">{pageButtons}</div>

//         <div className="flex md:hidden items-center">
//           <span className="text-sm font-medium px-2 min-w-[3rem] text-center">
//             {currentPage}/{totalPages}
//           </span>
//         </div>

//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
//           onClick={(e) => {
//             e.preventDefault();
//             if (canNextPage) onPageChange(currentPage + 1);
//           }}
//           disabled={!canNextPage}
//           onMouseEnter={() => {
//             if (canNextPage && onNextPageHover) {
//               onNextPageHover();
//             }
//           }}
//         >
//           <ChevronRight className="h-4 w-4" />
//           <span className="sr-only">Next page</span>
//         </Button>

//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
//           onClick={(e) => {
//             e.preventDefault();
//             if (canNextPage) onPageChange(totalPages);
//           }}
//           disabled={!canNextPage}
//         >
//           <ChevronsRight className="h-4 w-4" />
//           <span className="sr-only">Last page</span>
//         </Button>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Select
//           value={`${pageSize}`}
//           onValueChange={(value) => {
//             const newSize = Number(value);
//             if (!isNaN(newSize) && newSize > 0) {
//               onPageSizeChange(newSize);
//             }
//           }}
//         >
//           <SelectTrigger className="h-8 w-[70px] transition-colors duration-200 hover:border hover:border-gray-300 focus:border-gray-400">
//             <SelectValue placeholder={pageSize} />
//           </SelectTrigger>
//           <SelectContent side="top">
//             {[10, 20, 30, 50, 100].map((size) => (
//               <SelectItem key={size} value={`${size}`}>
//                 {size}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline-block">per page</span>
//       </div>
//     </div>
//   )
// });

// export { PaginationControls };
// export default PaginationControls;
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PaginationControlsProps {
  currentPage?: number
  totalPages?: number
  pageSize?: number
  total?: number
  selectedRows?: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onNextPageHover?: () => void
  isLoading?: boolean
}

// Wrap component in memo to prevent unnecessary re-renders
const PaginationControls = React.memo(function PaginationControlsInner({
  currentPage: initialCurrentPage,
  totalPages: initialTotalPages,
  pageSize: initialPageSize,
  total: initialTotal,
  selectedRows = 0,
  onPageChange,
  onPageSizeChange,
  onNextPageHover,
  isLoading = false,
}: PaginationControlsProps) {
  const currentPage = isLoading ? 1 : initialCurrentPage || 1;
  const totalPages = isLoading ? 1 : initialTotalPages || 1;
  const pageSize = isLoading ? 10 : initialPageSize || 10;
  const total = isLoading ? 0 : initialTotal || 0;

  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages
  const [ showSelectedRows, setShowSelectedRows] = useState(false)

  // Calculate the range of items being displayed
  const { startItem, endItem } = useMemo(() => ({
    startItem: total === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, total)
  }), [ currentPage, pageSize, total]);

  // Handle selected rows display
  useEffect(() => {
    if (selectedRows > 0) {
      setShowSelectedRows(true);
      const timer = setTimeout(() => setShowSelectedRows(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowSelectedRows(false);
    }
  }, [ selectedRows ]);

  // Generate page buttons - memoize to prevent recalculation on every render
  const pageButtons = useMemo(() => {
    const buttons = [];
    const maxVisiblePages = 3
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageNum = i; // Capture the correct page number
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "ghost"}
          size="sm"
          className="h-8 min-w-[2rem] p-0 flex justify-center items-center text-center transition-colors duration-200 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            onPageChange(pageNum);
          }}
          disabled={isLoading}
        >
          {i}
        </Button>,
      )
    }

    return buttons
  }, [ currentPage, totalPages, onPageChange, isLoading ]);

  const skeletonButtons = useMemo(() => {
    const skeletons = [];
    const maxVisiblePages = 3;
    for (let i = 0; i < maxVisiblePages; i++) {
      skeletons.push(
        <Skeleton key={i} className="h-8 w-8 rounded-md" />
      );
    }
    return skeletons;
  }, []);


  return (
    <div className="flex items-center gap-2 relative">
      {/* If loading, add a subtle indicator */}
      {isLoading && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 animate-pulse" />
      )}

      <div className="text-sm text-muted-foreground hidden sm:block relative overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-4 w-[100px" />
        ) : (
          <div className={`transition-transform duration-300 ${showSelectedRows ? "-translate-y-full" : ""}`}>
            {total > 0 ? `${startItem}-${endItem} of ${total}` : "No items"}
          </div>
        )}
        <div
          className={`absolute top-0 left-0 transition-transform duration-300 ${showSelectedRows ? "" : "translate-y-full"}`}
        >
          {selectedRows} row{selectedRows !== 1 ? "s" : ""} selected
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 ">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200 rounded-md hover:border hover:border-gray-300"
          onClick={(e) => {
            e.preventDefault();
            if (canPreviousPage) onPageChange(1);
          }}
          disabled={!canPreviousPage || isLoading}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200 rounded-md hover:border hover:border-gray-300"
          onClick={(e) => {
            e.preventDefault();
            if (canPreviousPage) onPageChange(currentPage - 1);
          }}
          disabled={!canPreviousPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <div className="hidden md:flex items-center">
          {isLoading ? skeletonButtons : pageButtons}
        </div>

        <div className="flex md:hidden items-center">
          {isLoading ? (
            <Skeleton className="h-8 w-[50px rounded-md" />
          ) : (
            <span className="text-sm font-medium px-2 min-w-[3rem] text-center">
              {currentPage}/{totalPages}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200 rounded-md hover:border hover:border-gray-300"
          onClick={(e) => {
            e.preventDefault();
            if (canNextPage) onPageChange(currentPage + 1);
          }}
          disabled={!canNextPage || isLoading}
          onMouseEnter={() => {
            if (canNextPage && onNextPageHover) {
              onNextPageHover();
            }
          }}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200 rounded-md hover:border hover:border-gray-300"
          onClick={(e) => {
            e.preventDefault();
            if (canNextPage) onPageChange(totalPages);
          }}
          disabled={!canNextPage || isLoading}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Select
          value={`${pageSize}`}
          disabled={isLoading}
          onValueChange={(value) => {
            const newSize = Number(value);
            if (!isNaN(newSize) && newSize > 0) {
              onPageSizeChange(newSize);
            }
          }}
        >
          <SelectTrigger className={`h-8 w-[70px] transition-colors duration-200 hover:border hover:border-gray-300 focus:border-gray-400 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
            {isLoading ? <Skeleton className="h-4 w-[50px" /> : <SelectValue placeholder={pageSize} />}
          </SelectTrigger>
          <SelectContent side="top">
            {[ 10, 20, 30, 50, 100].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline-block">per page</span>
      </div>
    </div>
  )
});

export { PaginationControls };
export default PaginationControls;