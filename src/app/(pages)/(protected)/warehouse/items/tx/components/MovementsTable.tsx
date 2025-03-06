"use client"
import { useCallback, useEffect, memo } from "react"
import { StockMovementTable } from "./table/table"
import { stockMovementColumns } from "./table/columns"
import { useStockMovements } from "@/hooks/useStockMovements"
import { useStockMovementStore } from "@/stores/stock-movement-store"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { RowSelectionState } from "@tanstack/react-table"
import { EnrichedStockMovementView, StockMovementSortFields } from "@/types/stockMovement"

interface MovementsTableProps {
  isMobile: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry: () => void;
}

interface TablePaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedRowsCount: number;
}

// Memoized error component
const ErrorDisplay = memo<ErrorDisplayProps>(function ErrorDisplay({ 
  error, 
  onRetry 
}) {
  return (
    <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
      Error loading movements: {error instanceof Error ? error.message : 'Unknown error'}
      <button 
        className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-800"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
});

// Memoized pagination component
const TablePagination = memo<TablePaginationProps>(function TablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  selectedRowsCount
}) {
  return (
    <div className="p-2 flex w-full justify-center min-w-0">
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        selectedRows={selectedRowsCount}
      />
    </div>
  );
});

export const MovementsTable = memo<MovementsTableProps>(function MovementsTable({
  isMobile,
  onLoadingChange
}) {
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
  
  // Get filters and sort once per render
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
  
  // Memoized callbacks
  const handleRowClick = useCallback((movement: EnrichedStockMovementView) => {
    selectMovement(selectedMovementId === movement.movementId ? null : movement.movementId)
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
  
  // Error handling
  if (isError) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
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
        />
      </div>
      
      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          selectedRowsCount={0}
        />
      )}
    </>
  )
})
