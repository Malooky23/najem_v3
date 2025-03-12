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
    const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
  
  return (
    <div className="flex justify-between mt-2">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
        Items
      </h1>
      {isCustomersLoading || !isCustomersSuccess ? (
        <Skeleton className="w-40 h-8" />
      ) : (
      <>

        <CreateItemForm />
      </>
      )}
    </div>
  );
});



export default function ItemsPageWrapper() {
  // Media query for responsive design
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Get store state
  const store = useItemsStore()
  
  // Fetch items using the hook
  const { data: items = [], isLoading } = useItems()
  
  return (
    <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
      <PageHeader isLoading={isLoading} />
      
      <div className="flex flex-1 min-h-0 overflow-hidden mt-0 relative  ">
        {/* Main table content with fixed width */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out", 
            isMobile
              ? (store.isDetailsOpen ? "w-0 opacity-0 overflow-hidden" : "w-full flex-1 ")
              : (store.isDetailsOpen ? "w-[70%] mr-2" : "w-full")
          )}
        >
          <ItemsTable 
            isMobile={isMobile}
            isLoading={isLoading}
            items={items}
          />
        </div>
        
        {/* Fixed position details panel */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out",
            isMobile ? "w-full absolute inset-0" : "w-[30%] absolute inset-y-0 right-0 ",
            store.isDetailsOpen 
              ? "opacity-100 translate-x-0" 
              : isMobile 
                  ? "opacity-0 translate-x-full pointer-events-none" 
                  : "opacity-0 translate-x-20 pointer-events-none"
          )}
        >
          <DetailsPanel 
            isMobile={isMobile}
            items={items}
          />
        </div>
      </div>
    </div>
  )
}

//   return (
//     <div className="px-4 h-[calc(100vh-3rem)] flex flex-col">
//       <PageHeader isLoading={isLoading} />
      
//       <div className="flex gap-4 flex-1 min-h-0 overflow-scroll mt-0">
//         <ContentLayout 
//           isMobile={isMobile} 
//           isDetailsOpen={store.isDetailsOpen}
//         >
//           <ItemsTable 
//             isMobile={isMobile}
//             isLoading={isLoading}
//             items={items}
//           />
//         </ContentLayout>

//         {store.isDetailsOpen && (
//           <DetailsPanel 
//             isMobile={isMobile}
//             items={items}
//           />
//         )}
//       </div>
//     </div>
//   )
// }
