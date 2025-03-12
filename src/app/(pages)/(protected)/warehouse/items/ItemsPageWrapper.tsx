"use client"
import { memo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useItemsStore } from "@/stores/items-store"

import { ItemsTable } from "./components/ItemsTable"
import { DetailsPanel } from "./components/details/DetailsPanel"
import { useCustomers, useItems } from "@/hooks/data-fetcher"

import { Skeleton } from "@/components/ui/skeleton"
import CreateItemForm from "./components/CreateItem"

interface PageHeaderProps {
  isLoading: boolean;
}

// Memoized header component
const PageHeader = memo<PageHeaderProps>(function PageHeader({ isLoading }) {
  const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading } = useCustomers();
  
  return (
    <div className="flex items-center justify-between mt-2 mb-4">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
        Items
      </h1>
      
      {isCustomersLoading || !isCustomersSuccess ? (
        <Skeleton className="w-40 h-8" />
      ) : (
        <CreateItemForm />
      )}
    </div>
  );
});

export default function ItemsPageWrapper() {
  // Media query for responsive design
  const isMobile = useMediaQuery("(max-width: 900px)")
  
  // Get store state
  const store = useItemsStore()
  
  // Fetch items using the hook
  const { data: items = [], isLoading } = useItems()
  
  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      <PageHeader isLoading={isLoading} />
      
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Main table content - Always takes full space with padding */}
        <div 
          className={cn(
            "w-full transition-all duration-300 ease-in-out", 
            !isMobile && store.isDetailsOpen && "pr-[30%] bg-red-100"
          )}
        >
          <ItemsTable 
            isMobile={isMobile}
            isLoading={isLoading}
            items={items}
          />
        </div>
        
        {/* Details panel - Fixed positioning for desktop to prevent layout shift */}
        {!isMobile && (
          <div 
            className={cn(
              "absolute top-0 right-0 h-full w-[30%] transition-transform duration-300 ease-in-out bg-white rounded-lg border-2 border-slate-200",
              store.isDetailsOpen 
                ? "translate-x-0" 
                : "translate-x-full pointer-events-none"
            )}
          >
            <DetailsPanel 
              isMobile={isMobile}
              items={items}
            />
          </div>
        )}
        
        {/* Mobile details are handled by the Drawer component in DetailsPanel */}
        {isMobile && (
          <DetailsPanel 
            isMobile={isMobile}
            items={items}
          />
        )}
      </div>
    </div>
  )
}
