"use client"
import { useCallback, useEffect, useState } from "react"
import { StockMovementTable } from "./table/table"
import { stockMovementColumns } from "./table/columns"
import { useStockMovements } from "@/hooks/useStockMovements"
import { useStockMovementStore } from "@/stores/stock-movement-store"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { RowSelectionState } from "@tanstack/react-table"
import React from "react"
import { EnrichedStockMovementView, StockMovementSortFields } from "@/types/stockMovement"

interface MovementsTableProps {
  isMobile: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

export const MovementsTable = React.memo(function MovementsTable({
  isMobile,
  onLoadingChange
}: MovementsTableProps) {
  // Get values and actions from store
  const {
    page,
    pageSize,
    sortField,
    sortDirection,
    selectedMovementId,
    isDetailsOpen,
    setPage,
    setPageSize,
    setSort,
    selectMovement,
    getFilters,
    getSort,
  } = useStockMovementStore()
  
  // Row selection state
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({})
  
  // Get filters and sort
  const filters = getFilters()
  const sort = getSort()
  
  // Fetch data
  const {
    data: movements,
    pagination,
    isLoading: queryLoading,
    isFetching: queryFetching,
    isError,
    error,
    refetch
  } = useStockMovements({
    page,
    pageSize,
    filters,
    sort
  })
  
  // Track loading states
  useEffect(() => {
    onLoadingChange?.(queryLoading || queryFetching)
  }, [queryLoading, queryFetching, onLoadingChange])
  
  // Callbacks
  const handleRowSelection = useCallback((selection: RowSelectionState) => {
    setSelectedRows(selection)
  }, [])
  
  const handleRowClick = useCallback((movement: EnrichedStockMovementView) => {
    if (selectedMovementId === movement.movementId) {
      selectMovement(null)
    } else {
      selectMovement(movement.movementId)
    }
  }, [selectedMovementId, selectMovement])
  
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [setPage])
  
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
  }, [setPageSize])
  
  const handleSortChange = useCallback((field: string, direction: string) => {
    setSort(field as StockMovementSortFields, direction as 'asc' | 'desc')
  }, [setSort])
  
  // Calculate selected rows count
  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length
  
  // Error handling
  if (isError) {
    return (
      <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
        Error loading movements: {error instanceof Error ? error.message : 'Unknown error'}
        <button 
          className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-800"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    )
  }
  
  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200">
        <StockMovementTable
          columns={stockMovementColumns}
          data={movements || []}
          isLoading={queryLoading || queryFetching}
          onRowClick={handleRowClick}
          selectedId={selectedMovementId}
          isCompact={isDetailsOpen || isMobile}
          onSort={handleSortChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onRowSelectionChange={handleRowSelection}
          selectedRows={selectedRows}
        />
      </div>
      
      {pagination && (
        <div className="p-2 flex w-full justify-center min-w-0">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            selectedRows={selectedRowsCount}
          />
        </div>
      )}
    </>
  )
})

MovementsTable.displayName = "MovementsTable"
