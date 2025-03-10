"use client"
import { useMemo, useCallback, useState, memo } from 'react';
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
  pagination: any;
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

  return (
      <div className="flex flex-col rounded-md h-full">
        <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-slate-50 border-2 border-slate-200 relative">
        {/* Subtle loading indicator that doesn't block UI */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse z-10" />
        )}
        <DataTable
          columns={visibleColumns}
          data={data}
          isLoading={isLoading}
          onRowSelectionChange={handleRowSelection}
          rowClassName={getRowClassName}
          onRowClick={handleRowClick}
          pageSize={pagination?.pageSize}
        />
      </div>
      {pagination && (
        <div className="p-2 flex w-full justify-center min-w-0">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            selectedRows={selectedCount}
            isLoading={isFetching && !isLoading} // Show subtle loading in pagination
          />
        </div>
      )}
      </div>
  );
});