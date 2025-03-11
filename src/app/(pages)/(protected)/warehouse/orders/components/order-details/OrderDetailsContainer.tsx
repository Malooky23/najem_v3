'use client';

import { memo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderNotesCard } from "./OrderNotesCard";
import { useOrderDetails } from '@/hooks/data-fetcher';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrdersStore } from '@/stores/orders-store';
import { StatusDropdown } from './StatusDropdown';
import Loading from '@/components/ui/loading';

interface OrderDetailsContainerProps {
  orderId: string;
  isMobile: boolean;
}

export const OrderDetailsContainer = memo(function OrderDetailsContainer({
  orderId,
  isMobile
}: OrderDetailsContainerProps) {
  const { selectOrder } = useOrdersStore();
  
  // Fetch detailed order data with optimized hook
  const { 
    data: orderData, 
    isLoading, 
    isError, 
    error 
  } = useOrderDetails(orderId);

  const handleClose = useCallback(() => {
    selectOrder(null);
  }, [selectOrder]);

  // Styling classes based on mobile state
  const containerClass = isMobile
    ? "p-4 h-screen overflow-scroll fixed inset-0 z-50 bg-white"
    : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden";

  const cardClass = isMobile
    ? "bg-white h-full"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl";

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        containerClass,
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
      )}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} flex items-center justify-center min-h-[200px]`}>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !orderData) {
    return (
      <div className={cn(
        containerClass,
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
      )}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
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
      <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
        <div className={isMobile ? "p-4" : "p-6"}>
          {/* Close buttons */}
          {/* {isMobile ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 left-4 z-50" 
              onClick={handleClose}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-50" 
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )} */}

          {/* Order content */}
          <div className="mb-3 flex items-center justify-between">
            {/* <OrderHeader 
              orderNumber={orderData.orderNumber} 
              status={orderData.status}
              createdAt={orderData.createdAt}
            /> */}
            <OrderHeader 
              order={orderData}
              handleClose={handleClose}
            />
            
            {/* <StatusDropdown 
              currentStatus={orderData.status} 
              orderId={orderData.orderId}
            /> */}
          </div>

          <OrderInfoCard
            customerId={orderData.customerId}
            customerName={orderData.customerName}
            orderType={orderData.orderType}
            movement={orderData.movement}
            packingType={orderData.packingType}
            deliveryMethod={orderData.deliveryMethod}
          />

          <OrderItemsTable items={orderData.items} />

          <OrderNotesCard 
            notes={orderData.notes || ""} 
            orderId={orderData.orderId}
          />
        </div>
      </div>
    </div>
  );
});