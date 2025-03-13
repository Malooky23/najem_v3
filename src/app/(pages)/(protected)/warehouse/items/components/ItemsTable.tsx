"use client"
import { useCallback, memo, useRef, useState, useEffect } from "react"
import { useItemsStore } from "@/stores/items-store"
import { itemColumns } from "./table/columns"
import { ItemSchemaType } from "@/types/items"
import { ClientDataTable } from "@/components/ui/data-table/client-data-table"
import { ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, Table, useReactTable } from "@tanstack/react-table"

interface ItemsTableProps {
  isMobile: boolean;
  isLoading: boolean;
  items: ItemSchemaType[];
  searchValue?: string;
  // New prop for total items count
  totalItems: number;
}

export const ItemsTable = memo<ItemsTableProps>(function ItemsTable({
  isMobile,
  isLoading,
  items,
  searchValue = "",
  totalItems
}) {
  const store = useItemsStore()
  // Create a ref to store the table instance
  const tableRef = useRef<Table<ItemSchemaType> | null>(null)

  // Handle row click
  const handleRowClick = useCallback((row: ItemSchemaType) => {
    store.selectItem(store.selectedItemId === row.itemId ? null : row.itemId)
  }, [store])

  // Row class name based on selection
  const getRowClassName = useCallback((row: ItemSchemaType) => {
    return store.selectedItemId === row.itemId ? 'bg-muted' : ''
  }, [store.selectedItemId])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // IMPORTANT: We're removing the effect that was causing the loop
  // We'll set total items from the parent component instead

  const table = useReactTable({
    data: items,
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    // Remove this as we'll handle row selection directly in the ClientDataTable
    // onRowSelectionChange: handleRowClick,

    state: {
      sorting,
      columnFilters,
      // We'll just use the table's built-in pagination
      pagination: {
        pageIndex: 0, 
        pageSize: items.length, // Display all items passed to the component
      },
    },
    // Remove manual pagination handling from the table itself
    manualPagination: false,
  })

  // Apply search filter
  useEffect(() => {
    const column = table.getColumn("itemName");
    if (column) {
      column.setFilterValue(searchValue);
    }
  }, [searchValue, table])

  return (
    <div className=" flex-grow flex-1  w-full rounded-lg bg-slate-50 border-2 border-slate-200">
        <ClientDataTable<ItemSchemaType, any>
          table={table}
          columns={itemColumns}
          data={items}
          filterColumn="itemName"
          filterValue={searchValue}
          onRowClick={handleRowClick}
          getRowClassName={getRowClassName}
        />
    </div>
  )
})

