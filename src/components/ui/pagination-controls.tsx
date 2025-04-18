"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

export interface PaginationTheme {
  variant: string
  container: string
  pageButton: string
  activePageButton: string
  navButton: string
  countText: string
  selectTrigger: string
}

// Default theme
export const defaultTheme: PaginationTheme = {
  variant: "default",
  container: "bg-secondary rounded-lg border border-slate-500 p-0.5",
  pageButton: "rounded-lg  hover:scale-[95%] hover:bg-orange-800/50 hover:shadow-sm",
  activePageButton: "bg-orange-800/70  font-semibold text-primary-foreground hover:scale-[105%] hover:bg-orange-700 hover:text-white hover:shadow-sm",
  navButton: "rounded-lg hover:scale-[110%] hover:bg-background hover:shadow-sm",
  countText: "text-muted-foreground",
  selectTrigger: "rounded-lg  border-1 border-slate-500 bg-secondary hover:bg-secondary/80",
}

// Predefined themes
export const paginationThemes: Record<string, PaginationTheme> = {
  default: defaultTheme,

  minimal: {
    variant: "minimal",
    container: "bg-transparent",
    pageButton: "rounded-md hover:bg-secondary/50",
    activePageButton: "bg-secondary/80 text-foreground font-medium",
    navButton: "rounded-md hover:bg-secondary/50",
    countText: "text-muted-foreground",
    selectTrigger: "rounded-md border bg-transparent",
  },

  vibrant: {
    variant: "vibrant",
    container: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-1.5 shadow-md",
    pageButton: "rounded-lg hover:bg-white/30 hover:shadow-sm",
    activePageButton: "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md",
    navButton: "rounded-lg hover:bg-white/30 hover:shadow-sm",
    countText: "text-purple-700 dark:text-purple-300",
    selectTrigger: "rounded-lg border-0 bg-white/30 hover:bg-white/50 shadow-sm",
  },

  sharp: {
    variant: "sharp",
    container: "bg-zinc-100 dark:bg-zinc-800 rounded-none p-1 border border-zinc-200 dark:border-zinc-700",
    pageButton: "rounded-none hover:bg-zinc-200 dark:hover:bg-zinc-700",
    activePageButton: "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium",
    navButton: "rounded-none hover:bg-zinc-200 dark:hover:bg-zinc-700",
    countText: "text-zinc-500 dark:text-zinc-400 font-mono",
    selectTrigger: "rounded-none border border-zinc-200 dark:border-zinc-700 bg-transparent",
  },

  soft: {
    variant: "soft",
    container: "bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-2 shadow-sm",
    pageButton: "rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30",
    activePageButton: "bg-blue-500 text-white font-medium shadow-sm",
    navButton: "rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30",
    countText: "text-blue-600 dark:text-blue-300",
    selectTrigger: "rounded-xl border-0 bg-blue-100/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30",
  },

  outline: {
    variant: "outline",
    container: "bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-1",
    pageButton: "rounded-md border border-transparent hover:border-gray-300 dark:hover:border-gray-600",
    activePageButton: "bg-transparent border border-gray-300 dark:border-gray-600 text-foreground font-medium",
    navButton: "rounded-md border border-transparent hover:border-gray-300 dark:hover:border-gray-600",
    countText: "text-muted-foreground",
    selectTrigger: "rounded-md border border-gray-200 dark:border-gray-700 bg-transparent",
  },

  pill: {
    variant: "pill",
    container: "bg-transparent",
    pageButton: "rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
    activePageButton: "bg-black text-white dark:bg-white dark:text-black border-transparent font-medium",
    navButton: "rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
    countText: "text-muted-foreground",
    selectTrigger: "rounded-full border border-gray-200 dark:border-gray-700 bg-transparent",
  },

  neon: {
    variant: "neon",
    container:
      "bg-black dark:bg-black/50 rounded-lg p-1.5 shadow-[0_0_10px_rgba(0,255,170,0.3)] dark:shadow-[0_0_15px_rgba(0,255,170,0.5)]",
    pageButton: "rounded-md text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300",
    activePageButton: "bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(0,255,170,0.5)]",
    navButton: "rounded-md text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300",
    countText: "text-emerald-400",
    selectTrigger: "rounded-md border-emerald-700 bg-black text-emerald-400 hover:border-emerald-500",
  },

  pastel: {
    variant: "pastel",
    container: "bg-pink-50 dark:bg-pink-950/20 rounded-xl p-1.5 border border-pink-100 dark:border-pink-900/30",
    pageButton: "rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/20 text-pink-700 dark:text-pink-300",
    activePageButton: "bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 font-medium",
    navButton: "rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/20 text-pink-700 dark:text-pink-300",
    countText: "text-pink-600 dark:text-pink-300",
    selectTrigger:
      "rounded-lg border-pink-100 dark:border-pink-900/30 bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300",
  },

  glassmorphism: {
    variant: "glassmorphism",
    container: "bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-1.5 border border-white/20 shadow-sm",
    pageButton: "rounded-lg hover:bg-white/10 text-gray-700 dark:text-gray-300",
    activePageButton: "bg-white/20 text-gray-900 dark:text-white font-medium shadow-sm backdrop-blur-sm",
    navButton: "rounded-lg hover:bg-white/10 text-gray-700 dark:text-gray-300",
    countText: "text-gray-600 dark:text-gray-400",
    selectTrigger: "rounded-lg border-white/20 bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-300",
  },
}

interface PaginationControlsProps<TData> {
  currentPage?: number
  totalPages?: number
  pageSize?: number
  total?: number
  selectedRows?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onNextPageHover?: () => void
  isLoading?: boolean
  isFetching?: boolean
  table?: Table<TData>
  theme?: PaginationTheme | string
}

function PaginationControls<TData>({
  currentPage: initialCurrentPage,
  totalPages: initialTotalPages,
  pageSize: initialPageSize,
  total: initialTotal,
  selectedRows = 0,
  onPageChange,
  onPageSizeChange,
  onNextPageHover,
  isLoading = false,
  isFetching = false,
  table,
  theme = "default",
}: PaginationControlsProps<TData>) {
  isLoading = false
  const currentPage = isLoading ? 1 : (initialCurrentPage ?? 1)
  const totalPages = isLoading ? 1 : (initialTotalPages ?? 1)
  const pageSize = isLoading ? 10 : (initialPageSize ?? 10)
  const total = isLoading ? 0 : (initialTotal ?? 0)

  // Resolve theme
  const themeObj = typeof theme === "string" ? paginationThemes[ theme ] || paginationThemes.default : theme

  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  // State for selected row animation
  const [ showSelectedRows, setShowSelectedRows ] = useState(false)
  const selectedRowsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Effect for selected row display timer
  useEffect(() => {
    if (selectedRowsTimeoutRef.current) {
      clearTimeout(selectedRowsTimeoutRef.current)
    }

    if (selectedRows > 0) {
      setShowSelectedRows(true)
      selectedRowsTimeoutRef.current = setTimeout(() => setShowSelectedRows(false), 3000)
    } else {
      setShowSelectedRows(false)
    }

    return () => {
      if (selectedRowsTimeoutRef.current) {
        clearTimeout(selectedRowsTimeoutRef.current)
      }
    }
  }, [ selectedRows ])

  // Item Range Calculation
  const { startItem, endItem } = useMemo(
    () => ({
      startItem: total === 0 ? 0 : (currentPage - 1) * pageSize + 1,
      endItem: Math.min(currentPage * pageSize, total),
    }),
    [ currentPage, pageSize, total ],
  )

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5
    const pages = []

    // Always show first page
    if (totalPages > 0) {
      pages.push(1)
    }

    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1)
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1)

    // Adjust range to show more pages if we're at the start or end
    if (currentPage <= 3) {
      rangeEnd = Math.min(totalPages - 1, 4)
    } else if (currentPage >= totalPages - 2) {
      rangeStart = Math.max(2, totalPages - 3)
    }

    // Add ellipsis before range if needed
    if (rangeStart > 2) {
      pages.push(-1) // -1 represents ellipsis
    }

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Add ellipsis after range if needed
    if (rangeEnd < totalPages - 1) {
      pages.push(-2) // -2 represents ellipsis (using different key)
    }

    // Always show last page if we have more than one page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }, [ currentPage, totalPages ])

  // Event Handlers
  const handlePageChange = (page: number) => {
    if (page === currentPage) return
    if (onPageChange) onPageChange(page)
    if (table) table.setPageIndex(page - 1)
  }

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value)
    if (!isNaN(newSize) && newSize > 0) {
      if (onPageSizeChange) onPageSizeChange(newSize)
      if (table) table.setPageSize(newSize)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 py-2",
        (isLoading || isFetching) && "opacity-70",
        `pagination-theme-${themeObj.variant}`,
      )}
    >

      {/* Right side - Item count */}
      <div className="relative h-6 overflow-hidden min-w-[100px]">
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <div className="flex items-center">
            <div
              className={cn(
                "absolute inset-0 flex items-center transition-transform duration-300 ease-in-out",
                showSelectedRows ? "translate-y-full opacity-0" : "translate-y-0 opacity-100",
              )}
            >
              <span className={cn("text-sm", themeObj.countText)}>
                {total > 0 ? `${startItem}-${endItem} of ${total}` : "No items"}
              </span>
            </div>
            <div
              className={cn(
                "absolute inset-0 flex items-center transition-transform duration-300 ease-in-out",
                showSelectedRows ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
              )}
            >
              <span className="text-sm font-medium">
                <span className="text-primary">{selectedRows}</span> {selectedRows === 1 ? "row" : "rows"} selected
              </span>
            </div>
          </div>
        )}
      </div>
      

      {/* Center - Pagination controls */}
      <div className="flex items-center">
        <div className={cn("flex items-center", themeObj.container)}>
          {/* Previous button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-all duration-200",
              !canPreviousPage && "opacity-50",
              canPreviousPage && themeObj.navButton,
            )}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPreviousPage || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center px-1 ">
            {pageNumbers.map((page, index) =>
              page < 0 ? (
                // Ellipsis
                <div
                  key={`ellipsis-${page}`}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                >
                  ···
                </div>
              ) : (
                // Page number
                <Button
                  key={`page-${page}`}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 transition-all duration-200",
                    themeObj.pageButton,
                    page === currentPage && themeObj.activePageButton,
                  )}
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              ),
            )}
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-all duration-200",
              !canNextPage && "opacity-50",
              canNextPage && themeObj.navButton,
            )}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNextPage || isLoading}
            onMouseEnter={() => {
              if (canNextPage && onNextPageHover) onNextPageHover()
            }}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {/* Left side - Page size selector */}
      <div className="flex items-center gap-2">
        <Select value={`${pageSize}`} disabled={isLoading} onValueChange={handlePageSizeChange}>
          <SelectTrigger className={cn("h-full w-[70px] transition-colors focus:outline-none focus:outline-0", themeObj.selectTrigger)}>
            {isLoading ? <Skeleton className="h-4 w-12" /> : <SelectValue placeholder={pageSize} />}
          </SelectTrigger>
          <SelectContent>
            {[ 10, 20, 50, 100 ].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>
      
    </div>
  )
}

export { PaginationControls }
export default PaginationControls
