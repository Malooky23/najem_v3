"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  RowSelectionState,
  TableOptions,
  Updater,
} from "@tanstack/react-table";
import { useRowSelection } from "@/hooks/use-row-selection";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "../loading-spinner";

// Custom column meta interface
interface CustomColumnMeta {
  isNumeric?: boolean;
}

// Memoize the checkbox component to prevent unnecessary renders
const MemoizedCheckbox = React.memo(Checkbox);

// Memoize individual table cells for better performance
const MemoizedCell = React.memo(
  ({ cell, isNumeric }: { cell: any; isNumeric?: boolean }) => {
    return (
      <TableCell className={isNumeric ? "text-right tabular-nums" : ""}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    );
  }
);

MemoizedCell.displayName = "MemoizedCell";

interface DataTableProps<TData extends object, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnWidths?: Record<string, string>;
  pageSize?: number;
  onRowSelectionChange?: (newSelection: RowSelectionState) => void;
  onRowClick?: (row: TData, e?: React.MouseEvent) => void;
  rowClassName?: (row: TData) => string;
  enableSelection?: boolean;
  isLoading?: boolean;
  virtualized?: boolean;
  preventFormSubmission?: boolean;
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  columnWidths,
  pageSize = 100,
  onRowSelectionChange,
  onRowClick,
  rowClassName,
  enableSelection = false,
  isLoading = false,
  preventFormSubmission = true,
}: DataTableProps<TData, TValue>) {
  // Use the custom hook for row selection
  const [rowSelection, setRowSelection] = useRowSelection({}, onRowSelectionChange);

  // Prevent unnecessary table recalculation
  const tableOptions = useMemo<TableOptions<TData>>(() => ({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection, // Use the wrapped setter function
    state: {
      rowSelection,
    },
    enableRowSelection: enableSelection,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  }), [data, columns, pageSize, setRowSelection, enableSelection, rowSelection]);

  const table = useReactTable(tableOptions);

  // Handle row click with proper event prevention
  const handleRowClick = useCallback((row: TData, e?: React.MouseEvent) => {
    // Only prevent default if event exists and prevention is enabled
    if (e && preventFormSubmission) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (onRowClick) {
      onRowClick(row, e);
    }
  }, [onRowClick, preventFormSubmission]);

  // Loading state - Only show full loading spinner when we have no data
  if (isLoading && data.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="w-full overflow-x-auto overflow-y-auto">{/* Added overflow-y-auto */}
          <Table style={{ tableLayout: 'auto', minWidth: '100%' }}>{/* Add minWidth: 100% */}
            <TableHeader className="sticky top-0 rounded-t-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}
                  style={{ position: 'relative' }}
                >
                  {headerGroup.headers.map((header) => {
                    const width = header.column.columnDef.id
                      ? columnWidths?.[header.column.columnDef.id]
                      : undefined;
                    return (
                      <TableHead
                        key={header.id}
                        style={{ position: 'relative', width: width ? width : undefined }}
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center relative"
                >
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="w-full overflow-x-auto overflow-y-auto">{/* Added overflow-y-auto */}
        <Table style={{ tableLayout: 'auto', minWidth: '100%' }}>{/* Add minWidth: 100% */}
          <TableHeader className="sticky top-0 rounded-t-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}
                style={{ position: 'relative' }}
              >
                {headerGroup.headers.map((header) => {
                  const width = header.column.columnDef.id
                    ? columnWidths?.[header.column.columnDef.id]
                    : undefined;
                  return (
                    <TableHead
                      key={header.id}
                      style={{ position: 'relative', width: width ? width : undefined }}
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
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row.original)
                  )}
                  onClick={(e) => handleRowClick(row.original, e)}
                >
                  {row.getVisibleCells().map((cell) => {
                    // Safely access meta property with type assertion
                    const meta = cell.column.columnDef.meta as CustomColumnMeta | undefined;
                    const isNumeric = meta?.isNumeric;
                    return (
                      <MemoizedCell
                        key={cell.id}
                        cell={cell}
                        isNumeric={isNumeric}
                      />
                    );
                  })}
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
  );
}