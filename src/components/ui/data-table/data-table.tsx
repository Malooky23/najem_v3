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
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import React from "react"
import { cn } from "@/lib/utils"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  isLoading?: boolean
  filterableColumns?: {
    id: string
    title: string
  }[]
  columnWidths?: { [key: string]: string }
  onRowClick?: (row: TData) => void
  pageSize?: number
  rowClassName?: (row: TData) => string
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  filterableColumns = [],
  columnWidths = {},
  onRowClick,
  pageSize = 10,
  rowClassName,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})

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
        pageSize: pageSize,
      },
    },
  })

  return (
    <div className="flex flex-col rounded-md display-block overflow-auto ">
      {filterableColumns.length > 0 && (
        <div className="flex items-center py-4 gap-2">
          {filterableColumns.map((column) => (
            <Input
              key={column.id}
              placeholder={`Filter ${column.title}...`}
              value={(table.getColumn(column.id)?.getFilterValue() as string) ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                table.getColumn(column.id)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          ))}
        </div>
      )}

      <div className="rounded-md border relative ">
        {/* <div className="overflow-auto rounded-md "> */}
        {/* <div className="flex   rounded-md min-h-0 w-full"> */}
        <div className="overflow-auto rounded-md max-h-[calc(97vh-200px)] w-full">
        {/* <div className="overflow-auto rounded-md max-h-[calc(100vh-200px)] w-full"> */}
          <Table className="relative" style={{ tableLayout: "auto" }}>
            <TableHeader className="sticky top-0 rounded-t-md bg-slate-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:opacity-75">
                  {headerGroup.headers.map((header) => {
                    const width = columnWidths[header.column.id] || 'auto'
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width }}
                        className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis text-slate-600 text-m"
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
                    key={row.id}
                    className={cn(
                      rowClassName ? rowClassName(row.original) : "hover:bg-slate-200"
                    )}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const width = columnWidths[cell.column.id] || 'auto'
                      return (
                        <TableCell
                          key={cell.id}
                          style={{ width }}
                          className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis"
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

      <div className="mt-4 mb-2">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}