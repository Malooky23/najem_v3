"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
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

import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "../loading-spinner"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  columnWidths?: { [key: string]: string }
  filterableColumns?: { id: string; title: string }[]
  pageSize?: number
  onRowClick?: (row: TData) => void
  rowClassName?: (row: TData) => string
  onRowSelectionChange?: (selection: RowSelectionState) => void // Updated type
}

type Column = {
  id?: string;
  accessorKey?: string;
  columnDef?: {
    header?: string;
    accessorKey?: string;
  };
};

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  columnWidths,
  filterableColumns = [], // Add default value
  onRowClick,
  rowClassName,
  onRowSelectionChange
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    // onRowSelectionChange: setRowSelection,
    onRowSelectionChange: (updatedSelection) => {
      setRowSelection(updatedSelection);
      // If updatedSelection is a function, call it with current selection
      if (typeof updatedSelection === 'function') {
        const newSelection = updatedSelection(rowSelection);
        onRowSelectionChange?.(newSelection);
      } else {
        onRowSelectionChange?.(updatedSelection);
      }
    },


    state: {
      rowSelection,
      columnFilters,
      sorting,
    },
  })


  return (
    <div className="flex flex-col h-full">
      {filterableColumns && filterableColumns.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-4 bg-white border-b">
          {filterableColumns.map(column => (
            <div key={column.id} className="flex items-center gap-2">
              <Input
                placeholder={`Filter ${column.title}...`}
                value={(table.getColumn(column.id)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(column.id)?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <Table>
          {/* <TableHeader className="sticky top-0 bg-white z-10"> */}
          <TableHeader className="sticky top-0 bg-white ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = header.column.columnDef as Column
                  const columnId = column.id || column.accessorKey || ''
                  const width = columnWidths?.[columnId]
                  
                  return (
                    <TableHead
                      key={header.id}
                      style={width ? { width } : undefined}
                      className="whitespace-nowrap bg-white"
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center relative"
                >
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={rowClassName?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}