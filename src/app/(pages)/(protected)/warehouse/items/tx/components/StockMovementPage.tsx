"use client"
import { useEffect, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useStockMovementStore } from "@/stores/stock-movement-store"
import { SearchPanel } from "./SearchPanel"
import { MovementsTable } from "./MovementsTable"
import { DetailsPanel } from "./DetailsPanel"
import { useUrlSync } from "@/hooks/useUrlSync"

export function StockMovementPage() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Get state from store
  const store = useStockMovementStore()
  
  // Setup URL synchronization at the top level
  useUrlSync()
  
  // Reset loading state after initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 0)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex justify-between mt-2">
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
          Item Movements
        </h1>
        <SearchPanel isLoading={isPageLoading} />
      </div>
      
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden mt-0">
        {/* Table Section */}
        <div
          className={cn(
            "flex flex-col rounded-md transition-all duration-300",
            isMobile ? (store.isDetailsOpen ? "hidden" : "w-full") : (store.isDetailsOpen ? "w-[40%]" : "w-full"),
          )}
        >
          <MovementsTable 
            isMobile={isMobile}
            onLoadingChange={setIsPageLoading}
          />
        </div>

        {/* Details Panel */}
        {store.isDetailsOpen && (
          <DetailsPanel isMobile={isMobile} />
        )}
      </div>
    </div>
  )
}
