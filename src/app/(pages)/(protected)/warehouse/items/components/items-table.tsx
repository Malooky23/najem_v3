"use client"

import { EnrichedItemsType } from "@/types/items"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface ItemsTableProps {
  columns: ColumnDef<EnrichedItemsType>[]
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
    // itemName: '300px',
    // itemStock: '50px',
    // customerDisplayName: '200px'
  }

  const filterableColumns = [
    { id: "itemName", title: "Item Name" },
    { id: "itemType", title: "Type" },
    { id: "customerDisplayName", title: "Customer" }
  ]

  return (
    // <div className="max-h-[90vh] bg-green-400">

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
          // </div>

  )
}
