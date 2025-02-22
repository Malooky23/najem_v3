"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { EnrichedOrders } from "@/types/orders"

interface OrdersTableProps {
  columns: ColumnDef<EnrichedOrders, any>[]
  data: EnrichedOrders[]
  isLoading?: boolean
  onRowClick?: (order: EnrichedOrders) => void
  selectedId?: string
  isCompact?: boolean
}

export function OrdersTable({
  columns,
  data,
  isLoading,
  onRowClick,
  selectedId,
  isCompact = false
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

  // Define which columns to show in compact mode
  const visibleColumns = useMemo(() => {
    if (isCompact) {
      // In compact mode, only show essential columns
      return columns.filter(column => {
        const id = (column as { accessorKey?: string }).accessorKey || (column as { id?: string }).id
        return ['orderNumber', 'status'].includes(id || '')
      })
    }
    return columns
  }, [columns, isCompact])

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
    <DataTable
      columns={visibleColumns}
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
  )
}