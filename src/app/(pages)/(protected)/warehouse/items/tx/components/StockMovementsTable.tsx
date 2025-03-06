"use client"
import { useCallback, useState, useMemo, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { StockMovementTable } from "./table/table"
import { stockMovementColumns } from "./table/columns"
import { RowSelectionState } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import {
  StockMovementSort,
  type StockMovementSortFields,
  type EnrichedStockMovementView,
  type StockMovementFilters,
  type MovementType
} from "@/types/stockMovement"
import { useStockMovements } from "@/hooks/data-fetcher"
import React from "react"

// Fix the interface to handle null values properly
interface StockMovementsTableProps {
  urlParams: {
    page: number;
    pageSize: number;
    sortField: StockMovementSortFields;
    sortDirection: 'asc' | 'desc';
    search?: string | null;
    movement?: MovementType | null;
    itemName?: string | null;
    customerDisplayName?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    selectedMovementId?: string | null;
    isDetailsOpen: boolean;
  };
  updateUrl: (params: URLSearchParams) => void;
  setIsLocalLoading: (isLoading: boolean) => void;
  isLocalLoading: boolean;
  isMobile: boolean;
  onFetchingChange?: (isFetching: boolean) => void;
}

export function StockMovementsTable({
  urlParams,
  updateUrl,
  setIsLocalLoading,
  isLocalLoading,
  isMobile,
  onFetchingChange
}: StockMovementsTableProps) {
  const searchParams = useSearchParams();
  const {
    page,
    pageSize,
    sortField,
    sortDirection,
    search,
    movement,
    itemName,
    customerDisplayName,
    dateFrom,
    dateTo,
    selectedMovementId,
    isDetailsOpen
  } = urlParams;

  // Build fetch parameters
  const sort: StockMovementSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection
  }), [sortField, sortDirection]);

  // Fix the filters definition to handle potential null values
  const filters: StockMovementFilters = useMemo(() => ({
    ...(search && { search }),
    ...(movement && { movement }),
    ...(itemName && { itemName }),
    ...(customerDisplayName && { customerDisplayName }),
    ...(dateFrom && dateTo && {
      dateRange: {
        from: new Date(dateFrom),
        to: new Date(dateTo)
      }
    })
  }), [search, movement, itemName, customerDisplayName, dateFrom, dateTo]);

  // Fetch data with a stable fetch key
  const fetchKey = useMemo(() => ({
    page,
    pageSize,
    sort,
    filters
  }), [page, pageSize, sort, filters]);
  
  const { 
    data: movements, 
    pagination, 
    isLoading, 
    isFetching, 
    isError,
    error 
  } = useStockMovements(fetchKey);
  
  // Store previous data for optimistic UI
  const prevMovementsRef = useRef<EnrichedStockMovementView[] | null>(null);
  
  // Notify parent about fetching state
  useEffect(() => {
    onFetchingChange?.(isFetching);
    
    // Add a backup timeout to prevent perpetual loading state
    if (isFetching) {
      const timeoutId = setTimeout(() => {
        onFetchingChange?.(false);
      }, 15000); // Force reset fetching status after 15 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [isFetching, onFetchingChange]);
  
  // Update previous data when new data loads
  useEffect(() => {
    if (movements && !isLoading && !isFetching) {
      prevMovementsRef.current = movements;
      setIsLocalLoading(false);
    }
  }, [movements, isLoading, isFetching, setIsLocalLoading]);

  // Add a timeout effect to handle stuck loading states
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isFetching) {
      // If still fetching after 10 seconds, force reset loading state
      timeoutId = setTimeout(() => {
        if (prevMovementsRef.current) {
          setIsLocalLoading(false);
          console.log("Fetch timeout reached, using cached data");
        }
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isFetching, setIsLocalLoading]);

  // Handle row selection with stable references
  const selectedRowsRef = useRef<RowSelectionState>({});
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  
  const handleRowSelection = useCallback((selection: RowSelectionState) => {
    selectedRowsRef.current = selection;
    setSelectedRowsCount(Object.keys(selection).filter(key => selection[key]).length);
  }, []);

  // Handle row click for details with proper URL updates
  const handleRowClick = useCallback((movement: EnrichedStockMovementView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedMovementId === movement.movementId) {
      params.delete('movementId');
    } else {
      params.set('movementId', movement.movementId);
    }
    updateUrl(params);
  }, [searchParams, selectedMovementId, updateUrl]);

  // Handle page change with proper URL handling
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage !== page) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      updateUrl(params);
    }
  }, [searchParams, page, updateUrl]);

  // Handle page size change with proper URL handling
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    if (newPageSize !== pageSize) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('pageSize', newPageSize.toString());
      params.set('page', '1');
      updateUrl(params);
    }
  }, [searchParams, pageSize, updateUrl]);

  // Handle sort change with proper URL handling
  const handleSortChange = useCallback((field: StockMovementSortFields, direction: 'asc' | 'desc') => {
    if (field !== sortField || direction !== sortDirection) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', field);
      params.set('direction', direction);
      params.set('page', '1');
      updateUrl(params);
    }
  }, [searchParams, sortField, sortDirection, updateUrl]);

  // Fix pagination boundary issues
  useEffect(() => {
    if (pagination?.totalPages && page > pagination.totalPages && page !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pagination.totalPages.toString());
      updateUrl(params);
    }
  }, [page, pagination?.totalPages, searchParams, updateUrl]);

  // Display data with optimistic updates
  const displayMovements = useMemo(() => 
    (isLocalLoading || isFetching) && prevMovementsRef.current ? prevMovementsRef.current : movements || [],
    [isLocalLoading, isFetching, movements]
  );

  // Improved error handling display
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Error Loading Data</h3>
        <p className="mt-1 text-sm text-gray-500">
          {error instanceof Error ? error.message : 'An unexpected error occurred while loading data.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200">
        <StockMovementTable
          columns={stockMovementColumns}
          data={displayMovements}
          isLoading={isLoading || isFetching || isLocalLoading}
          onRowClick={handleRowClick}
          selectedId={selectedMovementId}
          isCompact={isDetailsOpen || isMobile}
          onSort={handleSortChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onRowSelectionChange={handleRowSelection}
          selectedRows={selectedRowsRef.current}
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
  );
}
