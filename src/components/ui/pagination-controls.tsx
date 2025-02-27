// // import {
// //   ChevronLeft,
// //   ChevronRight,
// //   ChevronsLeft,
// //   ChevronsRight,
// // } from "lucide-react"

// // import { Button } from "@/components/ui/button"
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select"

// // interface PaginationControlsProps {
// //   currentPage: number
// //   totalPages: number
// //   pageSize: number
// //   total: number
// //   onPageChange: (page: number) => void
// //   onPageSizeChange: (pageSize: number) => void
// // }

// // export function PaginationControls({
// //   currentPage,
// //   totalPages,
// //   pageSize,
// //   total,
// //   onPageChange,
// //   onPageSizeChange,
// // }: PaginationControlsProps) {
// //   const canPreviousPage = currentPage > 1
// //   const canNextPage = currentPage < totalPages

// //   return (
// //     <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4 sm:gap-0">
// //       <div className="hidden sm:block flex-1 text-sm text-muted-foreground">
// //         {total} total rows
// //       </div>
// //       <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
// //         <div className="flex items-center space-x-2">
// //           <p className="text-sm font-medium hidden sm:block  text-nowrap">Rows per page</p>
// //           <p className="text-sm font-medium sm:hidden">Rows:</p>
// //           <Select
// //             value={`${pageSize}`}
// //             onValueChange={(value) => {
// //               onPageSizeChange(Number(value))
// //             }}
// //           >
// //             <SelectTrigger className="h-8 w-[50%]">
// //               <SelectValue placeholder={pageSize} />
// //             </SelectTrigger>
// //             <SelectContent side="top">
// //               {[10, 20, 30, 40, 50, 100].map((size) => (
// //                 <SelectItem key={size} value={`${size}`}>
// //                   {size}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>
// //         </div>
// //         <div className="flex w-[90px] items-center justify-center text-sm font-medium">
// //           {currentPage}/{totalPages}
// //         </div>
// //         <div className="flex items-center space-x-1 sm:space-x-2">
// //           <Button
// //             variant="outline"
// //             className="hidden h-8 w-8 p-0 lg:flex"
// //             onClick={() => onPageChange(1)}
// //             disabled={!canPreviousPage}
// //           >
// //             <span className="sr-only">Go to first page</span>
// //             <ChevronsLeft className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="outline"
// //             className="h-8 w-8 p-0"
// //             onClick={() => onPageChange(currentPage - 1)}
// //             disabled={!canPreviousPage}
// //           >
// //             <span className="sr-only">Go to previous page</span>
// //             <ChevronLeft className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="outline"
// //             className="h-8 w-8 p-0"
// //             onClick={() => onPageChange(currentPage + 1)}
// //             disabled={!canNextPage}
// //           >
// //             <span className="sr-only">Go to next page</span>
// //             <ChevronRight className="h-4 w-4" />
// //           </Button>
// //           <Button
// //             variant="outline"
// //             className="hidden h-8 w-8 p-0 lg:flex"
// //             onClick={() => onPageChange(totalPages)}
// //             disabled={!canNextPage}
// //           >
// //             <span className="sr-only">Go to last page</span>
// //             <ChevronsRight className="h-4 w-4" />
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// interface PaginationControlsProps {
//   currentPage: number
//   totalPages: number
//   pageSize: number
//   total: number
//   onPageChange: (page: number) => void
//   onPageSizeChange: (pageSize: number) => void
// }

// export function PaginationControls({
//   currentPage,
//   totalPages,
//   pageSize,
//   total,
//   onPageChange,
//   onPageSizeChange,
// }: PaginationControlsProps) {
//   const canPreviousPage = currentPage > 1
//   const canNextPage = currentPage < totalPages

//   // Generate page buttons
//   const getPageButtons = () => {
//     const buttons = []
//     const maxVisiblePages = 3
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
//     const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1)
//     }

//     if (startPage > 1) {
//       buttons.push(
//         <Button key="ellipsis-start" variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
//           ...
//         </Button>,
//       )
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       buttons.push(
//         <Button
//           key={i}
//           variant={i === currentPage ? "default" : "ghost"}
//           size="sm"
//           className="h-8 w-8 p-0"
//           onClick={() => onPageChange(i)}
//         >
//           {i}
//         </Button>,
//       )
//     }

//     if (endPage < totalPages) {
//       buttons.push(
//         <Button key="ellipsis-end" variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
//           ...
//         </Button>,
//       )
//     }

//     return buttons
//   }

//   // Calculate the range of items being displayed
//   const startItem = (currentPage - 1) * pageSize + 1
//   const endItem = Math.min(currentPage * pageSize, total)

//   return (
//     <div className="flex items-center justify-between">
//       <div className="text-sm text-muted-foreground hidden sm:block">
//         {startItem}-{endItem} of {total}
//       </div>

//       <div className="flex items-center space-x-1 sm:space-x-2">
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0"
//           onClick={() => onPageChange(1)}
//           disabled={!canPreviousPage}
//         >
//           <ChevronsLeft className="h-4 w-4" />
//           <span className="sr-only">First page</span>
//         </Button>

//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0"
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={!canPreviousPage}
//         >
//           <ChevronLeft className="h-4 w-4" />
//           <span className="sr-only">Previous page</span>
//         </Button>

//         <div className="hidden md:flex items-center">{getPageButtons()}</div>

//         <div className="flex md:hidden items-center">
//           <span className="text-sm font-medium px-2">
//             {currentPage}/{totalPages}
//           </span>
//         </div>

//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0"
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={!canNextPage}
//         >
//           <ChevronRight className="h-4 w-4" />
//           <span className="sr-only">Next page</span>
//         </Button>

//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 p-0"
//           onClick={() => onPageChange(totalPages)}
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
//             onPageSizeChange(Number(value))
//           }}
//         >
//           <SelectTrigger className="h-8 w-[70px]">
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
// }

"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  selectedRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  total,
  selectedRows,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages
  const [showSelectedRows, setShowSelectedRows] = useState(false)

  useEffect(() => {
    setShowSelectedRows(selectedRows > 0)
    const timer = setTimeout(() => setShowSelectedRows(false), 3000)
    return () => clearTimeout(timer)
  }, [selectedRows])

  // Generate page buttons
  const getPageButtons = () => {
    const buttons = []
    const maxVisiblePages = 3
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      buttons.push(
        <Button
          key="ellipsis-start"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-opacity duration-200"
          disabled
        >
          ...
        </Button>,
      )
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 transition-colors duration-200"
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>,
      )
    }

    if (endPage < totalPages) {
      buttons.push(
        <Button
          key="ellipsis-end"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-opacity duration-200"
          disabled
        >
          ...
        </Button>,
      )
    }

    return buttons
  }

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground hidden sm:block relative overflow-hidden">
        <div className={`transition-transform duration-300 ${showSelectedRows ? "-translate-y-full" : ""}`}>
          {startItem}-{endItem} of {total}
        </div>
        <div
          className={`absolute top-0 left-0 transition-transform duration-300 ${showSelectedRows ? "" : "translate-y-full"}`}
        >
          {selectedRows} row{selectedRows !== 1 ? "s" : ""} selected
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200"
          onClick={() => onPageChange(1)}
          disabled={!canPreviousPage}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <div className="hidden md:flex items-center">{getPageButtons()}</div>

        <div className="flex md:hidden items-center">
          <span className="text-sm font-medium px-2">
            {currentPage}/{totalPages}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNextPage}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNextPage}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            onPageSizeChange(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[70px] transition-colors duration-200">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 50, 100].map((size) => (
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
}

