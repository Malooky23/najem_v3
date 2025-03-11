"use client"
import { useMemo, useCallback, useState, memo, useEffect, useRef } from 'react';
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { EnrichedOrders, OrderSortField, OrderSort } from "@/types/orders";
import SortHeader from "@/components/ui/data-table/sort-headers"; // Import the external SortHeader component
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ordersColumns } from './orders-columns';

interface OrdersTableProps {
  data: EnrichedOrders[];
  isLoading: boolean;
  isFetching?: boolean;
  onRowClick?: (order: EnrichedOrders) => void;
  selectedOrderId?: string;
  pagination: {
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
  sort: OrderSort;
  onSortChange: (sort: { field: string, direction: 'asc' | 'desc' }) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

type ExtendedColumnDef = ColumnDef<EnrichedOrders, any> & {
  accessorKey?: string;
  id?: string;
  header?: string | ((props: any) => React.ReactNode);
};

// Optimize the component with strict memoization
export const OrdersTable = memo(function OrdersTable({
  data,
  isLoading,
  isFetching = false,
  onRowClick,
  selectedOrderId,
  pagination,
  sort,
  onSortChange,
  onPageChange,
  onPageSizeChange
}: OrdersTableProps) {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const prevPagination = useRef(pagination);

  // Debug pagination
  console.log('OrdersTable pagination:', pagination);
  console.log('OrdersTable data length:', data?.length || 0);

  // Track when pagination changes to scroll to top
  useEffect(() => {
    if (prevPagination.current?.currentPage !== pagination?.currentPage) {
      // Scroll table container to top when page changes
      const tableContainer = document.querySelector('.data-table-container');
      if (tableContainer) {
        tableContainer.scrollTop = 0;
      }
    }
    
    prevPagination.current = pagination;
  }, [pagination]);

  // Memoize visible columns to prevent recalculation
  const visibleColumns = useMemo(() => {
    const sortableFields: OrderSortField[] = ['orderNumber', 'status', 'createdAt', 'customerName'];
    const centeredColumns = ['orderNumber', 'status']; // Add columns that should be centered

    return ordersColumns.map((column: ExtendedColumnDef) => {
      const columnId = column.accessorKey || column.id;
      if (!columnId || !sortableFields.includes(columnId as OrderSortField)) {
        return column;
      }

      // Get the original header content
      const originalHeader = typeof column.header === 'string'
        ? column.header
        : columnId;

      // Create a new column definition with custom header
      const newColumn: ExtendedColumnDef = {
        ...column,
        id: columnId,
        header: () => (
          <SortHeader
            columnId={columnId}
            originalHeader={originalHeader}
            sortField={sort.field}
            sortDirection={sort.direction}
            onSort={onSortChange}
            centerHeaders={centeredColumns}
          />
        )
      };

      return newColumn;
    });
  }, [onSortChange, sort.field, sort.direction]);


  const handleRowSelection = useCallback((selection: RowSelectionState) => {
    setSelectedRows(selection);
  }, []);

  const selectedCount = Object.keys(selectedRows)
    .filter(key => selectedRows[key])
    .length;

  // Use a more efficient row className function
  const getRowClassName = useCallback((row: any) => {
    return cn(
      "hover:bg-slate-200 cursor-pointer transition-colors",
      row.orderId === selectedOrderId && "bg-blue-50 hover:bg-blue-100"
    );
  }, [selectedOrderId]);

  // Handle row click optimized
  const handleRowClick = useCallback((row: EnrichedOrders) => {
    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick]);

  // Ensure pagination object is valid
  const validPagination = useMemo(() => {
    if (!pagination) {
      return {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 0
      };
    }
    
    return {
      total: pagination.total || 0,
      pageSize: pagination.pageSize || 10,
      currentPage: pagination.currentPage || 1,
      totalPages: pagination.totalPages || Math.max(1, Math.ceil((pagination.total || 0) / (pagination.pageSize || 10)))
    };
  }, [pagination]);

  // Handle pagination actions
  const handlePageChange = useCallback((page: number) => {
    console.log('Table requesting page change to:', page);
    onPageChange(page);
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    console.log('Table requesting page size change to:', size);
    onPageSizeChange(size);
  }, [onPageSizeChange]);

  const isLoadingEffective = isLoading || isFetching;

  return (
    <div className="flex flex-col rounded-md h-full">
      <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200 relative data-table-container">
        {/* Subtle loading indicator that doesn't block UI */}
        {isFetching && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse z-10" />
        )}
        <DataTable
          columns={visibleColumns}
          data={data}
          isLoading={isLoadingEffective}
          onRowSelectionChange={handleRowSelection}
          rowClassName={getRowClassName}
          onRowClick={handleRowClick}
          pageSize={validPagination.pageSize}
        />
      </div>
      {validPagination && (
        <div className="p-2 flex w-full justify-center min-w-0">
          <PaginationControls
            currentPage={validPagination.currentPage}
            totalPages={validPagination.totalPages}
            pageSize={validPagination.pageSize}
            total={validPagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            selectedRows={selectedCount}
            isLoading={isFetching}
          />
        </div>
      )}
    </div>
  );
});