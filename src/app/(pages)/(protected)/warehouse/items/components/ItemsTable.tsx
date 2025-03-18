"use client"
import { useCallback, memo } from "react"
import { useItemsStore } from "@/stores/items-store"
import { itemColumns } from "./table/columns"
import { ItemSchemaType } from "@/types/items"
import { ClientDataTable } from "@/components/ui/data-table/client-data-table"

interface ItemsTableProps {
  isMobile?: boolean;
  isLoading?: boolean;
  items: ItemSchemaType[];
}

export const ItemsTable = memo<ItemsTableProps>(function ItemsTable({
  isMobile,
  isLoading,
  items,
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
    
    <div className="flex-1 w-full h-full overflow-hidden rounded-lg bg-slate-50 border-2 border-slate-200">
      <ClientDataTable
        columns={itemColumns}
        data={items ?? []}
        onRowClick={handleRowClick}
        getRowClassName={getRowClassName}
        searchColumn="itemName"
        searchPlaceholder="Search items..."
      />
    </div>
  )
})

