"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./pagination-controls"
import type { EnrichedCustomer } from "@/types/customer"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"


interface DataTableProps<TValue> {
  columns: ColumnDef<EnrichedCustomer, any>[]
  data: any
  isLoading?: boolean
}

export function ItemsTable<TValue>({
  columns,
  data,
  isLoading
}: DataTableProps<TValue>) {
  
  const columnWidths: { [key: string]: string } = {
    customerNumber: '80px',
    customerType: '100px',
    // displayName: '300px',
    // country: '50px',
    actions: '50px',
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  })

  return (
    <div className="flex flex-col h-full rounded-md">
      <div className="rounded-md border flex-1 relative">
        <div className="absolute inset-0 overflow-auto rounded-md ">

          <Table className="relative " style={{ tableLayout: 'auto' }}>
            <TableHeader className="sticky top-0 rounded-t-md   ">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className='bg-amber-400' key={headerGroup.id}
                  style={{ position: 'relative' }}
                >
                  {headerGroup.headers.map((header) => {
                    const column = header.column;
                    const width = columnWidths[column.id] || 'auto'; // Default to 'auto' if not defined
                    return (

                      <TableHead key={header.id}
                        style={{ position: 'relative', width: width }}
                        // className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis rounded-xl bg-slate-200"
                        className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis text-slate-600 text-m "
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
                    className="hover:bg-green-500"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      toast({
                        title: "Clicked on: ",
                        description: "Friday, February 10, 2023 at 5:57 PM",
                      })
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const column = cell.column;
                      const width = columnWidths[column.id] || 'auto'; // Default to 'auto' if not defined
                      return (
                        <TableCell key={cell.id} style={{ width: width }} 
                        className={cn("min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis", 
                          cell.column.id === 'actions' ? 'text-right' : '' ,
                          cell.column.id === 'customerNumber' ? 'text-left' : '' 
                        
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
