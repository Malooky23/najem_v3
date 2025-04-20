"use client"
import { useEffect, useState, useCallback, memo } from "react"
import { useIsMobileTEST, useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useStockMovementStore } from "@/stores/stock-movement-store"
import { SearchPanel } from "./SearchPanel"
import { MovementsTable } from "./MovementsTable"
import { DetailsPanel } from "./details/DetailsPanel"
import { useUrlSync } from "@/hooks/useUrlSync"
import { DropDownMenuButton } from "@/components/drop-down-menu-button"
import { useOrdersStore } from "@/stores/orders-store"

interface PageHeaderProps {
  isLoading: boolean;
}

// const createOptions = [
//   { id: "1", label: "Create" },
//   { id: "2", label: "Import" },
//   { id: "3", label: "Export" },
//   { id: "4", label: "Print" },
// ];


function PageHeader({ isLoading }: PageHeaderProps) {
  return (
    <div className="flex justify-between mt-2 gap-1 max-w-full">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
        Item Movements
      </h1>
      <div className="pl-16">
        <SearchPanel isLoading={isLoading} />
      </div>
      {/* <div className="pr-2">
        <DropDownMenuButton MENU_ITEMS={createOptions} />
      </div> */}
    </div>
  );
}
// Memoized content layout component
const ContentLayout = memo<{
  isMobile: boolean;
  isDetailsOpen: boolean;
  children: React.ReactNode;
}>(function ContentLayout({ isMobile, isDetailsOpen, children }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md transition-all duration-300 overflow-hidden", // Add overflow-hidden
        isMobile
          ? (isDetailsOpen ? "hidden" : "w-full")
          : (isDetailsOpen ? "w-[60%]" : "w-full")
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
    useUrlSync(useStockMovementStore, {
        syncedKeys: ['page', 'pageSize', 'sortField', 'sortDirection', 'search', 'movement', 'itemName', 'customerDisplayName', 'dateFrom', 'dateTo']
    });

  return (
    // <div className="px-4 h-full flex flex-col overflow-hidden"> {/* Add overflow-hidden */}
    <div className="px-4 h-[100vh] flex flex-col overflow-hidden"> {/* Add overflow-hidden */}
      <PageHeader isLoading={isPageLoading} />

      <div className="flex gap-2 flex-1 min-h-0 overflow-hidden mt-0">
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
