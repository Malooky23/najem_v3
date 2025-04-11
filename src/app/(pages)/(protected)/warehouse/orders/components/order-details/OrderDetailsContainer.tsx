'use client';

import { memo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderNotesCard } from "./OrderNotesCard";
// import { useOrderDetails } from '@/hooks/data-fetcher';
import { Button } from '@/components/ui/button';
import { useOrdersStore, useSelectedOrderId, useSelectedOrderData } from '@/stores/orders-store';
import Loading from '@/components/ui/loading';
import { useOrderByIdQuery } from '@/hooks/data/useOrders';
import { OrderExensesCard } from './OrderExensesCard';


interface OrderDetailsContainerProps {
  isMobile: boolean;
}

export const OrderDetailsContainer = memo(function OrderDetailsContainer({
  isMobile
}: OrderDetailsContainerProps) {
  // Use simpler store selectors to prevent infinite loops
  const orderId = useSelectedOrderId();
  const orderData = useSelectedOrderData();
  const selectOrder = useOrdersStore(state => state.selectOrder);
  console.log("OrderDetailsContainer: ", orderData);

  // Fetch order details when needed
  // const {
  //   isLoading,
  //   isError,
  //   error
  // } = useOrderDetails(orderId);
  const {
    isLoading,
    isError,
    error,
    isSuccess,
    data:freshOrder
  } = useOrderByIdQuery(orderId);
  if(isSuccess){
    console.log(freshOrder)
    selectOrder(freshOrder.orderId, freshOrder)
  }

  const handleClose = useCallback(() => {
    selectOrder(null);
  }, [ selectOrder ]);

  const containerClass = cn(
    isMobile
      ? "h-screen w-screen fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
      : "mb-12 p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg border border-2 border-slate-200 flex flex-col");

  const cardClass = isMobile
    ? "bg-white h-full flex flex-col"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl transition-all hover:shadow-2xl flex flex-col h-full";


  // TEMPORARY HARD CODED ORDER EXPENSES
  const orderExpenses = [
    {
      expenseId: "001",
      expenseName: "Small Sack",
      quantity: 5,
      price: 25
    },
    {
      expenseId: "002",
      expenseName: "Large Sack",
      quantity: 10,
      price: 50
    },
    {
      expenseId: "003",
      expenseName: "Offloading",
      quantity: 5,
      price: 40
    },
  ]

  //   // Loading state
  //   if (isLoading) {
  //   return (
  //     <div className={cn(
  //       containerClass,
  //       isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
  //     )}>
  //       <div className={`max-w-4xl mx-auto mt-0 w-full ${cardClass}`}>
  //         <div className={`${isMobile ? "p-4" : "p-6"}  flex items-center justify-center min-h-[200px]`}>
  //           <Loading />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Error state
  if (isError || !orderData) {
    return (
      <div className={cn(
        containerClass,
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
      )}>
        <div className={`max-w-4xl mx-auto mt-0 w-full ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} text-center text-gray-500`}>
            <p>Error loading order: {error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button
              onClick={handleClose}
              variant="outline"
              className="mt-4"
            >
              Return to Orders List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      containerClass,
      !isMobile && "w-[40%]"
    )}>
      <div className={`max-w-4xl mx-auto w-full h-full ${cardClass}`}>
        {/* Header - fixed at top */}
        {/* <div className={`${isMobile ? "p-4" : "p-6 pb-2 pt-4 border-b"} flex items-center justify-between bg-transparent  z-10 sticky top-0`}>
          <OrderHeader
            isMobile={isMobile}
            handleClose={handleClose}
          />
        </div> */}

        {/* Scrollable content */}
        <div className={`${isMobile ? "px-0 pb-4" : "px-6  pb-6"} overflow-y-auto flex-1`}>
          <div className={`${isMobile ? "pt-2 px-0" : "p-6 pb-2 pt-2 mt-2 border-b"} flex items-center justify-between bg-transparent backdrop-blur-md rounded-lg  z-10 sticky top-0`}>
            <OrderHeader
              isMobile={isMobile}
              handleClose={handleClose}
              isLoading={isLoading}
            />
          </div>
          <div className={`${isMobile && "px-4"}`}>

            <OrderInfoCard
              customerId={orderData.customerId}
              customerName={orderData.customerName}
              orderType={orderData.orderType}
              movement={orderData.movement}
              packingType={orderData.packingType}
              deliveryMethod={orderData.deliveryMethod}
              orderMark={orderData.orderMark ? orderData.orderMark : undefined}
              notes={orderData.notes}
              isLoading={isLoading}

            />


            <OrderItemsTable
              items={orderData.items}
              isLoading={isLoading}
            />
{/* 
            <OrderNotesCard
              notes={orderData.notes || ""}
              orderId={orderData.orderId}
              isLoading={isLoading}

            /> */}

            <OrderExensesCard orderExpenses={orderExpenses}
              isLoading={isLoading}
            />

          </div>
        </div>
      </div>
    </div>
  );
});