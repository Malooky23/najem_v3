"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,

} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/pagination-controls"
import type { EnrichedItemsSchema, EnrichedItemsType } from "@/types/items"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"
import { Input } from "@/components/ui/input"


interface DataTableProps<TValue> {
  columns: ColumnDef<typeof EnrichedItemsSchema, any>[]
  data: any
  isLoading?: boolean
}

export function ItemsTable<TValue>({
  columns,
  data,
  isLoading
}: DataTableProps<TValue>) {

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [foo, setFoo] = React.useState("non")



  const columnWidths: { [key: string]: string } = {
    select: '10px',
    itemNumber: '50px',
    itemType: '70px'
    // customerType: '100px',
    // displayName: '300px',
    // country: '50px',
    // actions: '50px',
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,

    },
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  })


  return (
    <div className="flex flex-col rounded-md "> {/* Main container */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Item Name..."
          value={(table.getColumn("itemName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("itemName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm mr-2"
        />
        <Input
          placeholder="Filter Type..."
          value={(table.getColumn("itemType")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("itemType")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filter Customer..."
          value={(table.getColumn("customerDisplayName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customerDisplayName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm ml-2"
        />
      </div>

      <div className="rounded-md border relative"> {/* Removed flex-1 */}
        <div className=" overflow-auto rounded-md max-h-[calc(100vh-200px)] w-full">
          <Table className="relative" style={{ tableLayout: "auto" }}>
            <TableHeader className="sticky top-0 rounded-t-md bg-slate-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className='hover:opacity-75' key={headerGroup.id}
                  style={{ position: 'relative' }}
                >
                  {headerGroup.headers.map((header) => {
                    const column = header.column;
                    const width = columnWidths[column.id] || 'auto'; // Default to 'auto' if not defined
                    return (

                      <TableHead key={header.id}
                        style={{ position: 'relative', width: width }}
                        // className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis rounded-xl bg-slate-200"
                        className={cn(header.id === 'itemNumber' && " px-0", 
                          "min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis text-slate-600 text-m ",
                          // "flex justify-start items-center" //  ADD THESE FLEXBOX CLASSES HERE

                        )}
                      >

                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="hover:bg-slate-200"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      const rowData = row.original as unknown as EnrichedItemsType; // Access the original row data
                      console.log(rowData)
                      setFoo(rowData.itemId)
                      toast({
                        title: "Clicked on: ",
                        description: 
                        (
                          <div> {/* Use a div to format the details */}
                            <p>Item Number: {rowData.itemNumber}</p>
                            <p>Customer Display Name: {rowData.customerDisplayName}</p>
                            {/* Add other row details as needed */}
                            {/* Example of conditional rendering for a property: */}
                          </div>
                        ),
                      })
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const column = cell.column;
                      const width = columnWidths[column.id] || 'auto'; // Default to 'auto' if not defined
                      // const width = '500px'
                      return (
                        <TableCell key={cell.id} style={{ width: width }}
                          className={cn("min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis",
                            cell.column.id === 'actions' ? 'text-right' : '',
                            cell.column.id === 'itemNumber' ? 'text-left' : ''
                            
                          )}

                        >
                          {isLoading ? (
                            <Skeleton className="h-4 w-[80%]" />
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>

                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

        </div>
      </div>

      <div className="mt-1">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
