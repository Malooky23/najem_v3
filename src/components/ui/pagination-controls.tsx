"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  selectedRows?: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onNextPageHover?: () => void
  isLoading?: boolean; // New prop
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  total,
  selectedRows = 0,
  onPageChange,
  onPageSizeChange,
  onNextPageHover,
  isLoading = false
}: PaginationControlsProps) {
  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages
  const [showSelectedRows, setShowSelectedRows] = useState(false)

  // Calculate the range of items being displayed
  const { startItem, endItem } = useMemo(() => ({
    startItem: (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, total)
  }), [currentPage, pageSize, total]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    onPageSizeChange(size);
  }, [onPageSizeChange]);

  // Manage selected rows display with optimized effect
  useEffect(() => {
    if (selectedRows > 0) {
      setShowSelectedRows(true);
      const timer = setTimeout(() => setShowSelectedRows(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowSelectedRows(false);
    }
  }, [selectedRows]);

  // Generate page buttons - memoize to prevent recalculation on every render
  const pageButtons = useMemo(() => {
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
      const pageNum = i; // Capture the correct page number
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 transition-colors duration-200 hover:border hover:border-gray-300 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pageNum);
          }}
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
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <div className="flex items-center gap-2 relative">
      {/* If loading, add a subtle indicator */}
      {isLoading && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 animate-pulse" />
      )}
      
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

      <div className="flex items-center space-x-1 sm:space-x-2 ">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(1);
          }}
          disabled={!canPreviousPage}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(currentPage - 1);
          }}
          disabled={!canPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <div className="hidden md:flex items-center">{pageButtons}</div>

        <div className="flex md:hidden items-center">
          <span className="text-sm font-medium px-2">
            {currentPage}/{totalPages}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(currentPage + 1);
          }}
          disabled={!canNextPage}
          onMouseEnter={() => {
            console.log('HOVER');
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
          className="h-8 w-8 p-0 transition-opacity duration-200 hover:border hover:border-gray-300 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(totalPages);
          }}
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
            handlePageSizeChange(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[70px] transition-colors duration-200 hover:border hover:border-gray-300 focus:border-gray-400">
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

// To further optimize this component, consider wrapping it with React.memo
export default React.memo(PaginationControls);

