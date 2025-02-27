"use client"

import { EnrichedItemsType } from "@/types/items"
import { toast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useState, useMemo, useEffect } from "react"

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
  const [pageSize, setPageSize] = useState(100);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);



  //   return (
  //     // <div className="flex max-h-[89vh] max-w-full flex-col  justify-between   flex-1 overflow-auto mx-6">
  //     <div className="  max-w-full flex-col  justify-between    mx-6">
  //       {/* <div className=" overflow-scroll rounded-lg mt-1 bg-slate-50 border-2 border-slate-200"> */}
  //       <div className=" flex-shrink rounded-lg mt-2 bg-slate-50 border-2 border-slate-200">
  //         <DataTable
  //           columns={columns}
  //           data={paginatedData}
  //           isLoading={isLoading}
  //           columnWidths={columnWidths}
  //           filterableColumns={filterableColumns}
  //           pageSize={100}
  //           onRowClick={(row) => {
  //             toast({
  //               title: "Clicked on: ",
  //               description: (
  //                 <div>
  //                   <p>Item Number: {row.itemNumber}</p>
  //                   <p>Customer Display Name: {row.customerDisplayName}</p>
  //                 </div>
  //               ),
  //             })
  //           }}
  //         />
  //       </div>

  //       <div className="border-t  justify-center flex  mx-auto rounded-full mt-1 p-2 bg-slate-50 border-2 border-slate-200 ">

  //         <PaginationControls
  //           currentPage={currentPage}
  //           totalPages={Math.ceil(data.length / pageSize)}
  //           pageSize={pageSize}
  //           total={data.length}
  //           onPageChange={setCurrentPage}
  //           onPageSizeChange={setPageSize}

  //         />
  //       </div>
  //     </div>

  //   )
  // }

  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const handleRowSelection = (selection: RowSelectionState) => {
    setSelectedRows(selection);
    
    // Get the selected items
    const selectedItems = Object.keys(selection)
      .filter(key => selection[key])
      .map(key => data[parseInt(key)]);

      //DO SOMETHING WITH THE SELECTED ITEMS
      console.log("Do something with selected items", selectedItems)
  };



  useEffect(() => {
    console.log('selectedRows updated:', selectedRows);
  }, [selectedRows]); // Add selectedRows to the dependency array



  return (
    // <div className="h-[89vh] flex flex-col mx-6">
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Table container with flex-grow and overflow */}
      <div className="flex-grow overflow-auto rounded-lg bg-slate-50 border-2 border-slate-200">
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          columnWidths={columnWidths}
          filterableColumns={filterableColumns}
          pageSize={100}
          onRowSelectionChange={handleRowSelection}
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

      {/* Pagination section will remain at the bottom */}
      {/* <div className="flex-shrink-0  justify-center flex mx-auto rounded-full my-1 p-2 bg-slate-50 border-2 border-slate-200"> */}
      <div className="p-2 flex justify-center  ">
        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(data.length / pageSize)}
          pageSize={pageSize}
          total={data.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          selectedRows={Object.keys(selectedRows).filter(key => selectedRows[key]).length}
        />
      </div>
    </div>
  )
}