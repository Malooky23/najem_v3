"use client"
import { memo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useItemsStore } from "@/stores/items-store"
import { SearchPanel } from "./components/SearchPanel"
import { ItemsTable } from "./components/ItemsTable"
import { DetailsPanel } from "./components/details/DetailsPanel"
import { useItems } from "@/hooks/data-fetcher"

interface PageHeaderProps {
  isLoading: boolean;
}

// Memoized header component
const PageHeader = memo<PageHeaderProps>(function PageHeader({ isLoading }) {
  return (
    <div className="flex justify-between mt-2">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
        Items
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

export default function ItemsPage() {
  // Media query for responsive design
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Get store state
  const store = useItemsStore()
  
  // Fetch items using the hook
  const { data: items = [], isLoading } = useItems()
  
  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      <PageHeader isLoading={isLoading} />
      
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden mt-0">
        <ContentLayout 
          isMobile={isMobile} 
          isDetailsOpen={store.isDetailsOpen}
        >
          <ItemsTable 
            isMobile={isMobile}
            isLoading={isLoading}
            items={items}
          />
        </ContentLayout>

        {store.isDetailsOpen && (
          <DetailsPanel 
            isMobile={isMobile}
            items={items}
          />
        )}
      </div>
    </div>
  )
}
