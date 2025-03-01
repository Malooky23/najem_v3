"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { EnrichedOrders, OrderSortField } from "@/types/orders"
import { ChevronUp, ChevronDown } from "lucide-react"
import { EnrichedStockMovementView, StockMovementSort, StockMovementSortFields } from "@/types/stockMovement"

interface OrdersTableProps {
  columns: ColumnDef<EnrichedStockMovementView, any>[]
  data: EnrichedStockMovementView[]
  isLoading?: boolean
  onRowClick?: (order: EnrichedStockMovementView) => void
  selectedId?: string
  isCompact?: boolean
  onSort?: (field: StockMovementSort['field'], direction: 'asc' | 'desc') => void
  sortField?: StockMovementSortFields
  sortDirection?: 'asc' | 'desc'
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  selectedRows?: RowSelectionState;
}

type ExtendedColumnDef = ColumnDef<EnrichedStockMovementView, any> & {
  accessorKey?: string;
  id?: string;
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
  onRowSelectionChange

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

  // Define which columns to show in compact mode and add sorting
  const visibleColumns = useMemo(() => {
    const sortableFields: StockMovementSort['field'][] = ['createdAt']

    return columns.map((column: ExtendedColumnDef) => {
      const columnId = column.accessorKey || column.id
      if (!columnId || !sortableFields.includes(columnId as StockMovementSort['field'])) {
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
            className=" flex  items-center gap-1 cursor-pointer select-none "
            // onClick={() => {
            //   const isAsc = sortField === columnId && sortDirection === 'asc'
            //   onSort?.(columnId as StockMovementSort['field'], isAsc ? 'desc' : 'asc')
            // }}
          >
            <span className={cn("",
              originalHeader === "#" ? 
            "ml-auto   text-center pr-1" : " ",
              originalHeader === "Status" ? 
            "ml-auto    text-center pr-1" : " "
          )}
            >
              {originalHeader}
            </span>

            <div className="flex flex-col mr-auto items-start ">
              <ChevronUp strokeWidth="4px"
                className={cn(
                  "h-4 w-4 -mb-1",
                  // sortField === columnId && sortDirection === 'asc'
                  //   ? "text-foreground"
                  //   : "text-muted-foreground/30"
                )}
              />
              <ChevronDown strokeWidth="4px"
                className={cn(
                  "h-4 w-4 -mt-1",
                  // sortField === columnId && sortDirection === 'desc'
                  //   ? "text-foreground"
                  //   : "text-muted-foreground/30"
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
        return ['movementType', 'customerDisplayName', 'itemName'].includes(columnId || '')
      })
    }
    return visibleColumns
  }, [visibleColumns, isCompact])

  const columnWidths = isCompact ? baseColumnWidths : fullColumnWidths

  const filterableColumns = useMemo(() => {
    if (isCompact) {
      return [
        { id: "movementType", title: "movementType" },
        { id: "customerDisplayName", title: "customerDisplayName" },
        { id: "itemName", title: "itemName" },


      ]
    }
    return [
      { id: "movementType", title: "movementType" },
      { id: "customerDisplayName", title: "customerDisplayName" },
      { id: "itemName", title: "itemName" },

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
        onRowSelectionChange={onRowSelectionChange}
        onRowClick={(row: EnrichedStockMovementView) => {
          const order = row
          if (onRowClick) {
            onRowClick(order)
          }
        }}
        rowClassName={(row) =>
          cn(
            "hover:bg-slate-200 cursor-pointer",
            selectedId === (row as EnrichedStockMovementView).movementId && "bg-blue-50 hover:bg-blue-100"
          )
        }
      />
    </div>
  )
}