"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useOrdersStore } from "@/stores/orders-store"
import { SearchPanel } from "./SearchPanel"
import { OrdersTable } from "./OrdersTable"
import { OrderDetailsContainer } from "./order-details/OrderDetailsContainer"
import { useUrlSync } from "@/hooks/useUrlSync"
import { DropDownMenuButton } from "@/components/drop-down-menu-button"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { is } from "drizzle-orm"
import { CreateOrderDialog } from "./order-form/create-order-dialog"
import { useErrorDialog } from "@/hooks/useErrorDialog"

interface PageHeaderProps {
  isLoading: boolean;
  isMobile: boolean;
}

const createOptions = [
  { id: "1", label: "Import" },
  { id: "2", label: "Export" },
  { id: "3", label: "Print" },
];

// Original implementation
// function PageHeader({ isLoading }: PageHeaderProps) {
//   return (
//     <div className="flex justify-between mt-2 gap-1 max-w-full">
//       <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-2">
//         Orders
//       </h1>
//       <div className="">
//         <SearchPanel isLoading={isLoading} />
//       </div>
//       <div className="flex gap-2 pr-2">
//         <Link href="/warehouse/orders/create">
//           <Button>
//             <Plus className="mr-1 h-4 w-4" /> New Order
//           </Button>
//         </Link>
//         <DropDownMenuButton MENU_ITEMS={createOptions} />
//       </div>
//     </div>
//   );
// }

function PageHeader({ isLoading, isMobile }: PageHeaderProps) {
  const [isCreateOpen, setisCreateOpen] = useState(false)
  return (
    <div className="flex justify-between mt-2 pb-2 gap-1 max-w-full">
      <h1 className="text-2xl font-bold text-gray-900 text-nowrap pb-0 pr-2 flex items-end">
          Orders
      </h1>
      <div className="">
        <SearchPanel isLoading={isLoading} />
      </div>

        <CreateOrderDialog isMobile={isMobile} />

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
        "flex flex-col rounded-md transition-all duration-300 overflow-hidden",
        isMobile
          ? (isDetailsOpen ? "hidden" : "w-full")
          : (isDetailsOpen ? "w-[60%]" : "w-full")
      )}
    >
      {children}
    </div>
  );
});

export function OrdersPage() {
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
  const store = useOrdersStore()

  // Setup URL synchronization
  useUrlSync(useOrdersStore, {
    syncedKeys: ['page', 'pageSize', 'sortField', 'sortDirection', 'status', 'customerId', 'movement', 'dateFrom', 'dateTo']
  });

  // Reset loading state after initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 0)
    return () => clearTimeout(timer)
  }, [])


  const { showErrorDialog, ErrorDialogComponent } = useErrorDialog()


  return (
    <div className="px-4 h-[100vh] flex flex-col overflow-hidden">
      <PageHeader isLoading={isPageLoading} isMobile={isMobile} />

      <div className="flex gap-2 flex-1 min-h-0 overflow-hidden mt-0">
        <ContentLayout
          isMobile={isMobile}
          isDetailsOpen={store.isDetailsOpen}
        >
          <OrdersTable
            isMobile={isMobile}
            onLoadingChange={handleLoadingChange}
          />
        </ContentLayout>

        {store.isDetailsOpen && store.selectedOrderId && (
          <OrderDetailsContainer
            // orderId={store.selectedOrderId}
            isMobile={isMobile}
          />
        )}
      </div>
      <ErrorDialogComponent/>
    </div>
  )
}