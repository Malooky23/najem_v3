"use client"
import { useCallback, memo } from "react"
import { useItemsStore } from "@/stores/items-store"
import { itemColumns } from "./table/columns"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ItemSchemaType } from "@/types/items"

interface ItemsTableProps {
  isMobile: boolean;
  isLoading: boolean;
  items: ItemSchemaType[];
}

export const ItemsTable = memo<ItemsTableProps>(function ItemsTable({
  isMobile,
  isLoading,
  items
}) {
  const store = useItemsStore()
  
  // Handle row click
  const handleRowClick = useCallback((row: ItemSchemaType) => {
    store.selectItem(store.selectedItemId === row.itemId ? null : row.itemId)
  }, [store])
  
  // Row class name based on selection
  const getRowClassName = useCallback((row: ItemSchemaType) => {
    return store.selectedItemId === row.itemId ? 'bg-muted' : ''
  }, [store.selectedItemId])

  return (
    <div className="h-full flex flex-col">
      <DataTable<ItemSchemaType, any>
        columns={itemColumns}
        data={items}
        onRowClick={handleRowClick}
        rowClassName={getRowClassName}
        isLoading={isLoading}
        pageSize={10}
      />
    </div>
  )
})