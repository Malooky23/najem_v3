
"use client"

import { memo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useOrdersStore } from "@/stores/orders-store"
import { SearchPanel } from "./components/SearchPanel"
import { OrdersTable } from "./components/OrdersTable"
import { OrderDetailsContainer } from "@/components/order-details/OrderDetailsContainer"
import { useUrlSync } from "@/hooks/useUrlSync"
import { QuickAccess } from "@/components/quick-access"
import { CreateOrderDialog } from "@/components/dialogs/OrderDialog/create-order-dialog"


interface PageHeaderProps {
  isLoading: boolean;
  isMobile: boolean;
}



function PageHeader({ isLoading, isMobile }: PageHeaderProps) {
  return (
    <div className="flex justify-between mt-2 pb-2 gap-1 max-w-full">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pb-0 pr-2 flex items-end">
        Orders
      </h1>
      <div className="">
        <SearchPanel isLoading={isLoading} />
      </div>

      <div className="flex gap-2">
        <CreateOrderDialog isMobile={isMobile} />
        <QuickAccess />
      </div>
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
        "flex flex-col rounded-md  duration-100 overflow-hidden",
        isMobile
          ? (isDetailsOpen ? "hidden" : "w-full")
          : (isDetailsOpen ? "w-[60%]" : "w-full")
      )}
    >
      {children}
    </div>
  );
});

export default function OrdersPageWrapper() {
  // Media query for responsive design
  const isMobile = useMediaQuery("(max-width: 768px)")

  const store = useOrdersStore()

  // Setup URL synchronization
  useUrlSync(useOrdersStore, {
    syncedKeys: [ 'page', 'pageSize', 'sortField', 'sortDirection', 'status', 'customerId', 'movement', 'dateFrom', 'dateTo' ]
  });


  return (
    <div className="px-4 h-[100vh] flex flex-col overflow-hidden ">
      <PageHeader isLoading={false} isMobile={isMobile} />

      <div className="flex gap-2 flex-1 min-h-0 overflow-hidden mt-0 ">
        <ContentLayout
          isMobile={isMobile}
          isDetailsOpen={store.isDetailsOpen}
        >

          <OrdersTable
            isMobile={isMobile}
            // onLoadingChange={handleLoadingChange}
          />

        </ContentLayout>


        <div className={cn(
          ' ',
          "flex flex-col rounded-md  overflow-hidden",
          isMobile ? "w-full" : "w-[40%]",
          store.isDetailsOpen ? "ml-2" : "hidden",
          // !isMobile && !store.isDetailsOpen && "hidden", // Hide on desktop when details are closed
          // "transition-width duration-100", // Enable transition for width
          "origin-right", // Animate from right to left
        )}
        >
          <OrderDetailsContainer
            isMobile={isMobile}
            className="w-full h-full"
          />
        </div>

      </div>
    </div>
  )
}