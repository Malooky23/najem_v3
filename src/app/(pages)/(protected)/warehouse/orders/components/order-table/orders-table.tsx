"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useMemo, useCallback } from "react"
import { EnrichedOrders, OrderSortField } from "@/types/orders"
import { ChevronUp, ChevronDown } from "lucide-react"
import React from "react"

interface OrdersTableProps {
  columns: ColumnDef<EnrichedOrders, any>[]
  data: EnrichedOrders[]
  isLoading?: boolean
  onRowClick?: (order: EnrichedOrders) => void
  selectedId?: string
  isCompact?: boolean
  onSort?: (field: OrderSortField, direction: 'asc' | 'desc') => void
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

// Memoized sort header component to prevent unnecessary re-renders
const SortHeader = React.memo(({
  columnId,
  originalHeader,
  sortField,
  sortDirection,
  onSort
}: {
  columnId: string,
  originalHeader: string | React.ReactNode,
  sortField?: OrderSortField,
  sortDirection?: 'asc' | 'desc',
  onSort?: (field: OrderSortField, direction: 'asc' | 'desc') => void
}) => {
  const handleSortClick = useCallback(() => {
    const isAsc = sortField === columnId && sortDirection === 'asc'
    onSort?.(columnId as OrderSortField, isAsc ? 'desc' : 'asc')
  }, [columnId, sortField, sortDirection, onSort]);

  return (
    <div
      className=" flex items-center gap-1 cursor-pointer select-none "
      onClick={handleSortClick}
    >
      <span className={cn("",
        originalHeader === "#" ? 
        "ml-auto text-center pr-1" : " ",
        originalHeader === "Status" ? 
        "ml-auto text-center pr-1" : " "
      )}>
        {originalHeader}
      </span>

      <div className="flex flex-col mr-auto items-start ">
        <ChevronUp strokeWidth="4px"
          className={cn(
            "h-4 w-4 -mb-1",
            sortField === columnId && sortDirection === 'asc'
              ? "text-foreground"
              : "text-muted-foreground/30"
          )}
        />
        <ChevronDown strokeWidth="4px"
          className={cn(
            "h-4 w-4 -mt-1",
            sortField === columnId && sortDirection === 'desc'
              ? "text-foreground"
              : "text-muted-foreground/30"
          )}
        />
      </div>
    </div>
  );
});

SortHeader.displayName = "SortHeader";

export function OrdersTable({
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
  // Define base column widths
  const baseColumnWidths: { [key: string]: string } = {
    // orderNumber: '80px',
    // status: '100px',
    // items: '80px',

  }

  // Define full column widths
  const fullColumnWidths: { [key: string]: string } = {
    // select: '10px',
    // items: '80px',
    // orderNumber: '80px',
    // status: '100px',
    // customerName: '200px',
    // date: '150px',
    // total: '100px',
    // actions: '50px'
  }

  // Optimize row click handler with useCallback
  const handleRowClick = useCallback((row: EnrichedOrders, e?: React.MouseEvent) => {
    onRowClick?.(row);
  }, [onRowClick]);

  // Define which columns to show in compact mode and add sorting
  const visibleColumns = useMemo(() => {
    const sortableFields: OrderSortField[] = ['orderNumber', 'status', 'createdAt', 'customerName']

    return columns.map((column: ExtendedColumnDef) => {
      const columnId = column.accessorKey || column.id
      if (!columnId || !sortableFields.includes(columnId as OrderSortField)) {
        return column
      }

      // Get the original header content
      const originalHeader = typeof column.header === 'string'
        ? column.header
        : columnId

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
          />
        )
      }

      return newColumn
    })
  }, [columns, onSort, sortField, sortDirection])

  // Filter columns for compact mode
  const displayColumns = useMemo(() => {
    if (isCompact) {
      return visibleColumns.filter((column: ExtendedColumnDef) => {
        const columnId = column.accessorKey || column.id
        return ['orderNumber', 'customerName', 'status', "items"].includes(columnId || '')
      })
    }
    return visibleColumns
  }, [visibleColumns, isCompact])

  const columnWidths = isCompact ? baseColumnWidths : fullColumnWidths

  const filterableColumns = useMemo(() => {
    const columns = [
      { id: "orderNumber", title: "Order Number" },
      { id: "status", title: "Status" },
      { id: "customerName", title: "Customer" },
      { id: "createdAt", title: "Date" },
      { id: "items", title: "Items" }
    ]
    
    if (isCompact) {
      return columns.filter(col => ['orderNumber', 'customerName', 'status', 'items'].includes(col.id))
    }
    return columns
  }, [isCompact])

  return (
    <div className="h-full flex-1 overflow-hidden rounded-md ">
      <DataTable
        columns={displayColumns}
        data={data}
        isLoading={isLoading}
        columnWidths={columnWidths}
        // pageSize={pageSize?? 100}
        onRowSelectionChange={onRowSelectionChange}
        onRowClick={handleRowClick}
        rowClassName={(row) =>
          cn(
            "hover:bg-slate-200 cursor-pointer",
            selectedId === (row as EnrichedOrders).orderId && "bg-blue-50 hover:bg-blue-100"
          )
        }
      />
    </div>
  )
}