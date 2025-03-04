"use client"

import { useStockMovementContext } from "../../context/stock-movement-context"
import { SearchBar } from "./SearchBar"
import { useCallback } from "react"
import { StockMovementFilters } from "@/types/stockMovement"

export function SearchBarWrapper() {
  const { filters, setFilters } = useStockMovementContext()
  
  const handleFilterChange = useCallback((newFilters: StockMovementFilters) => {
    // Only update if filters actually changed
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters)
    }
  }, [filters, setFilters])

  return (
    <div className="flex justify-between mt-2">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
        Item Movements
      </h1>
      <SearchBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={false} // This will be handled by Suspense boundary
      />
    </div>
  )
}