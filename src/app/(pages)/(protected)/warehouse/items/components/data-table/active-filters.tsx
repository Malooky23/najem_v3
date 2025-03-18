"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { FilterState } from "./items-page-wrapper"
import type { ItemSchemaType } from "./data"

interface ActiveFiltersProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  activeFilters: FilterState
  handleTypeFilter: (type: string) => void
  handleCustomerFilter?: (customer: string) => void
  handleItemSelection?: (itemId: string) => void
  clearAllFilters: () => void
  data?: ItemSchemaType[]
}

export function ActiveFilters({
  globalFilter,
  setGlobalFilter,
  activeFilters,
  handleTypeFilter,
  handleCustomerFilter,
  handleItemSelection,
  clearAllFilters,
  data = [],
}: ActiveFiltersProps) {
  if (
    !(
      activeFilters.types.length > 0 ||
      activeFilters.customers?.length > 0 ||
      activeFilters.selectedItems?.length > 0 ||
      globalFilter
    )
  ) {
    return null
  }

  // Find item names for selected item IDs
  const selectedItemNames =
    activeFilters.selectedItems?.map((id) => {
      const item = data.find((item) => item.id === id)
      return item ? `${item.itemName} (#${item.itemNumber})` : id
    }) || []

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {globalFilter && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Search: {globalFilter}
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setGlobalFilter("")}>
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      )}
      {activeFilters.types.map((type) => (
        <Badge key={type} variant="secondary" className="flex items-center gap-1">
          Type: {type}
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => handleTypeFilter(type)}>
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      ))}
      {activeFilters.customers?.map((customer) => (
        <Badge key={customer} variant="secondary" className="flex items-center gap-1">
          Customer: {customer}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => handleCustomerFilter?.(customer)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      ))}
      {selectedItemNames.map((name, index) => (
        <Badge key={activeFilters.selectedItems[index]} variant="secondary" className="flex items-center gap-1">
          Item: {name.length > 20 ? name.substring(0, 20) + "..." : name}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1"
            onClick={() => handleItemSelection?.(activeFilters.selectedItems[index])}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAllFilters}>
        Clear all
      </Button>
    </div>
  )
}

