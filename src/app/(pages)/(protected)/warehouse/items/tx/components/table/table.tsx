"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef, RowSelectionState } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { EnrichedStockMovementView, StockMovementSortFields } from "@/types/stockMovement"

interface StockMovementTableProps {
  columns: ColumnDef<EnrichedStockMovementView>[]
  data: EnrichedStockMovementView[]
  isLoading?: boolean
  onRowClick?: (order: EnrichedStockMovementView) => void
  selectedId?: string
  isCompact?: boolean
  onSort?: (field: StockMovementSortFields, direction: 'asc' | 'desc') => void
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
  onRowSelectionChange
}: StockMovementTableProps) {
  const columnWidths = useMemo(() => ({
    //  movementType: '12px',
    //  quantity: '100px',
    //  itemName: '200px',
    //  customerDisplayName: '200px',
    //  createdAt: '150px',
    //  actions: '50px'
  }), [])

  const visibleColumns = useMemo(() => {
    const sortableFields: StockMovementSortFields[] = ['createdAt', 'movementType', 'quantity', 'itemName', 'customerDisplayName', 'movementNumber'];

    return columns.map((column: ExtendedColumnDef): ExtendedColumnDef => {
      const columnId = column.accessorKey || column.id
      if (!columnId || !sortableFields.includes(columnId as StockMovementSortFields)) {
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
              onSort?.(columnId as StockMovementSortFields, isAsc ? 'desc' : 'asc')
            }}
          >
            <span className={cn("",
              originalHeader === "#" ?
                "ml-auto text-center pr-1" : "",
              originalHeader === "Status" ?
                "ml-auto text-center pr-1" : ""
            )}
            >
              {originalHeader}
            </span>

            <div className="flex flex-col mr-auto items-start">
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
        )
      }

      return newColumn
    })
  }, [columns, onSort, sortField, sortDirection])

  const displayColumns = useMemo(() => {
    if (isCompact) {
      return visibleColumns.filter((column: ExtendedColumnDef) => {
        const columnId = column.accessorKey || column.id
        return [
          'movementNumber',
          'itemName',
          'movementType',
          'quantity',
        ].includes(columnId || '')
      })
    }
    return visibleColumns
  }, [visibleColumns, isCompact])

  // const filterableColumns = useMemo(() => {
  //   if (isCompact) {
  //     return [
  //       { id: "movementType", title: "Movement Type" },
  //       { id: "customerDisplayName", title: "Customer" },
  //       { id: "itemName", title: "Item" },
  //       { id: "quantity", title: "Quantity" },
  //       { id: "movementNumber", title: "Movement Number" },
  //       { id: "createdAt", title: "Date" },
  //     ]
  //   }
  //   return [
  //     { id: "movementType", title: "Movement Type" },
  //     { id: "customerDisplayName", title: "Customer" },
  //     { id: "itemName", title: "Item" },
  //     { id: "quantity", title: "Quantity" },
  //     { id: "movementNumber", title: "Movement Number" },
  //     { id: "createdAt", title: "Date" },
  //   ]
  // }, [isCompact])

  return (
    <div className="h-full flex-1 overflow-hidden rounded-md">
      <DataTable
        columns={displayColumns}
        data={data}
        isLoading={isLoading}
        columnWidths={columnWidths}
        // filterableColumns={filterableColumns}
        pageSize={isCompact ? 25 : 50}
        onRowSelectionChange={onRowSelectionChange}
        onRowClick={(row: EnrichedStockMovementView) => {
          const rowData = row
          if (onRowClick) {
            onRowClick(rowData)
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