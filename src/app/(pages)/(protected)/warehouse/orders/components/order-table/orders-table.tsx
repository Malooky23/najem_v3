"use client"
import { useMemo, useCallback, memo } from 'react';
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { EnrichedOrders, OrderSortField } from "@/types/orders";
import SortHeader from "@/components/ui/data-table/sort-headers"; // Import the external SortHeader component

interface OrdersTableProps {
  columns: ColumnDef<EnrichedOrders, any>[]
  data: EnrichedOrders[]
  isLoading?: boolean
  onRowClick?: (order: EnrichedOrders) => void
  selectedId?: string
  isCompact?: boolean
  onSort?: (field: string, direction: 'asc' | 'desc') => void
  sortField?: OrderSortField
  sortDirection?: 'asc' | 'desc'
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  selectedRows?: RowSelectionState;
  pageSize?: number;
}

type ExtendedColumnDef = ColumnDef<EnrichedOrders, any> & {
  accessorKey?: string;
  id?: string;
  header?: string | ((props: any) => React.ReactNode);
};

// Optimize the component with strict memoization
export const OrdersTable = memo(function OrdersTable({
  columns,
  data,
  isLoading,
  onRowClick,
  selectedId,
  isCompact = false,
  onSort,
  sortField,
  sortDirection,
  onRowSelectionChange,
  pageSize
}: OrdersTableProps) {
  // Memoize visible columns to prevent recalculation
  const visibleColumns = useMemo(() => {
    const sortableFields: OrderSortField[] = ['orderNumber', 'status', 'createdAt', 'customerName'];
    const centeredColumns = ['orderNumber', 'status']; // Add columns that should be centered

    return columns.map((column: ExtendedColumnDef) => {
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
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            centerHeaders={centeredColumns}
          />
        )
      };

      return newColumn;
    });
  }, [columns, onSort, sortField, sortDirection]);

  // Filter columns for compact mode
  const displayColumns = useMemo(() => {
    if (isCompact) {
      return visibleColumns.filter((column: ExtendedColumnDef) => {
        const columnId = column.accessorKey || column.id;
        return ['orderNumber', 'customerName', 'status', "items"].includes(columnId || '');
      });
    }
    return visibleColumns;
  }, [visibleColumns, isCompact]);

  // Use a more efficient row className function
  const getRowClassName = useCallback((row: any) => {
    return cn(
      "hover:bg-slate-200 cursor-pointer transition-colors",
      row.orderId === selectedId && "bg-blue-50 hover:bg-blue-100"
    );
  }, [selectedId]);

  // Handle row click optimized
  const handleRowClick = useCallback((row: EnrichedOrders) => {
    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick]);

  return (
    <div className="h-full flex-1 overflow-hidden rounded-md">
      <DataTable
        columns={displayColumns}
        data={data}
        isLoading={isLoading}
        onRowSelectionChange={onRowSelectionChange}
        rowClassName={getRowClassName}
        onRowClick={handleRowClick}
        pageSize={pageSize}
      />
    </div>
  );
});