
'use client';

import { memo, useCallback, useEffect, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
// import { OrderNotesCard } from "./OrderNotesCard";
import { Button } from '@/components/ui/button';
import { useOrdersStore, useSelectedOrderId, useSelectedOrderData } from '@/stores/orders-store';
import Loading from '@/components/ui/loading';
import { useOrderByIdQuery } from '@/hooks/data/useOrders';
import { OrderExensesCard } from './OrderExensesCard';
interface OrderDetailsContainerProps {
  isMobile: boolean;
  className?: string; // Add className prop here

}

export const OrderDetailsContainer = memo(function OrderDetailsContainer({
  isMobile,
  className

}: OrderDetailsContainerProps) {
  const orderId = useSelectedOrderId();
  const storedOrderData = useSelectedOrderData(); // Data from the store
  const selectOrder = useOrdersStore(state => state.selectOrder);

  const {
    isLoading: isQueryLoading,    // Query is fetching for the first time for this key
    isFetching: isQueryFetching,  // Query is fetching (initial OR background refetch)
    isError,
    error,
    isSuccess,
    data: freshOrder              // Fresh data from the successful query
  } = useOrderByIdQuery(orderId); // Ensure hook handles null/undefined orderId

  // --- Effect to update the store ---
  useEffect(() => {
    if (isSuccess && freshOrder) {
      selectOrder(freshOrder.orderId, freshOrder);
    }
  }, [ isSuccess, freshOrder, selectOrder ]);





  // --- Determine the primary data source to display ---
  const displayData = useMemo(() => {
    return isSuccess ? freshOrder : storedOrderData;
  }, [ isSuccess, freshOrder, storedOrderData ])


  // --- Granular Loading States ---
  const showFullScreenLoading = isQueryLoading && !displayData;

  const showBasicInfoLoading = !displayData;

  const showExpensesLoading = useMemo(() => {
    if (!displayData) return true; // If no data at all, expenses are implicitly loading
    const hasExpenses = displayData.expenses && displayData.expenses.length > 0;
    // Show loading if fetching AND we don't currently have expenses in the data we are showing
    return isQueryFetching && !hasExpenses;
  }, [ displayData, isQueryFetching ]);


  // 5. Determine error state
  const showErrorState = isError || (!isQueryLoading && !isQueryFetching && !displayData && !!orderId);


  const handleClose = useCallback(() => {
    selectOrder(null, null);
  }, [ selectOrder ]);

  // --- Styling ---
  const containerClass = cn(
    "flex flex-col",
    isMobile
      ? "h-screen w-screen fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
      : "mb-12 p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg border border-2 border-slate-200 w-[40%]",
    className
    );

  const cardClass = cn(
    "bg-white/80 backdrop-blur-sm flex flex-col h-full",
    isMobile
      ? ""
      : "rounded-lg shadow-xl transition-all hover:shadow-2xl"
  );


  // --- Render Logic ---

  // 1. Handle No Selected Order
  if (!orderId) {
    return (
      <div className={cn(containerClass, !isMobile && "items-center justify-center")}>
        {!isMobile && <p className="text-gray-500">Select an order to view details.</p>}
      </div>
    );
  }

  // 2. Handle Initial Full Screen Loading State
  if (showFullScreenLoading) {
    return (
      <div className={containerClass}>
        <div className={cn("max-w-4xl mx-auto w-full h-full", cardClass)}>
          <div className={`${isMobile ? "p-4" : "p-6"} flex justify-center items-center h-full`}>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  // 3. Handle Error State
  if (showErrorState) {
    return (
      <div className={containerClass}>
        <div className={cn("max-w-4xl mx-auto w-full h-full", cardClass, isMobile ? "p-4" : "p-6")}>
          <div className="text-center text-red-600">
            <p className='font-semibold mb-2'>Error loading order details.</p>
            {isError && <p className='text-sm text-gray-600 mb-4'>{error instanceof Error ? error.message : 'An unknown error occurred.'}</p>}
            {!isError && !displayData && <p className='text-sm text-gray-600 mb-4'>Order data could not be found.</p>}
            <Button onClick={handleClose} variant="outline" size="sm">
              Close Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Safeguard: If we reach here without displayData (shouldn't happen if logic above is correct)
  if (!displayData) {
    console.error("OrderDetailsContainer reached render stage without displayData. State:", { orderId, isQueryLoading, isQueryFetching, isSuccess, isError, storedOrderData, freshOrder });
    // Show a minimal error/state message
    return (
      <div className={containerClass}>
        <div className={cn("max-w-4xl mx-auto w-full h-full", cardClass, isMobile ? "p-4" : "p-6")}>
          <p className="text-center text-gray-500">Loading order details...</p>
          {/* Optionally add the close button here too */}
          {/* <Button onClick={handleClose} variant="outline" className="mt-4">Close</Button> */}
        </div>
      </div>
    );
  }


  // --- Main Render (displayData is guaranteed to exist here) ---
  return (
    <div className={containerClass}>
      <div className={cn("max-w-4xl mx-auto w-full", cardClass)}>

        {/* Header Section */}
        <div className={`${isMobile ? "pt-2 px-0" : "p-6 pb-2 pt-2 mt-0 border-b"} flex items-center justify-between bg-white/70 backdrop-blur-md rounded-t-lg z-10 sticky top-0`}>
          <OrderHeader
            isMobile={isMobile}
            handleClose={handleClose}
            isLoading={showBasicInfoLoading} // Use the dedicated header loading state
          />
        </div>

        {/* Scrollable Content Area */}
        <div className={`${isMobile ? "px-0 pb-4" : "px-6 pb-6"} overflow-y-auto flex-1`}>
          <div className={`${isMobile ? "px-4" : ""}`}>

            <OrderInfoCard
              // Use displayData, assuming it has the necessary fields
              customerId={displayData.customerId}
              customerName={displayData.customerName}
              orderType={displayData.orderType}
              movement={displayData.movement}
              packingType={displayData.packingType}
              deliveryMethod={displayData.deliveryMethod}
              orderMark={displayData.orderMark}
              notes={displayData.notes}
              status={displayData.status}
              // Pass the specific loading state for basic info
              isLoading={showBasicInfoLoading}
            />

            <OrderItemsTable
              items={displayData.items ?? []}
              // Pass the specific loading state for basic info
              isLoading={showBasicInfoLoading}
            />


            <OrderExensesCard
              orderExpenses={displayData.expenses ?? []}
              // Pass the specific loading state for expenses
              isLoading={showExpensesLoading}
            />

          </div>
        </div>
      </div>
    </div>
  );
});