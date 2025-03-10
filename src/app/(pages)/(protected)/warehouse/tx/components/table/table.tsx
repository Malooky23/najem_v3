"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useMemo, useCallback } from "react"
import { EnrichedStockMovementView, StockMovementSortFields } from "@/types/stockMovement"
import React from "react"
import SortHeader from "@/components/ui/data-table/sort-headers"

interface StockMovementTableProps {
  columns: ColumnDef<EnrichedStockMovementView>[]
  data: EnrichedStockMovementView[]
  isLoading?: boolean
  onRowClick?: (order: EnrichedStockMovementView) => void
  selectedId?: string | null
  isCompact?: boolean
  onSort?: (field: string, direction: 'asc' | 'desc') => void
  sortField?: StockMovementSortFields
  sortDirection?: 'asc' | 'desc'
  onRowSelectionChange?: (selection: RowSelectionState) => void
  selectedRows?: RowSelectionState
}

type ExtendedColumnDef = ColumnDef<EnrichedStockMovementView> & {
  id?: string;
  accessorKey?: string;
  header?: string | ((props: any) => React.ReactNode);
};

export function StockMovementTable({
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
}: StockMovementTableProps) {

  // Memoize column widths to prevent unnecessary recalculations
  const columnWidths = useMemo(() => ({
    select: '12px',
    movementNumber: '12px',
  }), []);

  // Define column priorities once and memoize
  const columnPriorities = useMemo(() => ({
    select: 1,
    movementNumber: 2,
    movementType: 3,
    quantity: 4,
    stockLevelAfter: 5,
    itemName: 6,
    customerDisplayName: 7,
    createdAt: 8,
    actions: 9
  }), []);

  // Center headers definition
  const centerHeaders = useMemo(() =>
    [
      'movementNumber',
      'movementType',
      'quantity',
      'stockLevelAfter'
    ],
    []);

  // Optimize row click handler with useCallback
  const handleRowClick = useCallback((row: EnrichedStockMovementView) => {
    onRowClick?.(row);
  }, [onRowClick]);

  // Process columns to add sorting capability - memoized
  const visibleColumns = useMemo(() => {
    return columns.map((column: ExtendedColumnDef): ExtendedColumnDef => {
      const columnId = column.accessorKey || column.id;

      if (!columnId || column.enableSorting === false) {
        return column;
      }

      const originalHeader = typeof column.header === 'string'
        ? column.header
        : columnId;

      return {
        ...column,
        id: columnId,
        header: () => (
          <SortHeader
            columnId={columnId}
            originalHeader={originalHeader}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            centerHeaders={centerHeaders}
          />
        )
      };
    });
  }, [columns, onSort, sortField, sortDirection, centerHeaders]);

  // Compute which columns to display based on compact mode - using a predefined set in compact mode
  const displayColumns = useMemo(() => {
    if (!isCompact) {
      return visibleColumns;
    }

    // Predefined set of columns to show in compact mode
    const compactModeColumns = [
      'select',
      'movementNumber',
      'itemName',
      'movementType',
      'quantity',
      'date',
      'actions'

    ];

    return visibleColumns.filter((column: ExtendedColumnDef) => {
      const columnId = column.accessorKey || column.id;
      if (!columnId) return true; // Keep columns without ID

      return compactModeColumns.includes(columnId);
    });
  }, [visibleColumns, isCompact]);

  // Pre-compute the row className function to avoid recreating it during render
  const getRowClassName = useCallback((row: any) => {
    return cn(
      "hover:bg-slate-200 cursor-pointer",
      selectedId === (row as EnrichedStockMovementView).movementId && "bg-blue-50 hover:bg-blue-100"
    );
  }, [selectedId]);

  return (
    <div className="overflow-auto flex-1 rounded-md">{
      // Using a fragment with expression syntax to prevent whitespace
      <DataTable
        columns={displayColumns}
        data={data}
        isLoading={isLoading}
        columnWidths={columnWidths}
        onRowSelectionChange={onRowSelectionChange}
        onRowClick={handleRowClick}
        pageSize={100}
        rowClassName={getRowClassName}
      />
    }</div>
  );
}