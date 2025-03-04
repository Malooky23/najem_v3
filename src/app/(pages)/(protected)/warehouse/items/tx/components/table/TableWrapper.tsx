"use client"

import { useStockMovementContext } from "../../context/stock-movement-context"
import { StockMovementTable } from "./table"
import { stockMovementColumns } from "./columns"
import { useCallback, useState, useMemo } from "react"
import { RowSelectionState } from "@tanstack/react-table"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { EnrichedStockMovementView, StockMovementSortFields } from "@/types/stockMovement"
import { useStockMovements } from "@/hooks/data-fetcher"
import { PaginationControls } from "@/components/ui/pagination-controls"

export function TableWrapper() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { 
    filters, 
    sort, 
    setSort,
    selectedMovementId,
    setSelectedMovementId,
    initialData
  } = useStockMovementContext()

  // Local state for table
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({})

  // Fetch data using the optimized hook with initialData
  const { 
    data: movements, 
    pagination, 
    isLoading 
  } = useStockMovements({
    page,
    pageSize,
    filters,
    sort
  })

  // Memoize handlers to prevent unnecessary re-renders
  const handleSort = useCallback((field: StockMovementSortFields, direction: 'asc' | 'desc') => {
    if (field !== sort.field || direction !== sort.direction) {
      setSort({ field, direction })
    }
  }, [sort.field, sort.direction, setSort])

  const handleRowClick = useCallback((movement: EnrichedStockMovementView) => {
    setSelectedMovementId(movement.referenceId === selectedMovementId ? null : movement.referenceId)
  }, [selectedMovementId, setSelectedMovementId])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, [])

  const handleRowSelection = useCallback((selection: RowSelectionState) => {
    setSelectedRows(selection)
  }, [])

  // Memoize computed values
  const isDetailsOpen = useMemo(() => !!selectedMovementId, [selectedMovementId])
  
  const tableData = useMemo(() => 
    movements || initialData?.movements || [], 
    [movements, initialData?.movements]
  )

  const currentPagination = useMemo(() => 
    pagination || initialData?.pagination,
    [pagination, initialData?.pagination]
  )

  return (
    <div className={cn(
      "flex flex-col rounded-md transition-all duration-300",
      isMobile ? (isDetailsOpen ? "hidden" : "w-full") : (isDetailsOpen ? "w-[40%]" : "w-full"),
    )}>
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200">
        <StockMovementTable
          columns={stockMovementColumns}
          data={tableData}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          selectedId={selectedMovementId || undefined}
          isCompact={isDetailsOpen || isMobile}
          onSort={handleSort}
          sortField={sort.field}
          sortDirection={sort.direction}
          onRowSelectionChange={handleRowSelection}
          selectedRows={selectedRows}
        />
      </div>
      {currentPagination && (
        <div className="p-2 flex w-full justify-center min-w-0">
          <PaginationControls
            currentPage={currentPagination.currentPage}
            totalPages={currentPagination.totalPages}
            pageSize={currentPagination.pageSize}
            total={currentPagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            selectedRows={Object.keys(selectedRows).filter(key => selectedRows[key]).length}
          />
        </div>
      )}
    </div>
  )
}