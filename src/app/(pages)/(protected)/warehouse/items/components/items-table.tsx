"use client"

import { EnrichedItemsType } from "@/types/items"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface ItemsTableProps {
  columns: ColumnDef<EnrichedItemsType, any>[]
  data: EnrichedItemsType[]
  isLoading?: boolean
}

export function ItemsTable({
  columns,
  data,
  isLoading
}: ItemsTableProps) {
  const columnWidths = {
    select: '10px',
    itemNumber: '50px',
    itemType: '70px',
    itemName: '300px',
    customerDisplayName: '200px'
  }

  const filterableColumns = [
    { id: "itemName", title: "Item Name" },
    { id: "itemType", title: "Type" },
    { id: "customerDisplayName", title: "Customer" }
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      columnWidths={columnWidths}
      filterableColumns={filterableColumns}
      pageSize={100}
      onRowClick={(row) => {
        toast({
          title: "Clicked on: ",
          description: (
            <div>
              <p>Item Number: {row.itemNumber}</p>
              <p>Customer Display Name: {row.customerDisplayName}</p>
            </div>
          ),
        })
      }}
    />
  )
}
