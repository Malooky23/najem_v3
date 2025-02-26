"use client"

import { EnrichedItemsType } from "@/types/items"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useState, useMemo } from "react"

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);



  return (
    <div className="flex max-h-[89vh] max-w-full flex-col  justify-between   flex-1 overflow-auto mx-6">
      <div className=" overflow-scroll rounded-lg mt-1 bg-slate-50 border-2 border-slate-200">
        <DataTable
          columns={columns}
          data={paginatedData}
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
      </div>

      <div className="border-t w-[40%] justify-center flex flex-shrink mx-auto rounded-full mt-1 py-2 bg-slate-50 border-2 border-slate-200">

        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(data.length / pageSize)}
          pageSize={pageSize}
          total={data.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}

        />
      </div>
    </div>

  )
}
