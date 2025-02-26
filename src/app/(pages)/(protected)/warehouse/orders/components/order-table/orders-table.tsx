"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { EnrichedOrders, OrderSortField } from "@/types/orders"
import { ChevronUp, ChevronDown } from "lucide-react"

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
}

type ExtendedColumnDef = ColumnDef<EnrichedOrders, any> & {
  accessorKey?: string;
  id?: string;
  header?: string | ((props: any) => React.ReactNode);
};

export function OrdersTable({
  columns,
  data,
  isLoading,
  onRowClick,
  selectedId,
  isCompact = false,
  onSort,
  sortField,
  sortDirection
}: OrdersTableProps) {
  // Define base column widths
  const baseColumnWidths: { [key: string]: string } = {
    orderNumber: '80px',
    status: '100px'
  }

  // Define full column widths
  const fullColumnWidths: { [key: string]: string } = {
    select: '10px',
    orderNumber: '80px',
    status: '100px',
    customerName: '200px',
    date: '150px',
    total: '100px',
    actions: '50px'
  }

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
          <div
            className="flex items-center gap-1 cursor-pointer select-none"
            onClick={() => {
              const isAsc = sortField === columnId && sortDirection === 'asc'
              onSort?.(columnId as OrderSortField, isAsc ? 'desc' : 'asc')
            }}
          >
            <span className={cn( originalHeader === "#" ? "flex flex-1  justify-center text-center pr-1" : " ")}
            >{originalHeader}</span>
            <div className="flex flex-col">
              <ChevronUp
                className={cn(
                  "h-3 w-3 -mb-1",
                  sortField === columnId && sortDirection === 'asc'
                    ? "text-foreground"
                    : "text-muted-foreground/30"
                )}
              />
              <ChevronDown
                className={cn(
                  "h-3 w-3 -mt-1",
                  sortField === columnId && sortDirection === 'desc'
                    ? "text-foreground"
                    : "text-muted-foreground/30"
                )}
              />
            </div>
          </div>
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
        return ['orderNumber', 'customerName', 'status'].includes(columnId || '')
      })
    }
    return visibleColumns
  }, [visibleColumns, isCompact])

  const columnWidths = isCompact ? baseColumnWidths : fullColumnWidths

  const filterableColumns = useMemo(() => {
    if (isCompact) {
      return [
        { id: "orderNumber", title: "Order Number" },
        { id: "status", title: "Status" }
      ]
    }
    return [
      { id: "orderNumber", title: "Order Number" },
      { id: "status", title: "Status" },
      { id: "customerName", title: "Customer" }
    ]
  }, [isCompact])

  return (
    <div className="h-full flex-1 overflow-hidden rounded-md ">
      <DataTable
        columns={displayColumns}
        data={data}
        isLoading={isLoading}
        columnWidths={columnWidths}
        filterableColumns={filterableColumns}
        pageSize={isCompact ? 25 : 50}
        onRowClick={(row) => {
          const order = row as EnrichedOrders
          if (onRowClick) {
            onRowClick(order)
          }
        }}
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