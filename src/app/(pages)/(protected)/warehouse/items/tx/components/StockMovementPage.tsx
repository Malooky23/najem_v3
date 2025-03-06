"use client"
import { useEffect, useState, useCallback, memo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useStockMovementStore } from "@/stores/stock-movement-store"
import { SearchPanel } from "./SearchPanel"
import { MovementsTable } from "./MovementsTable"
import { DetailsPanel } from "./details/DetailsPanel"
import { useUrlSync } from "@/hooks/useUrlSync"

interface PageHeaderProps {
  isLoading: boolean;
}

// Memoized header component
const PageHeader = memo<PageHeaderProps>(function PageHeader({ isLoading }) {
  return (
    <div className="flex justify-between mt-2">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
        Item Movements
      </h1>
      <SearchPanel isLoading={isLoading} />
    </div>
  );
});

// Memoized content layout component
const ContentLayout = memo<{
  isMobile: boolean;
  isDetailsOpen: boolean;
  children: React.ReactNode;
}>(function ContentLayout({ isMobile, isDetailsOpen, children }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md transition-all duration-300",
        isMobile 
          ? (isDetailsOpen ? "hidden" : "w-full") 
          : (isDetailsOpen ? "w-[40%]" : "w-full")
      )}
    >
      {children}
    </div>
  );
});

export function StockMovementPage() {
  // Media query for responsive design
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Loading state with debounce to prevent flashing
  const [isPageLoading, setIsPageLoading] = useState(true)
  const handleLoadingChange = useCallback((loading: boolean) => {
    // Small delay to prevent loading flash
    if (loading) {
      setIsPageLoading(true)
    } else {
      const timer = setTimeout(() => setIsPageLoading(false), 100)
      return () => clearTimeout(timer)
    }
  }, [])
  
  // Get store state
  const store = useStockMovementStore()
  
  // Setup URL synchronization
  useUrlSync()
  
  // Reset loading state after initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 0)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      <PageHeader isLoading={isPageLoading} />
      
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden mt-0">
        <ContentLayout 
          isMobile={isMobile} 
          isDetailsOpen={store.isDetailsOpen}
        >
          <MovementsTable 
            isMobile={isMobile}
            onLoadingChange={handleLoadingChange}
          />
        </ContentLayout>

        {store.isDetailsOpen && (
          <DetailsPanel isMobile={isMobile} />
        )}
      </div>
    </div>
  )
}
