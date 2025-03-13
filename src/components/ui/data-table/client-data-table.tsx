"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
  Table as TableType,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { Input } from "../input"

interface DataTableProps<TData, TValue> {
  table: TableType<TData>
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterColumn?: string
  filterValue?: string
  onRowClick?: (row: TData) => void
  getRowClassName?: (row: TData) => string
}

export function ClientDataTable<TData, TValue>({
  table,
  columns,
  onRowClick,
  getRowClassName,
}: DataTableProps<TData, TValue>) {

  return (
    <div className="flex flex-col h-full">
      <div className="w-full overflow-x-auto overflow-y-auto">
        <Table style={{ tableLayout: 'auto', minWidth: '100%' }}>
          <TableHeader className="sticky top-0 rounded-t-lg bg-white backdrop-blur-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}
                style={{ position: 'relative' }}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="min-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis text-slate-600 text-m"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`${getRowClassName?.(row.original) || ''} ${onRowClick ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
  )
}

